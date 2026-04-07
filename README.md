# @fuggetlenfe/tokens

Design token contract and brand-style CSS packs, driven by the Figma Variables API.

## Packages

- **@fuggetlenfe/tokens** — CSS custom property contract (`contract.css`), Figma preset, theme definitions, and the JS/TS token map.
- **@fuggetlenfe/brand-styles** (sub-package in `brand-styles/`) — Per-brand, per-theme CSS packs that override `--ff-*` custom properties.

## Figma Sync

```bash
FIGMA_TOKEN=<your-token> npm run figma:sync
```
