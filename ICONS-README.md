# ⚠️ IMPORTANT: PWA Icons Missing

Your PWA app requires icons for installation. Please add these files to the `public/` folder:

## Required Files

1. **icon-192x192.png** (192x192 pixels)
2. **icon-512x512.png** (512x512 pixels)

## Quick Solution

### Option 1: Use Free Icon Generator

1. Go to [favicon.io/favicon-generator](https://favicon.io/favicon-generator/)
2. Create a simple icon with text "AF" (Adtani Footwear)
3. Download and extract
4. Rename files:
   - `android-chrome-192x192.png` → `icon-192x192.png`
   - `android-chrome-512x512.png` → `icon-512x512.png`
5. Copy to `public/` folder

### Option 2: Use Your Logo

If you have a company logo:

1. Resize it to 192x192 and 512x512 pixels
2. Save as PNG format
3. Name them as above
4. Place in `public/` folder

### Option 3: Use Placeholder (Development Only)

Create simple colored squares:

```bash
# On Windows with ImageMagick installed:
magick -size 192x192 xc:#1f2937 public/icon-192x192.png
magick -size 512x512 xc:#1f2937 public/icon-512x512.png

# Or download placeholders from:
# https://placeholder.com/192x192
# https://placeholder.com/512x512
```

## After Adding Icons

1. Commit the new files:
   ```bash
   git add public/icon-*.png
   git commit -m "Add PWA icons"
   git push
   ```

2. Vercel will auto-deploy

3. Test PWA installation:
   - Clear browser cache
   - Open app in Chrome
   - Try "Install App"
   - Icon should appear properly

## Recommended Icon Design

For best results:
- **Background**: Solid color matching your brand
- **Foreground**: Company logo or initials
- **Style**: Simple, recognizable at small sizes
- **Format**: PNG with transparency
- **Safe area**: Keep important content 10% inset from edges

---

The app will still work without icons, but won't install properly as a PWA until you add them.
