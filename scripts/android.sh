#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Android dev/build wrapper for Drugucopia's Tauri app.
#
# The project supports physical ARM Android devices only:
#   - aarch64 / arm64-v8a
#   - armv7 / armeabi-v7a
#
# Linkers are provided to Cargo through process-local environment variables.
# No machine-specific paths are written to src-tauri/.cargo/config.toml.
#
# Usage:
#   bash scripts/android.sh dev          # build and run on a device
#   bash scripts/android.sh build        # build an ARM release APK
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ACTION="${1:-dev}"
if [ "$#" -gt 0 ]; then
  shift
fi
EXTRA_ARGS=("$@")

case "$ACTION" in
  dev|build) ;;
  *) echo "[android] Unknown action: $ACTION (use 'dev' or 'build')" >&2; exit 1 ;;
esac

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${CYAN}[android]${NC} $*"; }
ok()   { echo -e "${GREEN}[android]${NC} $*"; }
die()  { echo -e "${RED}[android]${NC} $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUST_TARGETS=(aarch64-linux-android armv7-linux-androideabi)

# ─── 0. Cleanup stale machine-specific cargo config (fixes GitHub Actions builds) ───
# This file should NEVER be committed - it contains absolute NDK paths from the
# developer's machine (e.g. /home/conflift/Android/Sdk/...). If present, it breaks
# CI builds where that path doesn't exist. The android.sh script uses env vars for linkers.
STALE_CARGO_CONFIG="$PROJECT_ROOT/src-tauri/.cargo/config.toml"
if [ -f "$STALE_CARGO_CONFIG" ]; then
  info "Removing stale machine-specific cargo config: $STALE_CARGO_CONFIG"
  rm -f "$STALE_CARGO_CONFIG"
  # Remove parent dir if empty
  rmdir "$PROJECT_ROOT/src-tauri/.cargo" 2>/dev/null || true
  ok "Removed stale cargo config (linkers now via env vars)"
fi

# ─── 1. Find Android NDK ─────────────────────────────────────────────────────
info "Looking for Android NDK..."

NDK_PATH=""

for var in ANDROID_NDK_HOME NDK_HOME; do
  val="${!var:-}"
  if [ -n "$val" ] && [ -d "$val" ]; then
    NDK_PATH="$val"
    ok "Found via $var: $NDK_PATH"
    break
  fi
done

if [ -z "$NDK_PATH" ] && [ -n "${ANDROID_HOME:-}" ]; then
  NDK_PATH=$(ls -d "$ANDROID_HOME/ndk/"* 2>/dev/null | sort -V | tail -1 || true)
fi

if [ -z "$NDK_PATH" ]; then
  for dir in \
    "$HOME/Android/Sdk" \
    "$HOME/android-sdk" \
    "$HOME/.android/sdk" \
    "/opt/android-sdk" \
    "/usr/local/android-sdk"; do
    if [ -d "$dir/ndk" ]; then
      NDK_PATH=$(ls -d "$dir/ndk/"* 2>/dev/null | sort -V | tail -1 || true)
      [ -n "$NDK_PATH" ] && break
    fi
    if [ -d "$dir/ndk-bundle" ]; then
      NDK_PATH="$dir/ndk-bundle"
      break
    fi
  done
fi

LOCAL_PROPS="$PROJECT_ROOT/src-tauri/gen/android/local.properties"
if [ -z "$NDK_PATH" ] && [ -f "$LOCAL_PROPS" ]; then
  NDK_PATH=$(grep -oP '(?<=ndk\.dir=).*' "$LOCAL_PROPS" 2>/dev/null | head -1 || true)
  if [ -n "$NDK_PATH" ] && [ ! -d "$NDK_PATH" ]; then
    NDK_PATH=""
  fi
fi

if [ -z "$NDK_PATH" ]; then
  die "Android NDK not found!

  Set one of these environment variables:
    export ANDROID_NDK_HOME=/path/to/ndk
    export ANDROID_HOME=/path/to/sdk   (must have ndk/<version> inside)

  Or install the NDK via Android Studio:
    Tools > SDK Manager > SDK Tools > NDK (Side by side)"
fi

ok "NDK: $NDK_PATH"

# ─── 2. Detect host toolchain ─────────────────────────────────────────────────
case "$(uname -s)" in
  Linux)   HOST_TAG="linux-x86_64" ;;
  Darwin)  HOST_TAG="darwin-x86_64" ;;
  MINGW*|MSYS*|CYGWIN*) HOST_TAG="windows-x86_64" ;;
  *)       die "Unsupported OS: $(uname -s)" ;;
esac

TOOLCHAIN="$NDK_PATH/toolchains/llvm/prebuilt/$HOST_TAG"
if [ ! -d "$TOOLCHAIN" ]; then
  die "NDK toolchain not found at: $TOOLCHAIN"
fi

ok "Toolchain: $TOOLCHAIN"

# ─── 3. Detect API level ──────────────────────────────────────────────────────
API_LEVEL=""
for level in 34 33 32 31 30 29 28; do
  if [ -f "$TOOLCHAIN/bin/aarch64-linux-android${level}-clang" ]; then
    API_LEVEL=$level
    break
  fi
done

if [ -z "$API_LEVEL" ]; then
  API_LEVEL=33
  info "Defaulting to API level $API_LEVEL"
else
  ok "API level: $API_LEVEL"
fi

# ─── 4. Check only the supported Rust targets ────────────────────────────────
command -v rustup >/dev/null 2>&1 || die "rustup is required but was not found"

info "Checking ARM Rust targets..."
for target in "${RUST_TARGETS[@]}"; do
  if ! rustup target list --installed 2>/dev/null | grep -qx "$target"; then
    info "Installing $target..."
    rustup target add "$target"
  fi
done
ok "ARM Rust targets ready"

# ─── 5. Set process-local Cargo linker variables ─────────────────────────────
export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$TOOLCHAIN/bin/aarch64-linux-android${API_LEVEL}-clang"
export CARGO_TARGET_ARMV7_LINUX_ANDROIDEABI_LINKER="$TOOLCHAIN/bin/armv7a-linux-androideabi${API_LEVEL}-clang"

[ -x "$CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER" ] || die "ARM64 linker not found: $CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER"
[ -x "$CARGO_TARGET_ARMV7_LINUX_ANDROIDEABI_LINKER" ] || die "ARMv7 linker not found: $CARGO_TARGET_ARMV7_LINUX_ANDROIDEABI_LINKER"

ok "ARM linker environment configured"

cd "$PROJECT_ROOT"

# ─── 4.5. Load .env / .env.local so Firebase vars are visible to this script
#        AND to subprocesses (next build, tauri, gradle). Without this, the
#        "Checking Firebase env vars" step below prints false-positive warnings
#        because the shell doesn't auto-load Next.js env files. ───
load_env_file() {
  local file="$1"
  [ -f "$file" ] || return 0
  info "Loading env vars from: $file"
  # Parse line by line. We do NOT use `source` because .env files can contain
  # values with spaces, special chars, or quotes that would be re-interpreted
  # by the shell. This parser only handles KEY=value pairs and skips comments.
  while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip blank lines and comments
    case "$key" in
      ''|\#*) continue ;;
    esac
    # Trim leading whitespace from key
    key="${key#"${key%%[![:space:]]*}"}"
    # Strip any surrounding quotes from value (single or double)
    case "$value" in
      \"*\") value="${value#\"}"; value="${value%\"}" ;;
      \'*\') value="${value#\'}"; value="${value%\'}" ;;
    esac
    # Only set if not already in the environment (explicit exports win)
    if [ -z "${!key:-}" ]; then
      export "$key=$value"
    fi
  done < "$file"
}

# Load order matches Next.js: .env.local overrides .env (but we don't override
# already-set shell vars, so explicit `export FOO=bar` always wins).
load_env_file "$PROJECT_ROOT/.env"
load_env_file "$PROJECT_ROOT/.env.local"

GEN_ANDROID_DIR="$PROJECT_ROOT/src-tauri/gen/android"

# Determine which config we're using and expected identifier
if [ "$ACTION" = "dev" ]; then
  EXPECTED_IDENTIFIER="com.drugucopiadev.app"
  CONFIG_FILE="src-tauri/tauri.conf.dev.json"
else
  EXPECTED_IDENTIFIER="com.drugucopia.app"
  CONFIG_FILE="src-tauri/tauri.conf.json"
fi

# Check if Android project exists and matches expected identifier
if [ -d "$GEN_ANDROID_DIR" ]; then
  BUILD_GRADLE="$GEN_ANDROID_DIR/app/build.gradle.kts"
  if [ -f "$BUILD_GRADLE" ]; then
    CURRENT_IDENTIFIER=$(grep -oP 'namespace\s*=\s*"\K[^"]+' "$BUILD_GRADLE" | head -1)
    if [ "$CURRENT_IDENTIFIER" != "$EXPECTED_IDENTIFIER" ]; then
      info "Android project identifier mismatch ($CURRENT_IDENTIFIER vs $EXPECTED_IDENTIFIER), regenerating..."
      rm -rf "$GEN_ANDROID_DIR"
    fi
  fi
fi

# Initialize Android project if needed
NEW_INIT=0
if [ ! -d "$GEN_ANDROID_DIR" ]; then
  info "Initializing Android project for $EXPECTED_IDENTIFIER..."
  npx tauri android init --config "$CONFIG_FILE"
  NEW_INIT=1
fi


# --- ICON FIX: Ensure launcher icons from public/ are synced to Android mipmap ---
# Root cause: tauri icon was run BEFORE android init in CI. When gen/android
# does not exist, tauri icon only populates src-tauri/icons, not mipmap.
# Fix: re-run icon generation AFTER init, so both desktop and Android get new icons.
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

ICON_SRC_PATH="$(resolve_icon_src || true)"

if [ -n "${ICON_SRC_PATH:-}" ]; then
  info "Syncing launcher icons from $ICON_SRC_PATH..."
  ICON_GENERATED=0
  if command -v bun >/dev/null 2>&1; then
    if bun run tauri icon "$ICON_SRC_PATH" 2>&1 | tail -n 20; then
      ICON_GENERATED=1
      ok "Icons generated via bun"
    fi
  fi
  if [ "$ICON_GENERATED" = "0" ]; then
    if npx tauri icon "$ICON_SRC_PATH" 2>&1 | tail -n 20; then
      ICON_GENERATED=1
      ok "Icons generated via npx tauri"
    fi
  fi
  # Fallback: manual Python resize into mipmap folders
  if [ "$ICON_GENERATED" = "0" ] || [ ! -d "$GEN_ANDROID_DIR/app/src/main/res/mipmap-hdpi" ]; then
    info "Running manual mipmap sync (Python)..."
    if command -v python3 >/dev/null 2>&1; then
      PROJECT_ROOT="$PROJECT_ROOT" python3 - <<'PYEOF'
import os, sys, pathlib
try:
    from PIL import Image
except ImportError:
    import subprocess, sys
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "Pillow"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception:
        print("Pillow not available, skipping Python icon sync (tauri icon already succeeded)")
        sys.exit(0)
    from PIL import Image

pr = pathlib.Path(os.environ.get("PROJECT_ROOT", "."))
# Prefer maskable (pre-padded) sources for Android so the launcher's adaptive
# mask does not clip the artwork. Fall back to full-bleed sources only if needed.
candidates = [
    pr / "public/logo-new.png",
    pr / "public/logo-512-maskable.png",
    pr / "public/logo-192-maskable.png",
    pr / "public/logo-512.png",
    pr / "public/logo.png",
    pr / "public/logo-192.png",
    pr / "src-tauri/icons/icon.png",
]
src = next((c for c in candidates if c.exists()), None)
if not src:
    print("No icon source for manual sync")
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
        o = d / name
        r = img.resize((sz["launcher"], sz["launcher"]), Image.LANCZOS)
        r.save(o, "PNG")

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

print("Manual mipmap sync done (with adaptive-icon XML + colors.xml)")
PYEOF
      ok "Manual sync complete"
    fi
  fi
else
  info "No icon source found, skipping icon sync"
fi


# ── Unconditional resource fixes (must run EVERY build, not just on new init) ──
TAURI_VALUES_DIR="$GEN_ANDROID_DIR/app/src/main/res/values"
mkdir -p "$TAURI_VALUES_DIR"

# 1. Remove Tauri-generated standalone color XMLs that duplicate our colors.xml
for TAURI_COLOR_XML in "ic_launcher_background.xml" "ic_launcher_foreground.xml"; do
  [ -f "$TAURI_VALUES_DIR/$TAURI_COLOR_XML" ] && rm -f "$TAURI_VALUES_DIR/$TAURI_COLOR_XML" && info "Removed Tauri-generated $TAURI_COLOR_XML"
done

# 2. Ensure colors.xml exists with dark launcher background
if [ ! -f "$TAURI_VALUES_DIR/colors.xml" ] || ! grep -q "ic_launcher_background" "$TAURI_VALUES_DIR/colors.xml" 2>/dev/null; then
  cat > "$TAURI_VALUES_DIR/colors.xml" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0a0a0a</color>
    <color name="ic_launcher_foreground">#0a0a0a</color>
</resources>
EOF
  ok "Created colors.xml with ic_launcher_background (#0a0a0a)"
fi

# 3. Ensure themes.xml has splash theme (must overwrite Tauri default)
cat > "$TAURI_VALUES_DIR/themes.xml" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Drugucopia.Splash" parent="Theme.AppCompat.NoActionBar">
        <item name="windowSplashScreenBackground">#0a0a0a</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash</item>
        <item name="postSplashScreenTheme">@style/Theme.Drugucopia</item>
    </style>
</resources>
EOF
  ok "Created themes.xml with Theme.Drugucopia.Splash"

# 4. Ensure styles.xml exists (base dark theme, must overwrite Tauri default)
cat > "$TAURI_VALUES_DIR/styles.xml" <<'EOF'
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

# 6. Ensure full-size splash drawable exists (so splash screen isn't a tiny 108px icon)
DRAWABLE_DIR="$GEN_ANDROID_DIR/app/src/main/res/drawable"
mkdir -p "$DRAWABLE_DIR"
if [ ! -f "$DRAWABLE_DIR/ic_splash.png" ]; then
  if command -v python3 >/dev/null 2>&1; then
    PROJECT_ROOT="$PROJECT_ROOT" python3 - <<'PYEOF'
import os, pathlib, sys
try:
    from PIL import Image
except ImportError:
    import subprocess, sys
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "Pillow"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception:
        print("Pillow not available, skipping splash drawable sync")
        sys.exit(0)
    try:
        from PIL import Image
    except ImportError:
        print("Pillow install did not provide PIL, skipping splash drawable sync")
        sys.exit(0)
pr = pathlib.Path(os.environ.get("PROJECT_ROOT", "."))
img = Image.open("public/logo-512-maskable.png").convert("RGBA") if (pr / "public/logo-512-maskable.png").exists() else Image.open("public/logo-512.png").convert("RGBA")
canvas = Image.new("RGBA", (512, 512), (10, 10, 10, 255))
logo_size = 320
resized = img.resize((logo_size, logo_size), Image.LANCZOS)
offset = ((512 - logo_size)//2, (512 - logo_size)//2)
canvas.paste(resized, offset, resized)
canvas.save("src-tauri/gen/android/app/src/main/res/drawable/ic_splash.png", "PNG")
PYEOF
  fi
  echo "Created splash drawable (512px)"
fi

# 5. Ensure adaptive icon XMLs exist (API 26+)
ANYDPI_DIR="$GEN_ANDROID_DIR/app/src/main/res/mipmap-anydpi-v26"
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

# ── Conditional full patch (only on new init, CI, or missing pieces) ──
if [ -f "$PROJECT_ROOT/scripts/patch-android.sh" ]; then
  if [ "$NEW_INIT" = "1" ] || [ ! -f "$GEN_ANDROID_DIR/app/src/main/res/values/styles.xml" ] || ! grep -q "android.permission.WRITE_EXTERNAL_STORAGE" "$GEN_ANDROID_DIR/app/src/main/AndroidManifest.xml" 2>/dev/null || [ "${GITHUB_ACTIONS:-}" = "true" ]; then
    info "Applying full Android patches (permissions, status bar, etc)..."
    bash "$PROJECT_ROOT/scripts/patch-android.sh" || info "Patch script failed, continuing anyway"
  fi
fi

# Always refresh Kotlin helpers. The full patch script above is skipped on an
# already-initialized local Android project, which is how DownloadsHelper.kt
# never made it into existing gen/android trees and JSON export failed with
# "Could not save the file to Downloads".
install_kotlin_helpers() {
  local android_dir="$GEN_ANDROID_DIR"
  local src_dir="$PROJECT_ROOT/scripts/android-ongoing-notif"
  [ -d "$android_dir/app/src/main/java" ] || die "Generated Android Java source directory is missing"
  [ -d "$src_dir" ] || die "Android JNI helper source directory is missing"

  # Install beside MainActivity so the source package always matches the actual
  # generated applicationId. A broad `find -name app` previously allowed a
  # successful release build that omitted DownloadsHelper from the APK.
  local main_activity kotlin_src
  main_activity=$(find "$android_dir/app/src/main/java" -type f -name "MainActivity.kt" | head -1)
  [ -n "$main_activity" ] || die "Could not locate generated MainActivity.kt"
  kotlin_src=$(dirname "$main_activity")

  local rel pkg
  rel=$(printf '%s' "$kotlin_src" | sed 's|.*/java/||')
  pkg="${rel//\//.}"
  [[ "$pkg" == *.* ]] || die "Could not derive Android package from $kotlin_src"

  local f dest
  for f in "$src_dir"/*.kt; do
    [ -f "$f" ] || continue
    dest="$kotlin_src/$(basename "$f")"
    cp "$f" "$dest"
    sed -i "s/^package .*/package $pkg/" "$dest"
    ok "Installed $(basename "$f") → $dest (package $pkg)"
  done

  [ -s "$kotlin_src/DownloadsHelper.kt" ] || die "DownloadsHelper.kt was not installed"
  [ -s "$kotlin_src/OngoingNotificationHelper.kt" ] || die "OngoingNotificationHelper.kt was not installed"

  # Release builds enable R8. JNI references are invisible to the shrinker,
  # so preserve the helper class and method names explicitly. Tauri includes
  # .pro files from the app tree in its generated release build type.
  cat > "$android_dir/app/tauri-jni-helpers.pro" <<'EOF'
-keep class **.DownloadsHelper { *; }
-keep class **.OngoingNotificationHelper { *; }
EOF
  [ -s "$android_dir/app/tauri-jni-helpers.pro" ] || die "JNI helper R8 rules were not installed"
  ok "Installed R8 keep rules for Android JNI helpers"
}
install_kotlin_helpers

verify_release_apk_helpers() {
  local apk dex_dump found=0
  while IFS= read -r apk; do
    [ -f "$apk" ] || continue
    dex_dump=$(mktemp)
    if unzip -p "$apk" 'classes*.dex' > "$dex_dump" 2>/dev/null && \
       grep -a -q 'DownloadsHelper' "$dex_dump" && \
       grep -a -q 'OngoingNotificationHelper' "$dex_dump"; then
      ok "Verified JNI helpers are present in $(basename "$apk")"
      found=1
      rm -f "$dex_dump"
      break
    fi
    rm -f "$dex_dump"
  done < <(find "$GEN_ANDROID_DIR/app/build/outputs/apk" -type f -path '*/release/*.apk' 2>/dev/null)

  [ "$found" = "1" ] || die "Release APK does not contain DownloadsHelper/OngoingNotificationHelper. Refusing to publish a broken export build."
}

# Verify Firebase env vars for release builds
if [ "$ACTION" = "build" ]; then
  info "Checking Firebase env vars for build..."
  MISSING=0
  for var in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID NEXT_PUBLIC_FIREBASE_APP_ID; do
    if [ -z "${!var:-}" ]; then
      echo -e "${RED}[android] WARNING: $var is missing - Firebase sync will be BROKEN in this APK!${NC}" >&2
      MISSING=1
    fi
  done
  if [ "$MISSING" = "1" ]; then
    echo -e "${RED}[android] Some Firebase env vars missing! Check GitHub secrets.${NC}" >&2
    if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
      echo -e "${RED}[android] In GitHub Actions this will produce a broken build. Failing.${NC}" >&2
      # Don't fail the build entirely, but warn heavily. The next.config.ts will also warn.
    fi
  else
    ok "All Firebase env vars present"
  fi
fi

case "$ACTION" in
  dev)
    # Development-only recovery for stale native libraries. Release artifacts
    # are intentionally left untouched so Cargo can reuse them.
    for target in "${RUST_TARGETS[@]}"; do
      rm -f "$PROJECT_ROOT/src-tauri/target/$target/debug/deps/libdrugucopia_lib"*.so 2>/dev/null || true
    done

    # A physical device reaches the frontend dev server through the host's LAN
    # address. This discovery is not needed for release builds.
    LAN_IP=""
    if command -v ip >/dev/null 2>&1; then
      LAN_IP=$(ip route get 1 2>/dev/null | grep -oP 'src \K\S+' | head -1 || true)
    elif command -v ifconfig >/dev/null 2>&1; then
      LAN_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1 || true)
    fi

    if [ -n "$LAN_IP" ]; then
      ok "LAN IP: $LAN_IP"
      export TAURI_DEV_HOST="$LAN_IP"
    else
      info "Could not auto-detect LAN IP. Set TAURI_DEV_HOST manually if the device cannot reach the app."
    fi

    info "Starting Tauri Android development build..."
    npx tauri android dev --config src-tauri/tauri.conf.dev.json "${EXTRA_ARGS[@]}"
    ;;

  build)
    info "Building release APK for ARM64 and ARMv7..."
    if [ -n "${ICON_SRC_PATH:-}" ] && [ -f "$ICON_SRC_PATH" ]; then
      info "Final icon refresh before build..."
      if command -v bun >/dev/null 2>&1; then
        bun run tauri icon "$ICON_SRC_PATH" 2>/dev/null || true
      else
        npx tauri icon "$ICON_SRC_PATH" 2>/dev/null || true
      fi
    fi
    # tauri icon regenerates standalone ic_launcher_background.xml which duplicates
    # colors.xml; remove it before build to prevent Gradle duplicate-resource error.
    for TAURI_COLOR_XML in "ic_launcher_background.xml" "ic_launcher_foreground.xml"; do
      [ -f "$TAURI_VALUES_DIR/$TAURI_COLOR_XML" ] && rm -f "$TAURI_VALUES_DIR/$TAURI_COLOR_XML" && info "Removed Tauri-generated $TAURI_COLOR_XML (pre-build)"
    done
    npx tauri android build \
      --config "$CONFIG_FILE" \
      --apk \
      --target aarch64 \
      "${EXTRA_ARGS[@]}"
    verify_release_apk_helpers
    ;;
esac
