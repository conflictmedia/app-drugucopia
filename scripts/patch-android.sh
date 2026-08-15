#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Patches the Tauri-generated Android project with:
#   - Ongoing notification helper (unswipeable timeline notifications)
#   - Public Downloads helper for JSON/CSV exports
#   - Dark status bar matching the app theme (#0a0a0a)
#   - Transparent status bar so content can extend behind it
#   - Proper safe area inset handling
#   - Ensures INTERNET permission for Firebase sync (critical for release builds)
#
# Run this once after `tauri android init`:
#   bash scripts/patch-android.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

if [ ! -d "$ANDROID_DIR" ]; then
  echo "Error: Android project not found at $ANDROID_DIR"
  echo "Run 'npm run tauri:android:init' first."
  exit 1
fi

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

info()  { echo -e "${CYAN}[patch]${NC} $*"; }
ok()    { echo -e "${GREEN}[patch]${NC} $*"; }

# --- ICON FIX: Sync launcher icons from public/ to Android mipmap ---
resolve_icon_src() {
  # Prefer the maskable, pre-padded variants for Android. These already have
  # the logo confined to the inner ~66% safe zone, so the launcher's adaptive
  # mask (circle / squircle / rounded square) will not clip the artwork.
  # Full-bleed sources like logo-new.png are used LAST and only as a fallback.
  for cand in \
    "public/logo-512-maskable.png" \
    "public/logo-192-maskable.png" \
    "public/logo-new.png" \
    "public/logo-512.png" \
    "public/logo.png" \
    "public/logo-192.png" \
    "src-tauri/icons/icon.png"; do
    if [ -f "$PROJECT_ROOT/$cand" ]; then
      echo "$PROJECT_ROOT/$cand"
      return 0
    fi
  done
  return 1
}

ICON_SRC="$(resolve_icon_src || true)"
if [ -n "${ICON_SRC:-}" ]; then
  info "Syncing launcher icons from $ICON_SRC..."
  if command -v bun >/dev/null 2>&1; then
    bun run tauri icon "$ICON_SRC" 2>/dev/null && ok "Tauri icon via bun" || info "bun icon failed"
  elif command -v npx >/dev/null 2>&1; then
    npx tauri icon "$ICON_SRC" 2>/dev/null && ok "Tauri icon via npx" || info "npx icon failed"
  fi
  if command -v python3 >/dev/null 2>&1; then
    PROJECT_ROOT="$PROJECT_ROOT" python3 - <<'PYEOF'
import os, sys, pathlib
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "Pillow"])
    from PIL import Image
pr = pathlib.Path(os.environ.get("PROJECT_ROOT", "."))
# Prefer maskable (pre-padded) sources for Android so the launcher's adaptive
# mask does not clip the artwork. Fall back to full-bleed sources only if needed.
cands = [
    pr / "public/logo-new.png",
    pr / "public/logo-512-maskable.png",
    pr / "public/logo-192-maskable.png",
    pr / "public/logo-512.png",
    pr / "public/logo.png",
    pr / "public/logo-192.png",
    pr / "src-tauri/icons/icon.png",
]
src = next((c for c in cands if c.exists()), None)
if not src:
    print("No source")
    sys.exit(0)
img = Image.open(src).convert("RGBA")
gen = pr / "src-tauri/gen/android/app/src/main/res"

# Android adaptive icon foreground is 108dp on a 108dp canvas, but only the
# inner ~66% (the "safe zone") is guaranteed to survive the launcher's shape
# mask. Even when the source image is already padded (maskable variants), we
# paste into the safe zone explicitly so a full-bleed fallback source cannot
# silently slip through and get clipped.
SAFE_RATIO = 0.66

cfgs = {
    "mipmap-mdpi": {"launcher": 48, "foreground": 108},
    "mipmap-hdpi": {"launcher": 72, "foreground": 162},
    "mipmap-xhdpi": {"launcher": 96, "foreground": 216},
    "mipmap-xxhdpi": {"launcher": 144, "foreground": 324},
    "mipmap-xxxhdpi": {"launcher": 192, "foreground": 432},
}
for folder, sz in cfgs.items():
    d = gen / folder
    d.mkdir(parents=True, exist_ok=True)

    # Legacy square icons (pre-API 26): keep full-bleed, no mask applied.
    for name in ["ic_launcher.png", "ic_launcher_round.png"]:
        r = img.resize((sz["launcher"], sz["launcher"]), Image.LANCZOS)
        r.save(d / name, "PNG")

    # Adaptive foreground: shrink logo to the safe zone, center on transparent
    # canvas so the launcher mask (circle/squircle/etc.) cannot clip artwork.
    fg_size = sz["foreground"]
    canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    inner = max(1, int(round(fg_size * SAFE_RATIO)))
    resized = img.resize((inner, inner), Image.LANCZOS)
    offset = ((fg_size - inner) // 2, (fg_size - inner) // 2)
    canvas.paste(resized, offset, resized)
    canvas.save(d / "ic_launcher_foreground.png", "PNG")

# Background color used by the adaptive icon and the splash screen.
# Matches the app theme (#0a0a0a) defined in styles.xml.
values_dir = gen / "values"
values_dir.mkdir(parents=True, exist_ok=True)

# Remove Tauri-generated standalone color files that would duplicate entries
# in our unified colors.xml (causes build error: "Duplicate resources").
for tauri_color_file in ["ic_launcher_background.xml", "ic_launcher_foreground.xml"]:
    p = values_dir / tauri_color_file
    if p.exists():
        p.unlink()
        print(f"Removed Tauri-generated {tauri_color_file}")

colors_xml = values_dir / "colors.xml"
colors_xml.write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n'
    '<resources>\n'
    '    <color name="ic_launcher_background">#0a0a0a</color>\n'
    '    <color name="ic_launcher_foreground">#0a0a0a</color>\n'
    '</resources>\n'
)

# Adaptive icon XML (API 26+): references our safe-zone foreground plus a flat
# background color. Tauri's `tauri icon` normally generates these, but the
# manual fallback path needs to emit them too or pre-API-26 launchers will use
# the legacy bitmap and API 26+ launchers will render a blank adaptive icon.
anydpi = gen / "mipmap-anydpi-v26"
anydpi.mkdir(parents=True, exist_ok=True)
for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
    (anydpi / name).write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@color/ic_launcher_background" />\n'
        '    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n'
        '</adaptive-icon>\n'
    )

print("Manual sync done (with adaptive-icon XML + colors.xml)")
# desktop icons (these are NOT used by Android; safe to leave full-bleed)
dd = pr / "src-tauri/icons"
dd.mkdir(parents=True, exist_ok=True)
for size, fname in [(32, "32x32.png"), (32, "32.png"), (16, "16.png"), (48, "48.png"), (64, "64x64.png"), (128, "128x128.png"), (256, "128x128@2x.png"), (256, "256.png"), (512, "icon.png")]:
    try:
        r = img.resize((size, size), Image.LANCZOS)
        r.save(dd / fname, "PNG")
    except Exception as e:
        print(f"fail {fname} {e}")
try:
    ico_path = dd / "icon.ico"
    sizes = [16,24,32,48,64,256]
    imgs = [img.resize((s,s), Image.LANCZOS) for s in sizes]
    imgs[-1].save(ico_path, format="ICO", sizes=[(s,s) for s in sizes])
    print(f"ico {ico_path}")
except Exception as e:
    print(f"ico fail {e}")
PYEOF
    ok "Manual icon sync done"
  fi
fi


# ─── 1. Install OngoingNotificationHelper.kt ──────────────────────────────────
# Put helpers beside the generated MainActivity. Searching for an arbitrary
# directory named "app" can select the wrong source folder and yield an APK
# that builds successfully but does not contain the JNI helper classes.
MAIN_ACTIVITY=$(find "$ANDROID_DIR/app/src/main/java" -type f -name "MainActivity.kt" | head -1)
if [ -z "$MAIN_ACTIVITY" ]; then
  echo "Error: Could not find generated MainActivity.kt"
  exit 1
fi
KOTLIN_SRC=$(dirname "$MAIN_ACTIVITY")

# Rewrite the Kotlin `package` line to match the generated applicationId
# (com.drugucopia.app for release, com.drugucopiadev.app for dev).
rewrite_kotlin_package() {
  local dest="$1"
  local rel pkg
  rel=$(printf '%s' "$KOTLIN_SRC" | sed 's|.*/java/||')
  pkg="${rel//\//.}"
  if [[ "$pkg" == *.* ]] && [ -f "$dest" ]; then
    sed -i "s/^package .*/package $pkg/" "$dest" || true
    info "Set $(basename "$dest") package to $pkg"
  fi
}

info "Installing OngoingNotificationHelper.kt to $KOTLIN_SRC"
cp "$SCRIPT_DIR/android-ongoing-notif/OngoingNotificationHelper.kt" "$KOTLIN_SRC/"
rewrite_kotlin_package "$KOTLIN_SRC/OngoingNotificationHelper.kt"
ok "Installed OngoingNotificationHelper.kt"

# ─── 1a. Install DownloadsHelper.kt (native "Export to JSON/CSV" target) ──────
# Android WebView silently ignores <a download> for blob: URLs, so the export
# buttons in the Track page history tab need a native fallback that writes
# directly to the public Downloads directory via MediaStore.
if [ -f "$SCRIPT_DIR/android-ongoing-notif/DownloadsHelper.kt" ]; then
  info "Installing DownloadsHelper.kt to $KOTLIN_SRC"
  cp "$SCRIPT_DIR/android-ongoing-notif/DownloadsHelper.kt" "$KOTLIN_SRC/"
  rewrite_kotlin_package "$KOTLIN_SRC/DownloadsHelper.kt"
  ok "Installed DownloadsHelper.kt"
fi

# Release builds run R8. These helpers have no Kotlin/Java callers because Rust
# reaches them by class name through JNI, so R8 otherwise removes or renames
# them. Tauri's generated release config includes **/*.pro files under app/.
PROGUARD_FILE="$ANDROID_DIR/app/tauri-jni-helpers.pro"
cat > "$PROGUARD_FILE" <<'EOF'
-keep class **.DownloadsHelper { *; }
-keep class **.OngoingNotificationHelper { *; }
EOF
ok "Installed R8 keep rules for JNI helper classes"

# ─── 1b. Ensure INTERNET permission exists (critical for Firebase on Android)
MANIFEST="$ANDROID_DIR/app/src/main/AndroidManifest.xml"

if [ -f "$MANIFEST" ]; then
  if ! grep -q "android.permission.INTERNET" "$MANIFEST"; then
    info "Adding INTERNET permission to AndroidManifest.xml"
    # Insert INTERNET permission before <application>
    sed -i 's/<application/<uses-permission android:name="android.permission.INTERNET" \/>\n    <application/' "$MANIFEST"
    ok "Added INTERNET permission"
  else
    ok "INTERNET permission already present"
  fi

  if ! grep -q "android.permission.ACCESS_NETWORK_STATE" "$MANIFEST"; then
    info "Adding ACCESS_NETWORK_STATE permission"
    sed -i 's/<uses-permission android:name="android.permission.INTERNET" \/>/<uses-permission android:name="android.permission.INTERNET" \/>\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" \/>/' "$MANIFEST"
    ok "Added ACCESS_NETWORK_STATE permission"
  fi

  # MediaStore needs no storage permission on Android 10+, but the helper's
  # direct public-Downloads path still supports Android 9 and earlier.
  if ! grep -q "android.permission.WRITE_EXTERNAL_STORAGE" "$MANIFEST"; then
    info "Adding legacy WRITE_EXTERNAL_STORAGE permission (Android 9 and earlier only)"
    sed -i 's/<application/<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" \/>\n    <application/' "$MANIFEST"
    ok "Added legacy storage permission"
  fi
fi

# ─── 2. Patch AndroidManifest.xml for status bar color ────────────────────────
if [ -f "$MANIFEST" ]; then
  if ! grep -q "android.statusbar.color" "$MANIFEST"; then
    sed -i '/<application/,/>/ {
      /android:usesCleartextTraffic/a\        <meta-data android:name="android.window.statusBarColor" android:value="#0a0a0a" />\n        <meta-data android:name="android.window.navigationBarColor" android:value="#0a0a0a" />
    }' "$MANIFEST" 2>/dev/null || true
    ok "Added status/navigation bar color metadata"
  fi
fi

# ─── 3. Patch styles.xml for the dark status bar ──────────────────────────────
STYLES_DIR="$ANDROID_DIR/app/src/main/res/values"
mkdir -p "$STYLES_DIR"

STYLES_FILE="$STYLES_DIR/styles.xml"
if [ ! -f "$STYLES_FILE" ]; then
  cat > "$STYLES_FILE" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Drugucopia" parent="Theme.AppCompat.NoActionBar">
        <item name="android:statusBarColor">#0a0a0a</item>
        <item name="android:navigationBarColor">#0a0a0a</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    </style>
</resources>
EOF
  ok "Created styles.xml with dark status/nav bar"
fi

# ─── 3a. Ensure colors.xml defines ic_launcher_background ─────────────────────
# Tauri's `tauri icon` generates standalone ic_launcher_background.xml which
# duplicates the entry in our colors.xml and causes a build failure. Remove
# it (and any other Tauri-generated color XMLs) before writing our unified file.
for TAURI_COLOR_FILE in "ic_launcher_background.xml" "ic_launcher_foreground.xml"; do
  [ -f "$STYLES_DIR/$TAURI_COLOR_FILE" ] && rm -f "$STYLES_DIR/$TAURI_COLOR_FILE" && info "Removed Tauri-generated $TAURI_COLOR_FILE"
done

COLORS_FILE="$STYLES_DIR/colors.xml"
if [ ! -f "$COLORS_FILE" ] || ! grep -q "ic_launcher_background" "$COLORS_FILE" 2>/dev/null; then
  cat > "$COLORS_FILE" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0a0a0a</color>
    <color name="ic_launcher_foreground">#0a0a0a</color>
</resources>
EOF
  ok "Created colors.xml with ic_launcher_background (#0a0a0a)"
fi

# ─── 3b. Create mipmap-anydpi-v26/ic_launcher.xml for adaptive icons ─────────
# These XMLs let API 26+ launchers composite our safe-zone foreground over a
# flat background color, applying the device's chosen shape mask (circle,
# squircle, rounded square, etc.) without clipping the logo.
ANYDPI_DIR="$ANDROID_DIR/app/src/main/res/mipmap-anydpi-v26"
mkdir -p "$ANYDPI_DIR"
for ADAPTIVE_NAME in "ic_launcher.xml" "ic_launcher_round.xml"; do
  ADAPTIVE_FILE="$ANYDPI_DIR/$ADAPTIVE_NAME"
  if [ ! -f "$ADAPTIVE_FILE" ]; then
    cat > "$ADAPTIVE_FILE" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
EOF
    ok "Created $ADAPTIVE_NAME (adaptive icon for API 26+)"
  fi
done

# ─── 3c. Create themes.xml for Android 12+ SplashScreen ──────────────────────
# On Android 12+ the system draws a splash screen using windowSplashScreen*
# attributes. We pin the background to #0a0a0a (matches the rest of the app)
# and reuse the safe-zone launcher foreground as the splash icon, so the
# system's circular mask cannot clip it. The postSplashScreenTheme hands off
# to Theme.Drugucopia once the WebView is ready.
THEMES_FILE="$STYLES_DIR/themes.xml"
if [ ! -f "$THEMES_FILE" ]; then
  cat > "$THEMES_FILE" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Drugucopia.Splash" parent="Theme.AppCompat.NoActionBar">
        <item name="windowSplashScreenBackground">#0a0a0a</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash</item>
        <item name="postSplashScreenTheme">@style/Theme.Drugucopia</item>
    </style>
</resources>
EOF
  ok "Created themes.xml with Theme.Drugucopia.Splash (Android 12+)"
fi

# ─── 4. Patch AndroidManifest.xml to use our splash theme ────────────────────
# IMPORTANT: We point the application theme at Theme.Drugucopia.Splash so the
# Android 12+ SplashScreen API uses our icon/background. The postSplashScreenTheme
# attribute (declared in themes.xml) hands off to Theme.Drugucopia after launch.
if [ -f "$MANIFEST" ]; then
  if ! grep -q "Theme.Drugucopia.Splash" "$MANIFEST"; then
    sed -i 's/android:theme="[^"]*"/android:theme="@style\/Theme.Drugucopia.Splash"/' "$MANIFEST" 2>/dev/null || true
    ok "Applied Theme.Drugucopia.Splash to manifest"
  fi
fi

# ─── 5. Ensure the dependency on AndroidX core (for NotificationCompat) ───────
# The Tauri Android project should already have this, but just in case.
GRADLE_FILE="$ANDROID_DIR/app/build.gradle.kts"
if [ -f "$GRADLE_FILE" ]; then
  if ! grep -q "androidx.core" "$GRADLE_FILE"; then
    # Add the dependency
    sed -i '/dependencies {/a\    implementation("androidx.core:core:1.13.1")' "$GRADLE_FILE" 2>/dev/null || true
    ok "Added androidx.core dependency for NotificationCompat"
  fi
  # Android 12+ SplashScreen API requires the androidx.core:core-splashscreen
  # artifact, which backports Theme.SplashScreen to API 21+. Without it the
  # build fails with "resource style/Theme.SplashScreen not found".
  if ! grep -q "core-splashscreen" "$GRADLE_FILE"; then
    sed -i '/dependencies {/a\    implementation("androidx.core:core-splashscreen:1.0.1")' "$GRADLE_FILE" 2>/dev/null || true
    ok "Added androidx.core:core-splashscreen for Android 12+ splash"
  fi
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Android patch complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "  Installed:"
echo "    • OngoingNotificationHelper.kt (unswipeable notifications)"
echo "    • DownloadsHelper.kt (native Export-to-Downloads for JSON/CSV)"
echo "    • Dark status/nav bar theme"
echo "    • Edge-to-edge display mode"
echo "    • INTERNET + ACCESS_NETWORK_STATE permissions (Firebase)"
echo "    • Adaptive launcher icon (safe-zone foreground + colors.xml + anydpi-v26 XML)"
echo "    • Android 12+ SplashScreen theme (themes.xml + core-splashscreen dep)"
echo ""
echo "  Next step: npm run tauri:android:dev"
echo ""
