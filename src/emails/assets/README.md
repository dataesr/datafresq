# 📸 Email Assets

This directory contains image assets used in email templates.

## 🎯 Overview

Images can be embedded directly in emails using **base64 data URIs**, eliminating the need for external hosting (S3, CDN, etc.).

## 📁 Contents

```
assets/
├── index.ts           # Asset utilities and exports
├── README.md          # This file
└── [your-images].png  # Your PNG/JPG images
```

## 🚀 Quick Start

### Adding a New Image

**Option 1: Use the Helper Script (Recommended)**

```bash
bun scripts/add-email-asset.ts path/to/your-logo.png siesLogo
```

This will:
- ✅ Copy the image to this directory
- ✅ Validate size and format
- ✅ Show you the code to add
- ✅ Provide usage examples

**Option 2: Manual Process**

1. Place your PNG file in this directory
2. Edit `index.ts` and add:
   ```typescript
   export const emailAssets = {
     yourLogo: pngToBase64('./your-logo.png'),
   };
   ```
3. Use in templates:
   ```typescript
   import { emailAssets } from 'emails/assets';
   
   <img src={emailAssets.yourLogo} alt="Logo" />
   ```

## 📏 Image Specifications

### Logo (Organization/Ministry)
- **Max Width:** 80px
- **Max Height:** 50px
- **Format:** PNG with transparency
- **Max Size:** 50KB
- **Usage:** Email header

### Header Banner
- **Max Width:** 600px
- **Max Height:** 200px
- **Format:** PNG or JPEG
- **Max Size:** 100KB
- **Usage:** Hero section

### Icons
- **Max Width:** 48px
- **Max Height:** 48px
- **Format:** PNG with transparency
- **Max Size:** 10KB
- **Usage:** Decorative elements

## ⚠️ Important Considerations

### File Size
- **Keep total email size under 100KB** for best deliverability
- Base64 encoding increases size by ~33%
- Example: 75KB image → ~100KB base64 string
- Optimize images before embedding!

### When to Use Base64 vs External URLs

**Use Base64 (embedded) when:**
- ✅ Images are small (< 50KB)
- ✅ Logo or branding elements
- ✅ Icons
- ✅ You want guaranteed display (no external dependencies)
- ✅ Simple deployment (no need for image hosting)

**Use External URLs when:**
- ❌ Images are large (> 50KB)
- ❌ Photos or complex graphics
- ❌ You need to track image opens
- ❌ Images change frequently

## 🎨 Image Optimization

Before adding images, optimize them:

### Tools
- **TinyPNG:** https://tinypng.com/ (recommended)
- **Squoosh:** https://squoosh.app/
- **ImageOptim:** https://imageoptim.com/ (Mac)

### Command Line
```bash
# Using ImageMagick
convert input.png -strip -resize 80x50 -quality 85 output.png

# Using pngquant
pngquant --quality=65-80 input.png --output output.png
```

## 💡 Best Practices

1. **Optimize First**
   - Always optimize images before converting to base64
   - Use tools like TinyPNG or Squoosh
   - Aim for smallest file size with acceptable quality

2. **Use PNG for Transparency**
   - Logos with transparent backgrounds
   - Icons
   - Graphics with text

3. **Use JPEG for Photos**
   - Photos without transparency
   - Complex color gradients
   - Generally smaller file sizes

4. **Provide Alt Text**
   ```typescript
   <img src={emailAssets.logo} alt="Company Logo" />
   ```

5. **Specify Dimensions**
   ```typescript
   <img 
     src={emailAssets.logo} 
     alt="Logo" 
     width="80" 
     height="50"
     style={{ display: 'block', height: 'auto' }}
   />
   ```

## 📖 Usage Examples

### Example 1: Logo in Email Header

```typescript
import { emailAssets } from 'emails/assets';

<EmailLayout
  operatorLogoUrl={emailAssets.siesLogo}
  operatorName="Ministry Name"
/>
```

### Example 2: Custom Image

```typescript
import { emailAssets } from 'emails/assets';

<EmailSection>
  <img
    src={emailAssets.banner}
    alt="Welcome Banner"
    width="600"
    style={{ display: 'block', width: '100%', height: 'auto' }}
  />
</EmailSection>
```

### Example 3: Icon

```typescript
import { emailAssets } from 'emails/assets';

<EmailText>
  <img
    src={emailAssets.checkIcon}
    alt="✓"
    width="16"
    height="16"
    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}
  />
  Email verified
</EmailText>
```

## 🔍 Checking Asset Size

Use the built-in utility to check the size of your base64 assets:

```typescript
import { emailAssets, getBase64Size } from 'emails/assets';

const logoSize = getBase64Size(emailAssets.siesLogo);
console.log(`Logo size: ${logoSize}KB`);
```

## 🧪 Testing

After adding an asset:

1. **Preview in browser:**
   ```bash
   bun run preview:emails:server
   ```

2. **Check generated HTML:**
   ```bash
   bun run preview:emails
   # Open email-previews/invitation.html
   ```

3. **Send test email:**
   ```typescript
   import { sendInvitationEmail } from '~/external/email';
   await sendInvitationEmail('your-email@example.com', 'https://...');
   ```

4. **Test in multiple email clients:**
   - Gmail (web, mobile)
   - Outlook (desktop, web)
   - Apple Mail (macOS, iOS)
   - Other major clients

## 📊 Current Assets

To see all available assets, check `index.ts`:

```typescript
import { emailAssets } from 'emails/assets';

console.log(Object.keys(emailAssets));
// Example output: ['marianneLogoLight', 'siesLogo', 'ministryLogo']
```

## 🐛 Troubleshooting

**Image not showing in email:**
- ✅ Check that the file exists in this directory
- ✅ Verify the filename in `index.ts` matches exactly
- ✅ Make sure you're using the correct asset name
- ✅ Check browser console for errors in preview

**Email size too large:**
- ✅ Optimize images with TinyPNG
- ✅ Reduce image dimensions
- ✅ Convert large images to external URLs
- ✅ Use JPEG instead of PNG for photos

**Base64 conversion error:**
- ✅ Ensure file format is PNG, JPG, or JPEG
- ✅ Check file permissions
- ✅ Verify file path in `index.ts`

## 📚 Resources

- [Base64 Image Encoder](https://www.base64-image.de/)
- [TinyPNG](https://tinypng.com/) - Image optimization
- [Can I Email](https://www.caniemail.com/) - Email client support
- [Email on Acid](https://www.emailonacid.com/blog/article/email-development/image-optimization/)

## 🎯 Summary

- ✅ Store PNG/JPG images in this directory
- ✅ Use helper script: `bun scripts/add-email-asset.ts`
- ✅ Keep images small (< 50KB recommended)
- ✅ Optimize before embedding
- ✅ Test in multiple email clients
- ✅ Total email size should stay under 100KB