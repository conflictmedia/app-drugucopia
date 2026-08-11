package com.drugucopiadev.app

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import java.io.File
import java.io.OutputStream

/**
 * Writes a text file (e.g. JSON / CSV exports) into the user's public
 * **Downloads** directory on Android.
 *
 * Why this exists:
 *  The Tauri Android WebView silently ignores `<a download href="blob:...">`
 *  clicks, so the standard web export technique used by the dose-history UI
 *  produces nothing on device. This helper is invoked from Rust via JNI
 *  (see `src-tauri/src/downloads.rs` → `save_to_downloads` command), which is
 *  in turn invoked from TypeScript when `isTauri()` is true.
 *
 * Behaviour:
 *  - API 29+ (Android 10+): uses the `MediaStore.Downloads` collection so the
 *    file is visible in the system Files / Downloads app without requiring
 *    `WRITE_EXTERNAL_STORAGE` (scoped storage friendly).
 *  - API < 29: writes directly to
 *    `Environment.getExternalStoragePublicDirectory(DIRECTORY_DOWNLOADS)`.
 *  - If a file with the same name already exists in Downloads, it is replaced
 *    (matching the user expectation for an "Export" action).
 *
 * Returns:
 *  - The `content://` URI (API 29+) or absolute file path (API < 29) on success.
 *  - `null` on failure — the Rust side surfaces this as an error to JS.
 */
object DownloadsHelper {

    /**
     * Save [content] as [fileName] in the public Downloads directory.
     *
     * @param context  Android context (Activity) — passed in from Rust via JNI.
     * @param fileName File name only (no path); e.g. "dose-history-2026-08-11.json".
     * @param content  UTF-8 text content to write.
     * @return The URI/path of the saved file, or null on failure.
     */
    @JvmStatic
    fun saveToDownloads(context: Context, fileName: String, content: String): String? {
        return try {
            // Strip any path components sneaked in — only the file name is allowed.
            val safeName = File(fileName).name

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveViaMediaStore(context, safeName, content)
            } else {
                saveViaDirectPath(safeName, content)
            }
        } catch (e: Exception) {
            android.util.Log.e("DownloadsHelper", "saveToDownloads failed for $fileName", e)
            null
        }
    }

    // ─── Android 10+ (API 29+): MediaStore ─────────────────────────────────────

    private fun saveViaMediaStore(context: Context, fileName: String, content: String): String {
        val resolver = context.contentResolver
        val mimeType = mimeFor(fileName)

        val collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)

        // Replace any existing file with the same name so exports always
        // reflect the latest data (otherwise MediaStore would auto-rename
        // to "dose-history-2026-08-11 (1).json" etc.).
        try {
            resolver.delete(
                collection,
                "${MediaStore.Downloads.DISPLAY_NAME} = ?",
                arrayOf(fileName)
            )
        } catch (_: Exception) {
            // Deletion of a non-existing row is a no-op; ignore failures here.
        }

        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, fileName)
            put(MediaStore.Downloads.MIME_TYPE, mimeType)
            put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            put(MediaStore.Downloads.IS_PENDING, 1)
        }

        val uri: Uri = resolver.insert(collection, values)
            ?: throw RuntimeException("MediaStore.insert() returned null for $fileName")

        try {
            resolver.openOutputStream(uri, "w")?.use { os: OutputStream ->
                os.write(content.toByteArray(Charsets.UTF_8))
                os.flush()
            } ?: throw RuntimeException("Failed to open output stream for $uri")

            // Mark the entry as complete — without this the file remains
            // "pending" and is invisible to other apps.
            val finalize = ContentValues().apply {
                put(MediaStore.Downloads.IS_PENDING, 0)
            }
            resolver.update(uri, finalize, null, null)
        } catch (e: Exception) {
            // Clean up the half-created entry to avoid leaving a pending
            // file lying around in MediaStore.
            try { resolver.delete(uri, null, null) } catch (_: Exception) {}
            throw e
        }

        return uri.toString()
    }

    // ─── Android 9 and earlier: direct file path ───────────────────────────────

    private fun saveViaDirectPath(fileName: String, content: String): String {
        @Suppress("DEPRECATION")
        val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        if (!downloadsDir.exists()) {
            downloadsDir.mkdirs()
        }

        val file = File(downloadsDir, fileName)
        // Replace existing file (matches MediaStore branch behaviour).
        if (file.exists()) {
            file.delete()
        }
        file.writeText(content, Charsets.UTF_8)
        return file.absolutePath
    }

    private fun mimeFor(fileName: String): String = when {
        fileName.endsWith(".json", ignoreCase = true) -> "application/json"
        fileName.endsWith(".csv", ignoreCase = true)  -> "text/csv"
        fileName.endsWith(".txt", ignoreCase = true)  -> "text/plain"
        else -> "application/octet-stream"
    }
}
