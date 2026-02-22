"""
generate-icons.py
Generates icon.icns (macOS), icon.ico (Windows), icon.png (Linux)
from assets/icon-master.png.

Run:  python3 scripts/generate-icons.py
Requires: Pillow  (pip install Pillow)
On macOS: iconutil is used to build the .icns file.
On Linux/Windows: .icns is skipped (not needed on those platforms).
"""

import os
import sys
import subprocess
from pathlib import Path

# Force UTF-8 on Windows — PowerShell defaults to cp1252
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
    from PIL import Image

ROOT   = Path(__file__).parent.parent
ASSETS = ROOT / "assets"
MASTER = ASSETS / "icon-master.png"

if not MASTER.exists():
    print(f"ERROR: {MASTER} not found. Add a 1024x1024 PNG as assets/icon-master.png")
    sys.exit(1)

img = Image.open(MASTER).convert("RGBA")
print(f"Master icon loaded: {img.size}")

# --------------------------------------------------------------------------
# macOS — .icns  (only works on macOS where iconutil is available)
# --------------------------------------------------------------------------
if sys.platform == "darwin":
    iconset = ASSETS / "icon.iconset"
    iconset.mkdir(exist_ok=True)

    icns_sizes = {
        "icon_16x16.png":      16,
        "icon_16x16@2x.png":   32,
        "icon_32x32.png":      32,
        "icon_32x32@2x.png":   64,
        "icon_128x128.png":    128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png":    256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png":    512,
        "icon_512x512@2x.png": 1024,
    }
    for fname, size in icns_sizes.items():
        img.resize((size, size), Image.LANCZOS).save(iconset / fname, "PNG")
        print(f"  OK {fname} ({size}x{size})")

    subprocess.check_call([
        "iconutil", "-c", "icns", str(iconset), "-o", str(ASSETS / "icon.icns")
    ])
    print("OK icon.icns created")
else:
    print("SKIP icon.icns (macOS only)")

# --------------------------------------------------------------------------
# Linux — icon.png (512x512)
# --------------------------------------------------------------------------
img.resize((512, 512), Image.LANCZOS).save(ASSETS / "icon.png", "PNG")
print("OK icon.png (Linux 512x512)")

# --------------------------------------------------------------------------
# Windows — icon.ico
# electron-builder requires the largest size (256x256) to be the base image.
# We save 256 as the primary and append smaller sizes.
# --------------------------------------------------------------------------
ico_sizes = [16, 32, 48, 64, 128, 256]
ico_images = [img.resize((s, s), Image.LANCZOS) for s in ico_sizes]

# Save largest first as base, append the rest
ico_images[-1].save(
    ASSETS / "icon.ico",
    format="ICO",
    sizes=[(s, s) for s in ico_sizes],
    append_images=ico_images[:-1],
)
print("OK icon.ico (Windows, 256x256 primary)")

print("\nAll icons generated successfully!")

