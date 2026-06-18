"""
Regenerate the favicon using the same brand gradient as the PWA icons.
Generates: favicon.ico (multi-size: 16, 32, 48), favicon-32.png, favicon-16.png
"""
from PIL import Image
import os

OUT_DIR = "/home/z/my-project/public"
ICON_DIR = "/home/z/my-project/public/icons"

# Brand gradient colors (same as PWA icons)
GRADIENT_TOP = (139, 92, 246)      # violet-500
GRADIENT_MID = (59, 130, 246)      # blue-500
GRADIENT_BOT = (168, 85, 247)      # purple-500


def apply_gradient(size):
    img = Image.new("RGB", (size, size), GRADIENT_MID)
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            if t < 0.5:
                u = t * 2
                r = int(GRADIENT_TOP[0] * (1 - u) + GRADIENT_MID[0] * u)
                g = int(GRADIENT_TOP[1] * (1 - u) + GRADIENT_MID[1] * u)
                b = int(GRADIENT_TOP[2] * (1 - u) + GRADIENT_MID[2] * u)
            else:
                u = (t - 0.5) * 2
                r = int(GRADIENT_MID[0] * (1 - u) + GRADIENT_BOT[0] * u)
                g = int(GRADIENT_MID[1] * (1 - u) + GRADIENT_BOT[1] * u)
                b = int(GRADIENT_MID[2] * (1 - u) + GRADIENT_BOT[2] * u)
            px[x, y] = (r, g, b)
    return img


def add_sparkle_mark(img, size):
    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = size // 2, size // 2
    r = int(size * 0.30)
    r_inner = int(size * 0.07)
    points = [
        (cx, cy - r), (cx + r_inner, cy - r_inner),
        (cx + r, cy), (cx + r_inner, cy + r_inner),
        (cx, cy + r), (cx - r_inner, cy + r_inner),
        (cx - r, cy), (cx - r_inner, cy - r_inner),
    ]
    draw.polygon(points, fill=(255, 255, 255, 255))
    # Small secondary sparkle
    r2 = int(size * 0.11)
    r2_inner = int(size * 0.027)
    cx2 = cx + int(size * 0.25)
    cy2 = cy - int(size * 0.22)
    points2 = [
        (cx2, cy2 - r2), (cx2 + r2_inner, cy2 - r2_inner),
        (cx2 + r2, cy2), (cx2 + r2_inner, cy2 + r2_inner),
        (cx2, cy2 + r2), (cx2 - r2_inner, cy2 + r2_inner),
        (cx2 - r2, cy2), (cx2 - r2_inner, cy2 - r2_inner),
    ]
    draw.polygon(points2, fill=(255, 255, 255, 230))
    return img


from PIL import ImageDraw

print("Regenerating favicon with brand gradient...")

# Generate at high res, then downscale for crispness
for size in [16, 32, 48]:
    img = apply_gradient(size)
    img = add_sparkle_mark(img, size)
    img.save(f"{ICON_DIR}/favicon-{size}.png")
    print(f"  ✓ favicon-{size}.png")

# Multi-size favicon.ico (16, 32, 48)
images = []
for size in [16, 32, 48]:
    img = apply_gradient(size)
    img = add_sparkle_mark(img, size)
    images.append(img)

# Save as ICO
images[0].save(f"{OUT_DIR}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=images[1:])
print(f"  ✓ favicon.ico (multi-size: 16, 32, 48)")

print("\nFavicon regenerated with PWA brand icon!")
