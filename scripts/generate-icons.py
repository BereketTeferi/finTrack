"""
Generate PWA icons for FinTrack.
Creates: 192x192, 512x512 (standard + maskable), 180x180 (Apple touch), favicon
All with the brand gradient (violet → blue → purple) and a Sparkles/"F" mark.
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = "/home/z/my-project/public/icons"
os.makedirs(OUT_DIR, exist_ok=True)

# Brand gradient colors (matching the CSS .gradient-fintech)
# violet → blue → purple (approximate oklch values converted to RGB)
GRADIENT_TOP = (139, 92, 246)      # violet-500
GRADIENT_MID = (59, 130, 246)      # blue-500
GRADIENT_BOT = (168, 85, 247)      # purple-500


def apply_gradient(size):
    """Create a diagonal gradient image (top-left → bottom-right)."""
    img = Image.new("RGB", (size, size), GRADIENT_MID)
    px = img.load()
    for y in range(size):
        for x in range(size):
            # Diagonal position 0..1
            t = (x + y) / (2 * size)
            if t < 0.5:
                # Top → Mid
                u = t * 2
                r = int(GRADIENT_TOP[0] * (1 - u) + GRADIENT_MID[0] * u)
                g = int(GRADIENT_TOP[1] * (1 - u) + GRADIENT_MID[1] * u)
                b = int(GRADIENT_TOP[2] * (1 - u) + GRADIENT_MID[2] * u)
            else:
                # Mid → Bottom
                u = (t - 0.5) * 2
                r = int(GRADIENT_MID[0] * (1 - u) + GRADIENT_BOT[0] * u)
                g = int(GRADIENT_MID[1] * (1 - u) + GRADIENT_BOT[1] * u)
                b = int(GRADIENT_MID[2] * (1 - u) + GRADIENT_BOT[2] * u)
            px[x, y] = (r, g, b)
    return img


def add_sparkle_mark(img, size):
    """Draw a white sparkle/diamond mark in the center."""
    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = size // 2, size // 2
    # Draw a 4-pointed star (sparkle)
    r = int(size * 0.28)  # outer radius
    r_inner = int(size * 0.06)  # inner radius
    points = [
        (cx, cy - r),                    # top
        (cx + r_inner, cy - r_inner),    # top-right
        (cx + r, cy),                    # right
        (cx + r_inner, cy + r_inner),    # bottom-right
        (cx, cy + r),                    # bottom
        (cx - r_inner, cy + r_inner),    # bottom-left
        (cx - r, cy),                    # left
        (cx - r_inner, cy - r_inner),    # top-left
    ]
    draw.polygon(points, fill=(255, 255, 255, 255))
    # Small secondary sparkle (top-right)
    r2 = int(size * 0.10)
    r2_inner = int(size * 0.025)
    cx2 = cx + int(size * 0.25)
    cy2 = cy - int(size * 0.22)
    points2 = [
        (cx2, cy2 - r2),
        (cx2 + r2_inner, cy2 - r2_inner),
        (cx2 + r2, cy2),
        (cx2 + r2_inner, cy2 + r2_inner),
        (cx2, cy2 + r2),
        (cx2 - r2_inner, cy2 + r2_inner),
        (cx2 - r2, cy2),
        (cx2 - r2_inner, cy2 - r2_inner),
    ]
    draw.polygon(points2, fill=(255, 255, 255, 230))
    return img


def add_rounded_corners(img, radius_ratio=0.22):
    """Apply rounded corners to the image."""
    size = img.size[0]
    radius = int(size * radius_ratio)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(img, (0, 0))
    result.putalpha(mask)
    return result


def make_icon(size, maskable=False, rounded=True):
    """Generate an icon of the given size."""
    img = apply_gradient(size)
    img = add_sparkle_mark(img, size)
    img = img.convert("RGBA")
    if rounded and not maskable:
        img = add_rounded_corners(img, radius_ratio=0.22)
    if maskable:
        # For maskable icons, add padding so the safe zone (~80%) contains the mark
        # The gradient fills the full canvas (no rounded corners — the OS masks it)
        pass
    return img


# Generate all required sizes
print("Generating icons...")

# Standard icons
make_icon(192).save(f"{OUT_DIR}/icon-192.png")
print(f"  ✓ icon-192.png")
make_icon(512).save(f"{OUT_DIR}/icon-512.png")
print(f"  ✓ icon-512.png")

# Maskable icons (for Android adaptive icons — no rounded corners, full bleed)
make_icon(192, maskable=True, rounded=False).save(f"{OUT_DIR}/icon-192-maskable.png")
print(f"  ✓ icon-192-maskable.png")
make_icon(512, maskable=True, rounded=False).save(f"{OUT_DIR}/icon-512-maskable.png")
print(f"  ✓ icon-512-maskable.png")

# Apple touch icon (180x180, no transparency, square — iOS rounds it)
apple_icon = make_icon(180, rounded=False)
# Composite onto solid background to remove transparency
bg = Image.new("RGB", (180, 180), GRADIENT_MID)
bg.paste(apple_icon, (0, 0), apple_icon)
bg.save(f"{OUT_DIR}/apple-touch-icon.png")
print(f"  ✓ apple-touch-icon.png")

# Favicon (32x32)
favicon = make_icon(32, rounded=False)
bg = Image.new("RGB", (32, 32), GRADIENT_MID)
bg.paste(favicon, (0, 0), favicon)
bg.save(f"{OUT_DIR}/favicon-32.png")
print(f"  ✓ favicon-32.png")

# Also save as favicon.ico (just a copy of the 32px)
bg.save("/home/z/my-project/public/favicon.ico")
print(f"  ✓ favicon.ico")

print(f"\nAll icons saved to {OUT_DIR}/")
print(f"Total: {len(os.listdir(OUT_DIR))} files")
