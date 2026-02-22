# App Icons

Place your app icons here before building:

| File | Platform | Size |
|------|----------|------|
| `icon.icns` | macOS | 512x512 (multi-resolution) |
| `icon.ico` | Windows | 256x256 (multi-resolution) |
| `icon.png` | Linux | 512x512 |

## Generating icons from a single PNG

If you have a 1024x1024 `icon.png`, you can generate all formats:

```bash
# Install electron-icon-maker
npx electron-icon-maker --input=icon.png --output=./

# Or use the icon from your public/ directory
cp ../public/icon.svg icon.svg
```

