# Image Text Composer

Desktop-only single-page image editor for PNG with multi-layer text overlays. Built with Next.js 14, TypeScript, React Konva. Deployed on Vercel.

## Features
- Upload PNG; canvas matches image aspect ratio and export maintains original dimensions.
- Multiple text layers: font family (Google Fonts via WebFont Loader), size, weight, color, opacity, alignment, multi-line content.
- Transform: drag, resize, rotate via Konva Transformer with multi-select support.
- Layer management: reorder (stacking), select, lock/unlock, duplicate.
- Canvas UX: snap-to-center, arrow-key nudging.
- Undo/Redo: 20+ steps with visible history count.
- Autosave to localStorage; Reset clears state.

## Tech Choices
- React Konva for performant canvas and precise transforms.
- Konva export APIs ensure crisp PNG export at exact sizes
- WebFont Loader for robust Google Fonts loading behavior across browsers.
- Zustand not required; simple immutable state with custom history stack.

## Run
- npm i
- npm run dev
- npm run build && npm start

## Known Limitations
- Desktop UI only.
- PNG-only import/export.
- No paid APIs; dynamic Google Fonts list limited to a curated set.
