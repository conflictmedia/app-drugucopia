/// Native "save to Downloads" command.
///
/// On Android the WebView silently ignores `<a download>` clicks for blob: URLs,
/// so the standard browser-side export technique used in `dose-history.tsx`
/// does nothing. This command writes the file directly to the user's public
/// Downloads directory via the Android `MediaStore` (API 29+) or a direct
/// file-path write (API < 29), going through the `DownloadsHelper` Kotlin
/// object via JNI.
///
/// On desktop (Linux / macOS / Windows) it writes to the OS Downloads folder,
/// which is useful when the app is packaged as a Tauri desktop binary.
///
/// On the web (PWA) this command is never invoked — the caller falls back to
/// the browser blob-URL download technique.
use tauri::command;

/// Save `content` as `file_name` in the user's Downloads directory.
///
/// Returns the absolute path (or MediaStore URI on Android 10+) on success.
#[command]
pub fn save_to_downloads(
    app: tauri::AppHandle,
    file_name: String,
    content: String,
) -> Result<String, String> {
    // Basic sanitisation: strip path separators — only the file name is allowed.
    let safe_name = std::path::Path::new(&file_name)
        .file_name()
        .and_then(|s| s.to_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "export.bin".to_string());

    #[cfg(target_os = "android")]
    {
        use std::sync::mpsc;
        use std::time::Duration;
        use tauri::Manager;

        let (tx, rx) = mpsc::channel();

        let webview_window = match app.get_webview_window("main") {
            Some(w) => w,
            None => {
                return Err("no main webview window available".into());
            }
        };

        let file_name = safe_name.clone();
        let content = content.clone();

        let result = webview_window.with_webview(move |wv| {
            wv.jni_handle().exec(move |env, activity, _webview| {
                let result: Result<String, String> = (|| {
                    use jni::objects::JValue;

                    let j_name = match env.new_string(&file_name) {
                        Ok(s) => s,
                        Err(e) => return Err(format!("new_string name: {e:?}")),
                    };
                    let j_content = match env.new_string(&content) {
                        Ok(s) => s,
                        Err(e) => return Err(format!("new_string content: {e:?}")),
                    };

                    let class = match env.find_class("com/drugucopiadev/app/DownloadsHelper") {
                        Ok(c) => c,
                        Err(e) => {
                            let _ = env.exception_clear();
                            return Err(format!("find_class DownloadsHelper: {e:?}"));
                        }
                    };

                    let call_result = env.call_static_method(
                        &class,
                        "saveToDownloads",
                        "(Landroid/content/Context;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",
                        &[
                            JValue::Object(&activity),
                            JValue::Object(&j_name),
                            JValue::Object(&j_content),
                        ],
                    );

                    // Always check for a Java exception before touching the result.
                    if let Ok(true) = env.exception_check() {
                        let _ = env.exception_describe();
                        let _ = env.exception_clear();
                        eprintln!(
                            "[downloads] Java exception in saveToDownloads() — cleared to prevent crash"
                        );
                        return Err("java exception in saveToDownloads()".into());
                    }

                    let jvalue = match call_result {
                        Ok(v) => v,
                        Err(e) => return Err(format!("call saveToDownloads: {e:?}")),
                    };

                    let jobj = match jvalue.l() {
                        Ok(o) => o,
                        Err(e) => return Err(format!("cast result to object: {e:?}")),
                    };

                    // A null return means the Kotlin side refused (e.g. permission
                    // denied on pre-Q devices). Surface it as an error to the JS side.
                    if jobj.is_null() {
                        return Err("DownloadsHelper.saveToDownloads() returned null".into());
                    }

                    let jstr: jni::objects::JString = jobj.into();
                    let rust_string: String = match env.get_string(&jstr) {
                        Ok(s) => s.into(),
                        Err(e) => return Err(format!("get_string: {e:?}")),
                    };
                    Ok(rust_string)
                })();

                let _ = tx.send(result);
            });
        });

        if let Err(e) = result {
            eprintln!("[downloads] with_webview failed: {e}");
            return Err(format!("with_webview failed: {e}"));
        }

        match rx.recv_timeout(Duration::from_millis(3000)) {
            Ok(inner) => inner,
            Err(mpsc::RecvTimeoutError::Timeout) => {
                Err("JNI call timed out after 3000ms".into())
            }
            Err(e) => Err(format!("channel recv failed: {e:?}")),
        }
    }

    #[cfg(not(target_os = "android"))]
    {
        let _ = app; // unused on desktop

        let downloads_dir = desktop_downloads_dir()
            .ok_or_else(|| "Could not determine Downloads directory".to_string())?;

        if !downloads_dir.exists() {
            std::fs::create_dir_all(&downloads_dir)
                .map_err(|e| format!("Failed to create Downloads dir: {e}"))?;
        }

        let file_path = downloads_dir.join(&safe_name);
        std::fs::write(&file_path, &content)
            .map_err(|e| format!("Failed to write file: {e}"))?;

        Ok(file_path.to_string_lossy().into_owned())
    }
}

/// Resolve the OS Downloads directory on desktop platforms without pulling in
/// the `dirs` crate (keeps the dependency footprint unchanged).
#[cfg(not(target_os = "android"))]
fn desktop_downloads_dir() -> Option<std::path::PathBuf> {
    // 1. Honor an explicit $DOWNLOADS / XDG_DOWNLOAD_DIR if the user set one.
    if let Ok(p) = std::env::var("XDG_DOWNLOAD_DIR") {
        if !p.is_empty() {
            return Some(std::path::PathBuf::from(p));
        }
    }
    if let Ok(p) = std::env::var("DOWNLOADS") {
        if !p.is_empty() {
            return Some(std::path::PathBuf::from(p));
        }
    }

    // 2. Look for $HOME/Downloads (Linux/macOS) or %USERPROFILE%\Downloads (Windows).
    let home_var = if cfg!(target_os = "windows") {
        "USERPROFILE"
    } else {
        "HOME"
    };
    let home = std::env::var(home_var).ok()?;
    if home.is_empty() {
        return None;
    }
    Some(std::path::PathBuf::from(home).join("Downloads"))
}

