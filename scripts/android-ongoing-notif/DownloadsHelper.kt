package com.drugucopiadev.app

import android.content.ContentValues
import android.content.Context
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import androidx.annotation.Keep
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStream

/**
 * Writes JSON/CSV exports to Android's public Downloads collection.
 *
 * Android WebView does not reliably support downloads whose source is a blob
 * URL. Rust therefore invokes this helper through JNI. Android 10+ uses
 * MediaStore (no storage permission is needed); older Android versions write
 * to the public Downloads directory and need WRITE_EXTERNAL_STORAGE.
 *
 * A non-null return is deliberately reserved for a verified public write. The
 * Rust/TypeScript layers use that distinction to avoid claiming that a file is
 * in Downloads when it was only written to app-private storage.
 */
// Release APKs enable R8. This class is reached only through JNI, so without
// @Keep the shrinker sees no Kotlin/Java caller and removes it from the APK.
@Keep
object DownloadsHelper {
    private const val TAG = "DownloadsHelper"

    /** Save an in-memory UTF-8 string. Kept for compatibility with older Rust builds. */
    @JvmStatic
    fun saveToDownloads(context: Context, fileName: String, content: String): String? {
        val bytes = content.toByteArray(Charsets.UTF_8)
        return save(context, fileName, ByteArrayInputStream(bytes), bytes.size.toLong())
    }

    /**
     * Copy a temporary app-private file into public Downloads.
     *
     * Passing a path rather than the whole JSON document through JNI avoids
     * large Java strings and makes large dose-history exports reliable.
     */
    @JvmStatic
    fun saveFileToDownloads(context: Context, fileName: String, sourcePath: String): String? {
        return try {
            val source = File(sourcePath)
            if (!source.isFile) {
                throw IllegalArgumentException("Export source does not exist: $sourcePath")
            }
            source.inputStream().buffered().use { input ->
                saveOrThrow(context, safeFileName(fileName), input, source.length())
            }
        } catch (e: Exception) {
            Log.e(TAG, "saveFileToDownloads failed for $fileName", e)
            null
        }
    }

    private fun save(
        context: Context,
        fileName: String,
        input: InputStream,
        expectedBytes: Long
    ): String? {
        return try {
            input.use {
                saveOrThrow(context, safeFileName(fileName), it, expectedBytes)
            }
        } catch (e: Exception) {
            Log.e(TAG, "saveToDownloads failed for $fileName", e)
            null
        }
    }

    private fun saveOrThrow(
        context: Context,
        safeName: String,
        input: InputStream,
        expectedBytes: Long
    ): String {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return saveViaMediaStore(context, safeName, input, expectedBytes)
        }
        return saveViaDirectPath(context, safeName, input, expectedBytes)
    }

    // Android 10+ (API 29+): scoped-storage-safe public Downloads write.
    private fun saveViaMediaStore(
        context: Context,
        fileName: String,
        input: InputStream,
        expectedBytes: Long
    ): String {
        val resolver = context.contentResolver
        val collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, mimeFor(fileName))
            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            put(MediaStore.MediaColumns.IS_PENDING, 1)
        }

        val uri: Uri = resolver.insert(collection, values)
            ?: throw IllegalStateException("MediaStore refused to create Downloads/$fileName")

        try {
            val copied = resolver.openOutputStream(uri, "w")?.use { output ->
                val count = input.copyTo(output)
                output.flush()
                count
            } ?: throw IllegalStateException("Could not open MediaStore output stream for $uri")

            if (copied != expectedBytes) {
                throw IllegalStateException("Incomplete export: copied $copied of $expectedBytes bytes")
            }

            // Pending rows are hidden from Files and other apps. Do not report
            // success unless MediaStore confirms that the row was published.
            val published = resolver.update(
                uri,
                ContentValues().apply { put(MediaStore.MediaColumns.IS_PENDING, 0) },
                null,
                null
            )
            if (published != 1) {
                throw IllegalStateException("MediaStore did not publish $uri (updated $published rows)")
            }

            // Verify the published row still exists, has the expected name and
            // is no longer pending before returning success to Rust.
            val projection = arrayOf(
                MediaStore.MediaColumns.DISPLAY_NAME,
                MediaStore.MediaColumns.SIZE,
                MediaStore.MediaColumns.IS_PENDING
            )
            resolver.query(uri, projection, null, null, null)?.use { cursor ->
                if (!cursor.moveToFirst()) {
                    throw IllegalStateException("Published export cannot be queried: $uri")
                }
                val actualName = cursor.getString(0)
                val actualSize = cursor.getLong(1)
                val pending = cursor.getInt(2)
                if (actualName != fileName || actualSize != expectedBytes || pending != 0) {
                    throw IllegalStateException(
                        "Export verification failed (name=$actualName, size=$actualSize, pending=$pending)"
                    )
                }
            } ?: throw IllegalStateException("MediaStore returned no cursor for $uri")

            return "${Environment.DIRECTORY_DOWNLOADS}/$fileName"
        } catch (e: Exception) {
            // Never leave a broken/pending entry in the Downloads collection.
            try { resolver.delete(uri, null, null) } catch (_: Exception) {}
            throw e
        }
    }

    // Android 9 and earlier: public path (manifest permission required).
    @Suppress("DEPRECATION")
    private fun saveViaDirectPath(
        context: Context,
        fileName: String,
        input: InputStream,
        expectedBytes: Long
    ): String {
        if (Environment.getExternalStorageState() != Environment.MEDIA_MOUNTED) {
            throw IllegalStateException("Shared storage is not mounted")
        }

        val downloadsDir = Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_DOWNLOADS
        )
        if ((!downloadsDir.exists() && !downloadsDir.mkdirs()) || !downloadsDir.isDirectory) {
            throw IllegalStateException("Could not create public Downloads directory")
        }

        val destination = File(downloadsDir, fileName)
        val partial = File(downloadsDir, ".$fileName.part")
        try {
            val copied = partial.outputStream().buffered().use { output ->
                val count = input.copyTo(output)
                output.flush()
                count
            }
            if (copied != expectedBytes || partial.length() != expectedBytes) {
                throw IllegalStateException("Incomplete export: copied $copied of $expectedBytes bytes")
            }
            if (destination.exists() && !destination.delete()) {
                throw IllegalStateException("Could not replace existing $destination")
            }
            if (!partial.renameTo(destination)) {
                throw IllegalStateException("Could not publish $destination")
            }
        } catch (e: Exception) {
            partial.delete()
            throw e
        }

        // Ensure legacy Files/download apps are notified about the new file.
        MediaScannerConnection.scanFile(
            context,
            arrayOf(destination.absolutePath),
            arrayOf(mimeFor(fileName)),
            null
        )
        return destination.absolutePath
    }

    private fun safeFileName(fileName: String): String {
        val safe = fileName.replace('\\', '/').substringAfterLast('/').trim()
        require(safe.isNotEmpty() && safe != "." && safe != "..") { "Invalid export file name" }
        require(safe.none { it == '\u0000' || it == '/' || it == '\\' }) { "Invalid export file name" }
        return safe
    }

    private fun mimeFor(fileName: String): String = when {
        fileName.endsWith(".json", ignoreCase = true) -> "application/json"
        fileName.endsWith(".csv", ignoreCase = true) -> "text/csv"
        fileName.endsWith(".txt", ignoreCase = true) -> "text/plain"
        else -> "application/octet-stream"
    }
}
