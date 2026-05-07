# Custom Extension Icon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Design a custom SVG icon for the Task & TODO Manager Chrome extension and export it as the three PNG sizes (16×16, 48×48, 128×128) required by `manifest.json`.

**Architecture:** Author a single source SVG at `public/icons/icon.svg`, then use a Node.js script (`scripts/generate-icons.mjs`) powered by `sharp` to rasterise it at all three sizes. The generated PNGs replace the current 1×1 placeholders in `public/icons/`. No manifest changes needed — the paths are already correct.

**Tech Stack:** SVG (hand-authored), Node.js 24, `sharp` (SVG→PNG), Vite build

---

## Task 1: Design the Source SVG

**Files:**
- Create: `public/icons/icon.svg`

The icon is a 128×128 blue rounded-square with a white mini-checklist — three rows, each with a checkbox on the left and a label bar on the right. The top two rows show a filled checkbox (complete); the third is an empty checkbox (pending). This matches the app's visual language.

**Step 1: Create `public/icons/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Background -->
  <rect width="128" height="128" rx="22" fill="#3b82f6"/>

  <!-- Row 1 — complete -->
  <rect x="20" y="28" width="22" height="22" rx="5" fill="white"/>
  <polyline points="24,39 29,45 38,33" stroke="#3b82f6" stroke-width="3.5"
            fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="51" y="32" width="57" height="12" rx="5" fill="white" opacity="0.85"/>

  <!-- Row 2 — complete -->
  <rect x="20" y="59" width="22" height="22" rx="5" fill="white"/>
  <polyline points="24,70 29,76 38,64" stroke="#3b82f6" stroke-width="3.5"
            fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="51" y="63" width="45" height="12" rx="5" fill="white" opacity="0.85"/>

  <!-- Row 3 — pending -->
  <rect x="20" y="90" width="22" height="22" rx="5" fill="none"
        stroke="white" stroke-width="2.5" opacity="0.5"/>
  <rect x="51" y="94" width="51" height="12" rx="5" fill="white" opacity="0.35"/>
</svg>
```

**Step 2: Open the SVG in a browser to review it**

```bash
open public/icons/icon.svg
```

Visually verify the checklist rows are readable. Adjust coordinates or `rx`/opacity values if needed before generating PNGs.

**Step 3: Commit**

```bash
git add public/icons/icon.svg
git commit -m "feat: add source SVG icon for extension"
```

---

## Task 2: Install sharp and Write the Generation Script

**Files:**
- Create: `scripts/generate-icons.mjs`

`sharp` can rasterise an SVG buffer to PNG at any size. We install it as a dev dependency so it is never bundled into the extension.

**Step 1: Install sharp**

```bash
npm install --save-dev sharp
```

Expected: `sharp` added to `devDependencies` in `package.json`.

**Step 2: Create `scripts/generate-icons.mjs`**

```js
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(resolve(__dirname, '../public/icons/icon.svg'))

const sizes = [16, 48, 128]

await Promise.all(
  sizes.map((size) =>
    sharp(svg)
      .resize(size, size)
      .png()
      .toFile(resolve(__dirname, `../public/icons/icon${size}.png`))
  )
)

console.log('Icons generated: icon16.png, icon48.png, icon128.png')
```

**Step 3: Add a script to `package.json`**

In the `"scripts"` block, add:

```json
"generate-icons": "node scripts/generate-icons.mjs"
```

**Step 4: Commit**

```bash
git add scripts/generate-icons.mjs package.json
git commit -m "feat: add icon generation script using sharp"
```

---

## Task 3: Generate PNGs and Rebuild

**Files:**
- Modify: `public/icons/icon16.png`
- Modify: `public/icons/icon48.png`
- Modify: `public/icons/icon128.png`

**Step 1: Run the generation script**

```bash
npm run generate-icons
```

Expected output:
```
Icons generated: icon16.png, icon48.png, icon128.png
```

**Step 2: Verify the files are the correct size**

```bash
file public/icons/icon16.png public/icons/icon48.png public/icons/icon128.png
```

Expected: each reports `PNG image data, NxN` (16×16, 48×48, 128×128).

**Step 3: Build the extension**

```bash
npm run build
```

Expected: clean build, `dist/` updated with new PNG files.

**Step 4: Load and verify in Chrome**

1. Open `chrome://extensions`, enable Developer mode
2. Click the reload icon on the **Task & TODO Manager** card (or load unpacked from `dist/` if not yet loaded)
3. Check the toolbar — the icon should show the blue checklist design
4. Check `chrome://extensions` — the extension card should also display the 128×128 icon

**Step 5: Commit**

```bash
git add public/icons/icon16.png public/icons/icon48.png public/icons/icon128.png
git commit -m "feat: generate custom PNG icons from SVG source"
```

---

## Done

The extension now shows a custom blue checklist icon at all sizes. To iterate on the design, edit `public/icons/icon.svg` and re-run `npm run generate-icons` followed by `npm run build`.
