#!/usr/bin/env python3
"""
Single source of truth for every app icon, PWA icon and splash asset.

WHY THIS EXISTS
---------------
The old assets rendered as a tiny logo floating in a large black border. That
was not one bug but a *compounding shrink chain*:

  1. public/logo-new.png (the 2048x2048 master) is a WIDE LOCKUP - the artwork
     only occupies rows 518..1440 and cols 122..1546. The rest of the square is
     flat background. So the master itself is ~45% empty vertically.
  2. public/logo-512.png and friends had the artwork pasted at only ~35% of the
     canvas (measured content bbox 166,166 -> 345,345 of 512), surrounded by
     TRANSPARENT pixels.
  3. scripts/android.sh then took that already-padded image and shrank it AGAIN
     to SAFE_RATIO = 0.66 for the adaptive-icon foreground.
       => 0.35 * 0.66 = ~23% of the launcher canvas.
  4. The splash composite shrank it AGAIN to 320/512 = 0.625.
       => 0.35 * 0.625 = ~22% of the splash canvas.
  5. The transparent padding fell back to black, and the artwork's own
     background (#030215) differs from the theme (#0a0a0a), so the small logo
     read as a dark square inside a bigger black square.

THE FIX
-------
Regenerate every asset from the master in ONE place, cropping to the actual
artwork and letting each target control padding exactly once:

  * The cornucopia MARK is isolated from the master (the "drugucopia" wordmark
    and ECG line are excluded - they turn to mush below 64px).
  * The artwork background is remapped from #030215 to the theme #0a0a0a so
    there is no visible square seam against the splash/launcher background.
  * Each output uses a padding budget appropriate to its platform, applied
    exactly once - never stacked on top of pre-existing padding.

PADDING BUDGETS
---------------
  legacy / PWA "any" / desktop / iOS : artwork covers ~100% (opaque, full bleed)
  maskable + Android adaptive fg     : artwork inside the 66% safe zone, on a
                                       full-bleed #0a0a0a background so the
                                       launcher mask never reveals a hole
  splash                             : artwork ~62% of the canvas, which is the
                                       Android 12+ SplashScreen convention

Usage:  python3 scripts/generate-icons.py [--check]
        --check  verify assets fill their canvas; exit 1 if any regressed
"""

from __future__ import annotations

import sys
import math
import pathlib

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required:  pip install Pillow")

try:
    import numpy as np
except ImportError:  # pragma: no cover
    np = None

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICONS = ROOT / "src-tauri" / "icons"

MASTER = PUBLIC / "logo-new.png"

# Theme background, matches manifest background_color / themes.xml / styles.xml.
THEME_BG = (10, 10, 10)
# The master artwork's own background (a very dark navy), used for keying.
ART_BG = (3, 2, 21)

# Artwork bounds inside the 2048x2048 master, measured not guessed.
MARK_BOX = (122, 518, 1546, 1440)     # cornucopia + pills + leaf
WORD_BOX = (330, 1080, 1880, 1500)    # "drugucopia" + ECG line
LOCKUP_BOX = (116, 518, 1917, 1518)   # everything

# Android adaptive icons only guarantee the inner 66% survives the shape mask.
SAFE_RATIO = 0.66
# Android 12+ splash icon convention.
SPLASH_RATIO = 0.62

# How much of a standard icon canvas the artwork occupies (measured across the
# artwork's WIDTH, which for the 1.8:1 lockup is its long axis).
#
# Chosen by the user from side-by-side rounded-icon renders, not by rule of
# thumb. Note that a generic "icon grids use ~80%" guideline is misleading for
# artwork this wide: at 82% width the lockup spanned nearly the full icon
# horizontally while using only 46% of the height, which read as oversized.
# 66% width gives the lockup real breathing room on all sides.
ICON_RATIO = 0.66

# Use the full lockup (mark + "drugucopia" wordmark + ECG) as the icon artwork.
# The wordmark is genuinely hard to read at 32-48px, but keeping the brand name
# on every surface is a deliberate product decision - see README-icons.md.
USE_LOCKUP = True


def inscribe_ratio(aspect: float, circle_frac: float = 72.0 / 108.0) -> float:
    """Width fraction of a canvas for a rectangle inscribed in a centred circle.

    Android composites adaptive icons under a mask that, in the worst case
    (a full circle), only reveals the inner 72dp of the 108dp canvas. A wide
    rectangle sized by the naive square "safe zone" ratio pokes its corners
    outside that circle and gets its ends clipped - which for the lockup means
    the first and last letters of "drugucopia" are shaved off.

    Solving (w/2)^2 + (h/2)^2 = r^2 with w = aspect * h gives the largest
    rectangle of this aspect that fits entirely inside the circle.
    """
    r = circle_frac / 2.0
    h = r / math.sqrt((aspect / 2.0) ** 2 + 0.25)
    return aspect * h


# ───────────────────────────── helpers ──────────────────────────────

def remap_bg(img: Image.Image, new_bg=THEME_BG, old_bg=ART_BG, tol=45.0) -> Image.Image:
    """Recolour the artwork's flat background to the theme colour.

    Uses a soft distance key so anti-aliased edges blend instead of fringing.
    Falls back to a hard replace when numpy is unavailable.
    """
    img = img.convert("RGB")
    if np is None:
        out = img.copy()
        px = out.load()
        for y in range(out.height):
            for x in range(out.width):
                r, g, b = px[x, y]
                if abs(r - old_bg[0]) + abs(g - old_bg[1]) + abs(b - old_bg[2]) < tol:
                    px[x, y] = new_bg
        return out
    a = np.asarray(img).astype(float)
    dist = np.abs(a - np.array(old_bg)).sum(axis=2)
    t = np.clip(dist / tol, 0.0, 1.0)[:, :, None]
    return Image.fromarray((a * t + np.array(new_bg) * (1.0 - t)).astype("uint8"))


def load_master() -> Image.Image:
    if not MASTER.exists():
        sys.exit(f"Master artwork missing: {MASTER}")
    return Image.open(MASTER).convert("RGB")


def get_mark(master: Image.Image) -> Image.Image:
    """Cornucopia mark with the wordmark and ECG painted out.

    The erase is feathered. A hard rectangle leaves a visible straight seam
    where it clips the artwork's soft drop shadow; a blurred mask blends the
    fill into the surrounding background instead.
    """
    mask = Image.new("L", master.size, 0)
    d = ImageDraw.Draw(mask)
    d.rectangle([420, 1060, 2047, 1380], fill=255)   # wordmark
    d.rectangle([280, 1345, 2047, 1580], fill=255)   # ECG tail
    mask = mask.filter(ImageFilter.GaussianBlur(22))
    flat = Image.new("RGB", master.size, ART_BG)
    m = Image.composite(flat, master, mask)
    return remap_bg(m.crop(MARK_BOX))


def get_lockup(master: Image.Image) -> Image.Image:
    return remap_bg(master.crop(LOCKUP_BOX))


# How aggressively the wide mark is zoomed to fill a square canvas.
#   0.0 = "contain": whole mark visible, but leaves empty bands top+bottom
#   1.0 = "cover":   fills edge to edge, but crops the horn tail off
# 0.35 was chosen by rendering the range and checking legibility under the
# circular and squircle launcher masks at 32/48/128px: it removes the obvious
# letterboxing while keeping the full horn, including the curled tail.
ZOOM = 0.35
# The mark's visual weight (bowl, pills, leaf) sits left of centre, so bias any
# horizontal crop toward the left rather than cropping symmetrically.
FOCUS_X = 0.10


def cover_square(img: Image.Image, size: int,
                 zoom: float = ZOOM, focus_x: float = FOCUS_X,
                 pad: float = 0.99, bg=THEME_BG) -> Image.Image:
    """Render the artwork into a square, interpolating between contain+cover.

    Straight "cover" would guillotine the horn tail; straight "contain" is what
    produced the letterboxed look in the first place. `zoom` blends the two.
    """
    s_contain = min(size * pad / img.width, size * pad / img.height)
    s_cover = size / min(img.width, img.height)
    s = s_contain + (s_cover - s_contain) * zoom

    r = img.resize((max(1, int(round(img.width * s))),
                    max(1, int(round(img.height * s)))), Image.LANCZOS)

    canvas = Image.new("RGB", (size, size), bg)
    if r.width <= size:
        x, sx, w = (size - r.width) // 2, 0, r.width
    else:
        x, sx, w = 0, int((r.width - size) * focus_x), size
    if r.height <= size:
        y, sy, h = (size - r.height) // 2, 0, r.height
    else:
        y, sy, h = 0, (r.height - size) // 2, size
    canvas.paste(r.crop((sx, sy, sx + w, sy + h)), (x, y))
    return canvas


def contain_square(img: Image.Image, size: int, ratio: float,
                   bg=THEME_BG, transparent=False) -> Image.Image:
    """Fit the whole artwork inside `ratio` of a square canvas."""
    inner = max(1, int(round(size * ratio)))
    s = min(inner / img.width, inner / img.height)
    r = img.resize((max(1, int(round(img.width * s))),
                    max(1, int(round(img.height * s)))), Image.LANCZOS)
    if transparent:
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        canvas.paste(r.convert("RGBA"), ((size - r.width) // 2, (size - r.height) // 2))
    else:
        canvas = Image.new("RGB", (size, size), bg)
        canvas.paste(r, ((size - r.width) // 2, (size - r.height) // 2))
    return canvas


def save(img: Image.Image, path: pathlib.Path, rgba=False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGBA" if rgba else "RGB").save(path, "PNG")
    print(f"  wrote {path.relative_to(ROOT)}  {img.width}x{img.height}")


# ───────────────────────────── generation ──────────────────────────────

def generate() -> None:
    master = load_master()
    mark = get_mark(master)
    lockup = get_lockup(master)
    print(f"Master {master.size} -> mark {mark.size}, lockup {lockup.size}")

    # The brand name stays on every surface, so the lockup is the icon artwork.
    art = lockup if USE_LOCKUP else mark
    aspect = art.width / art.height

    # Standard square icons. The lockup is ~1.8:1, so "cover" would crop the
    # name off entirely - it must be contained.
    #
    # Note this is NOT set as high as it can go. Filling the canvas edge to
    # edge (0.98) makes the icon look zoomed in and collides with the rounded
    # corners iOS and Android apply. Real icon grids seat content at roughly
    # 80% of the canvas, leaving a deliberate margin. ICON_RATIO is that
    # margin - it is a design choice, not wasted space, and it is the opposite
    # failure mode from the original tiny-logo bug.
    def full(size: int) -> Image.Image:
        if USE_LOCKUP:
            return contain_square(art, size, ICON_RATIO)
        return cover_square(art, size)

    # Maskable / adaptive.
    #
    # inscribe_ratio() returns the LARGEST rectangle that fits the launcher's
    # circle - i.e. artwork touching the circle edge. That is the maximum, not
    # a good look: on the launcher it reads just as oversized as a 98% square
    # icon does. What we actually want is for the artwork to sit inside the
    # VISIBLE CIRCLE with the same proportion it has inside a plain icon.
    #
    # The visible circle is `circle_frac` of the canvas, so scaling ICON_RATIO
    # by it keeps the two surfaces looking consistent. We still clamp to the
    # inscribed maximum so the wordmark can never be clipped.
    CIRCLE_FRAC = 72.0 / 108.0
    if USE_LOCKUP:
        mask_ratio = min(ICON_RATIO * CIRCLE_FRAC, inscribe_ratio(aspect))
    else:
        mask_ratio = min(SAFE_RATIO, inscribe_ratio(aspect))

    def maskable(size: int) -> Image.Image:
        return contain_square(art, size, mask_ratio)

    print(f"Icon artwork: {'lockup (name included)' if USE_LOCKUP else 'mark only'}"
          f" | aspect {aspect:.2f} | maskable inscribed at {mask_ratio:.0%}")

    print("\nPWA / web icons:")
    save(full(192), PUBLIC / "logo-192.png")
    save(full(512), PUBLIC / "logo-512.png")
    save(maskable(192), PUBLIC / "logo-192-maskable.png")
    save(maskable(512), PUBLIC / "logo-512-maskable.png")
    save(full(192), PUBLIC / "logo.png")
    # iOS home screen: never transparent, never masked by us - iOS rounds it.
    save(full(180), PUBLIC / "apple-touch-icon.png")

    print("\nDesktop / Tauri icons:")
    for size, name in [
        (32, "32x32.png"), (128, "128x128.png"), (256, "128x128@2x.png"),
        (16, "16.png"), (32, "32.png"), (48, "48.png"), (64, "64x64.png"),
        (256, "256.png"), (512, "icon.png"),
    ]:
        save(full(size), ICONS / name)

    print("\nWindows Store tiles:")
    # Windows composites tiles on a coloured plate and crowds them with a
    # label, so they want MORE margin than a plain icon, not less.
    for size, name in [
        (30, "Square30x30Logo.png"), (44, "Square44x44Logo.png"),
        (71, "Square71x71Logo.png"), (89, "Square89x89Logo.png"),
        (107, "Square107x107Logo.png"), (142, "Square142x142Logo.png"),
        (150, "Square150x150Logo.png"), (284, "Square284x284Logo.png"),
        (310, "Square310x310Logo.png"), (50, "StoreLogo.png"),
    ]:
        save(contain_square(art, size, ICON_RATIO - 0.04), ICONS / name)

    print("\niOS app icons:")
    ios = ICONS / "ios"
    if ios.exists():
        for p in sorted(ios.glob("*.png")):
            with Image.open(p) as im:
                sz = im.size[0]
            save(full(sz), p)

    print("\nmacOS iconset:")
    iconset = ICONS / "icon.iconset"
    if iconset.exists():
        for p in sorted(iconset.glob("*.png")):
            with Image.open(p) as im:
                sz = im.size[0]
            save(full(sz), p)

    # .icns / .ico so desktop bundles pick up the new art too.
    print("\nBundled .ico / .icns:")
    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    base = full(256)
    base.save(ICONS / "icon.ico", sizes=[(s, s) for s in ico_sizes])
    print(f"  wrote {(ICONS / 'icon.ico').relative_to(ROOT)}")
    try:
        icns_sizes = [16, 32, 64, 128, 256, 512, 1024]
        full(1024).save(ICONS / "icon.icns", format="ICNS",
                        sizes=[(s, s) for s in icns_sizes])
        print(f"  wrote {(ICONS / 'icon.icns').relative_to(ROOT)}")
    except Exception as e:
        print(f"  skipped icon.icns ({e}) - regenerate on macOS with iconutil")

    # Splash: the FULL lockup reads well here because a splash screen is large.
    print("\nSplash:")
    # Splash is large, so the full lockup is comfortably legible here.
    save(contain_square(lockup, 1024, SPLASH_RATIO), PUBLIC / "splash-1024.png")
    # Android SplashScreen applies a CIRCULAR mask to the animated icon,
    # so this one must be inscribed or the name gets its ends clipped.
    # The masked region is SPLASH_RATIO of the canvas, so inscribe within that.
    splash_icon_ratio = inscribe_ratio(lockup.width / lockup.height,
                                       circle_frac=SPLASH_RATIO)
    save(contain_square(lockup, 1024, splash_icon_ratio),
         PUBLIC / "splash-icon-1024.png")

    print("\nDone.")


# ───────────────────────────── verification ──────────────────────────────

def content_fill(path: pathlib.Path) -> float:
    """Fraction of the canvas' shorter side occupied by non-background art."""
    if np is None:
        return 1.0
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(int)
    alpha = a[:, :, 3]
    rgb = a[:, :, :3]
    bg = np.array(THEME_BG)
    visible = (alpha > 8) & (np.abs(rgb - bg).sum(axis=2) > 40)
    if not visible.any():
        return 0.0
    ys, xs = np.where(visible)
    w = xs.max() - xs.min() + 1
    h = ys.max() - ys.min() + 1
    return max(w, h) / max(im.size)


def check() -> int:
    # The maskable variants are intentionally inset. When the artwork is the
    # wide lockup they are inscribed in the launcher's circle (~58%), which is
    # SMALLER than the naive square safe zone (66%) - shrinking them further is
    # what keeps the wordmark's ends from being clipped. So the floor here is
    # derived from the same geometry the generator uses, not hardcoded.
    if USE_LOCKUP:
        master_aspect = (LOCKUP_BOX[2] - LOCKUP_BOX[0]) / (LOCKUP_BOX[3] - LOCKUP_BOX[1])
        mask_floor = min(ICON_RATIO * (72.0 / 108.0),
                         inscribe_ratio(master_aspect)) - 0.03
        full_floor = ICON_RATIO - 0.04
    else:
        mask_floor = 0.60
        full_floor = 0.90

    targets = {
        PUBLIC / "logo-512.png": full_floor,
        PUBLIC / "logo-192.png": full_floor,
        PUBLIC / "logo.png": full_floor,
        PUBLIC / "apple-touch-icon.png": full_floor,
        PUBLIC / "logo-512-maskable.png": mask_floor,
        PUBLIC / "logo-192-maskable.png": mask_floor,
        ICONS / "icon.png": full_floor,
        ICONS / "128x128.png": full_floor,
    }
    # Upper bound matters as much as the lower one. Earlier passes overshot to
    # 98% and then 82%, both of which read as zoomed in. The ceiling tracks the
    # chosen ICON_RATIO so "creeping back up" is caught, not just gross errors.
    CEILING = ICON_RATIO + 0.06

    bad = []
    print("Icon fill check (artwork extent / canvas):")
    for p, minimum in targets.items():
        if not p.exists():
            bad.append(f"{p.relative_to(ROOT)} MISSING")
            continue
        f = content_fill(p)
        too_small = f < minimum
        # maskable variants are deliberately inset well below the ceiling
        too_big = f > CEILING and "maskable" not in p.name
        status = "LOW" if too_small else ("BIG" if too_big else "ok ")
        if too_small:
            bad.append(f"{p.relative_to(ROOT)} fills {f:.0%}, expected >= {minimum:.0%}")
        elif too_big:
            bad.append(f"{p.relative_to(ROOT)} fills {f:.0%}, over the {CEILING:.0%} "
                       f"ceiling - artwork will look zoomed in and fight the "
                       f"rounded-corner mask")
        print(f"  [{status}] {str(p.relative_to(ROOT)):42s} {f:.0%}")
    if bad:
        print("\nFAIL - icon framing is out of range:")
        for b in bad:
            print("  - " + b)
        return 1
    print("\nAll icons fill their canvas.")
    return 0


if __name__ == "__main__":
    if "--check" in sys.argv:
        raise SystemExit(check())
    generate()
    raise SystemExit(check())
