/// Native "save to Downloads" command.
///
/// On Android the WebView silently ignores `<a download>` clicks for blob: URLs,
/// so the standard browser-side export technique used in `dose-history.tsx`
/// does nothing. This command writes the file directly to the user's public
/// Downloads directory via the Android `MediaStore` (API 29+) or a direct
/// file-path write (API < 29), going through the `DownloadsHelper` Kotlin
/// object via JNI.
///
/// On desktop (Linux / macOS / Windows) and iOS it writes to the OS Downloads
/// folder (with Documents / app-data fallbacks).
///
/// On the web (PWA) this command is never invoked — the caller falls back to
/// the browser blob-URL download technique.
use tauri::command;
use tauri::Manager;

/// Save `content` as `filename` in the user's Downloads directory.
///
/// Accepts `filename` / `file_name` / `fileName` so the JS invoke payload
/// matches regardless of Tauri's camelCase argument rewrite.
///
/// Returns the absolute path (or MediaStore URI on Android 10+) on success.
#[command]
pub fn save_to_downloads(
    app: tauri::AppHandle,
    content: String,
    filename: Option<String>,
    file_name: Option<String>,
) -> Result<String, String> {
    let requested = filename
        .or(file_name)
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "export.bin".to_string());

    // Strip Unix and Windows path components — only a file name is allowed.
    let safe_name = safe_export_filename(&requested);

    #[cfg(target_os = "android")]
    {
        // Do not fall back to app-private storage here. A private write is not
        // visible in the user's Downloads folder, and returning Ok would make
        // the UI show a false "Saved to Downloads" confirmation. The caller
        // can offer Android's share sheet when this public MediaStore write
        // genuinely fails.
        save_android(&app, &safe_name, &content).map_err(|e| {
            eprintln!("[downloads] public Android Downloads write failed: {e}");
            e
        })
    }

    #[cfg(not(target_os = "android"))]
    {
        write_to_first_writable(&app, &safe_name, &content)
    }
}

fn safe_export_filename(requested: &str) -> String {
    let leaf = requested
        .rsplit(['/', '\\'])
        .next()
        .map(str::trim)
        .filter(|name| !name.is_empty() && *name != "." && *name != "..")
        .filter(|name| !name.chars().any(char::is_control));

    leaf.unwrap_or("export.bin").to_string()
}

/// Try Tauri's path resolver, then $HOME/Downloads, then Documents / app data.
#[cfg(not(target_os = "android"))]
fn write_to_first_writable(
    app: &tauri::AppHandle,
    safe_name: &str,
    content: &str,
) -> Result<String, String> {
    let mut candidates: Vec<std::path::PathBuf> = Vec::new();

    if let Ok(dir) = app.path().download_dir() {
        candidates.push(dir);
    }
    if let Some(dir) = env_downloads_dir() {
        candidates.push(dir);
    }
    if let Ok(dir) = app.path().document_dir() {
        candidates.push(dir);
    }
    if let Ok(dir) = app.path().app_local_data_dir() {
        candidates.push(dir.join("exports"));
    }
    if let Ok(dir) = app.path().app_cache_dir() {
        candidates.push(dir.join("exports"));
    }

    // Dedup while preserving order.
    let mut seen = std::collections::HashSet::new();
    candidates.retain(|p| seen.insert(p.clone()));

    if candidates.is_empty() {
        return Err("Could not determine a writable export directory".to_string());
    }

    let mut last_err = "No writable export directory found".to_string();
    for dir in candidates {
        if let Err(e) = std::fs::create_dir_all(&dir) {
            last_err = format!("Failed to create {}: {e}", dir.display());
            continue;
        }
        let file_path = dir.join(safe_name);
        match std::fs::write(&file_path, content) {
            Ok(()) => return Ok(file_path.to_string_lossy().into_owned()),
            Err(e) => last_err = format!("Failed to write {}: {e}", file_path.display()),
        }
    }
    Err(last_err)
}

#[cfg(not(target_os = "android"))]
fn env_downloads_dir() -> Option<std::path::PathBuf> {
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

#[cfg(target_os = "android")]
fn save_android(app: &tauri::AppHandle, safe_name: &str, content: &str) -> Result<String, String> {
    use std::sync::mpsc;
    use std::time::Duration;

    // Write a temp file first so JNI only has to pass two short strings.
    // Large JSON histories used to be copied into a Java String, which is
    // slow and can trip the 3s timeout.
    let cache_dir = app
        .path()
        .app_cache_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|e| format!("no cache dir: {e}"))?;
    std::fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("create cache dir {}: {e}", cache_dir.display()))?;
    let unique = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let tmp_path = cache_dir.join(format!("export-{unique}-{safe_name}"));
    std::fs::write(&tmp_path, content).map_err(|e| format!("write temp export: {e}"))?;
    let tmp_path_str = tmp_path.to_string_lossy().into_owned();

    let (tx, rx) = mpsc::channel();

    let webview_window = match app.get_webview_window("main") {
        Some(window) => window,
        None => {
            let _ = std::fs::remove_file(&tmp_path);
            return Err("no main webview window available".to_string());
        }
    };

    let file_name = safe_name.to_string();
    let content_owned = content.to_string();

    let result = webview_window.with_webview(move |wv| {
        wv.jni_handle().exec(move |env, activity, _webview| {
            // All JNI must stay in this closure. Helper fns that bind
            // JNIEnv<'a> + JObject<'a> to one lifetime fail to compile
            // against Tauri's exec callback (`&mut JNIEnv<'2>`, `&JObject<'1>`).
            let result: Result<String, String> = (|| {
                use jni::objects::JValue;

                let j_name = match env.new_string(&file_name) {
                    Ok(s) => s,
                    Err(e) => return Err(format!("new_string name: {e:?}")),
                };
                let j_tmp = match env.new_string(&tmp_path_str) {
                    Ok(s) => s,
                    Err(e) => return Err(format!("new_string tmp: {e:?}")),
                };

                // FindClass is unreliable from a native-attached Android
                // thread because it can use the bootstrap class loader. Load
                // the helper with the Activity's application class loader and
                // derive the package from the running APK instead of hardcoding
                // the dev/release applicationIds.
                macro_rules! jni_call {
                    ($expr:expr, $label:literal) => {
                        match $expr {
                            Ok(value) => value,
                            Err(e) => {
                                if let Ok(true) = env.exception_check() {
                                    let _ = env.exception_describe();
                                    let _ = env.exception_clear();
                                }
                                return Err(format!("{}: {e:?}", $label));
                            }
                        }
                    };
                }

                let package_value = jni_call!(
                    env.call_method(
                        &activity,
                        "getPackageName",
                        "()Ljava/lang/String;",
                        &[],
                    ),
                    "getPackageName"
                );
                let package_obj = match package_value.l() {
                    Ok(value) if !value.is_null() => value,
                    Ok(_) => return Err("getPackageName returned null".into()),
                    Err(e) => return Err(format!("getPackageName result: {e:?}")),
                };
                let package_jstr: jni::objects::JString = package_obj.into();
                let package_name: String = match env.get_string(&package_jstr) {
                    Ok(value) => value.into(),
                    Err(e) => return Err(format!("read package name: {e:?}")),
                };

                let loader_value = jni_call!(
                    env.call_method(
                        &activity,
                        "getClassLoader",
                        "()Ljava/lang/ClassLoader;",
                        &[],
                    ),
                    "getClassLoader"
                );
                let class_loader = match loader_value.l() {
                    Ok(value) if !value.is_null() => value,
                    Ok(_) => return Err("getClassLoader returned null".into()),
                    Err(e) => return Err(format!("getClassLoader result: {e:?}")),
                };

                let helper_name = format!("{package_name}.DownloadsHelper");
                let j_helper_name = match env.new_string(&helper_name) {
                    Ok(value) => value,
                    Err(e) => return Err(format!("new_string helper class: {e:?}")),
                };
                let class_value = jni_call!(
                    env.call_method(
                        &class_loader,
                        "loadClass",
                        "(Ljava/lang/String;)Ljava/lang/Class;",
                        &[JValue::Object(&j_helper_name)],
                    ),
                    "loadClass DownloadsHelper"
                );
                let class_obj = match class_value.l() {
                    Ok(value) if !value.is_null() => value,
                    Ok(_) => return Err(format!("loadClass returned null for {helper_name}")),
                    Err(e) => return Err(format!("loadClass result for {helper_name}: {e:?}")),
                };
                let class: jni::objects::JClass = class_obj.into();

                // Prefer the file-based helper (small JNI payload).
                let file_call = env.call_static_method(
                    &class,
                    "saveFileToDownloads",
                    "(Landroid/content/Context;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",
                    &[
                        JValue::Object(&activity),
                        JValue::Object(&j_name),
                        JValue::Object(&j_tmp),
                    ],
                );
                if let Ok(true) = env.exception_check() {
                    let _ = env.exception_describe();
                    let _ = env.exception_clear();
                } else if let Ok(jvalue) = file_call {
                    if let Ok(jobj) = jvalue.l() {
                        if !jobj.is_null() {
                            let jstr: jni::objects::JString = jobj.into();
                            // Copy into an owned String before `jstr` drops —
                            // JavaStr borrows jstr and cannot outlive it.
                            let owned: Result<String, _> =
                                env.get_string(&jstr).map(|s| s.into());
                            if let Ok(path) = owned {
                                return Ok(path);
                            }
                        }
                    }
                }

                // Fall back to the in-memory string helper.
                let j_content = match env.new_string(&content_owned) {
                    Ok(s) => s,
                    Err(e) => return Err(format!("new_string content: {e:?}")),
                };
                let string_call = env.call_static_method(
                    &class,
                    "saveToDownloads",
                    "(Landroid/content/Context;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",
                    &[
                        JValue::Object(&activity),
                        JValue::Object(&j_name),
                        JValue::Object(&j_content),
                    ],
                );

                if let Ok(true) = env.exception_check() {
                    let _ = env.exception_describe();
                    let _ = env.exception_clear();
                    return Err("java exception in saveToDownloads()".into());
                }

                let jvalue = match string_call {
                    Ok(v) => v,
                    Err(e) => return Err(format!("call saveToDownloads: {e:?}")),
                };
                let jobj = match jvalue.l() {
                    Ok(o) => o,
                    Err(e) => return Err(format!("cast result to object: {e:?}")),
                };
                if jobj.is_null() {
                    return Err("DownloadsHelper.saveToDownloads() returned null".into());
                }
                let jstr: jni::objects::JString = jobj.into();
                // Copy into an owned String before `jstr` drops.
                let owned: Result<String, _> = env.get_string(&jstr).map(|s| s.into());
                match owned {
                    Ok(path) => Ok(path),
                    Err(e) => Err(format!("get_string: {e:?}")),
                }
            })();

            let _ = tx.send(result);
        });
    });

    if let Err(e) = result {
        let _ = std::fs::remove_file(&tmp_path);
        eprintln!("[downloads] with_webview failed: {e}");
        return Err(format!("with_webview failed: {e}"));
    }

    match rx.recv_timeout(Duration::from_millis(10_000)) {
        Ok(inner) => {
            let _ = std::fs::remove_file(&tmp_path);
            inner
        }
        // Leave the temp file on timeout: the queued Android callback may
        // still consume it after this command returns. The OS will clear the
        // app cache later.
        Err(mpsc::RecvTimeoutError::Timeout) => Err("JNI call timed out after 10000ms".into()),
        Err(e) => {
            let _ = std::fs::remove_file(&tmp_path);
            Err(format!("channel recv failed: {e:?}"))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::safe_export_filename;

    #[test]
    fn strips_unix_and_windows_path_components() {
        assert_eq!(safe_export_filename("../../history.json"), "history.json");
        assert_eq!(safe_export_filename(r"C:\temp\history.csv"), "history.csv");
    }

    #[test]
    fn rejects_empty_or_special_names() {
        assert_eq!(safe_export_filename(""), "export.bin");
        assert_eq!(safe_export_filename(".."), "export.bin");
        assert_eq!(safe_export_filename("bad\0name.json"), "export.bin");
    }
}
