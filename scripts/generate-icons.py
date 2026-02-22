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
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
    from PIL import Image

ROOT    = Path(__file__).parent.parent
ASSETS  = ROOT / "assets"
MASTER  = ASSETS / "icon-master.png"

if not MASTER.exists():
    print(f"ERROR: {MASTER} not found. Please add a 1024x1024 PNG as assets/icon-master.png")
    sys.exit(1)

img = Image.open(MASTER).convert("RGBA")
print(f"Master icon: {img.size}")

# ── macOS .icns ──────────────────────────────────────────────────────────────
if sys.platform == "darwin":
    iconset = ASSETS / "icon.iconset"
    iconset.mkdir(exist_ok=True)

    sizes = {
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
    for fname, size in sizes.items():
        img.resize((size, size), Image.LANCZOS).save(iconset / fname, "PNG")
        print(f"  {fname} ({size}x{size})")

    subprocess.check_call(["iconutil", "-c", "icns", str(iconset), "-o", str(ASSETS / "icon.icns")])
    print("✅ icon.icns")
else:
    print("⏭  Skipping icon.icns (macOS only)")

# ── Linux icon.png ───────────────────────────────────────────────────────────
img.resize((512, 512), Image.LANCZOS).save(ASSETS / "icon.png", "PNG")
print("✅ icon.png (Linux 512x512)")

# ── Windows icon.ico ─────────────────────────────────────────────────────────
ico_sizes = [(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)]
ico_imgs  = [img.resize(s, Image.LANCZOS) for s in ico_sizes]
ico_imgs[0].save(
    ASSETS / "icon.ico",
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_imgs[1:],
)
print("✅ icon.ico (Windows multi-size)")

print("\nAll icons generated successfully!")

