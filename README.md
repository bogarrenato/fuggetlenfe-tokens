# fuggetlenfe-tokens

The design contract repository for the Fuggetlenfe platform.

This repository publishes two npm packages:

- `@fuggetlenfe/tokens`
- `@fuggetlenfe/brand-styles`

## What lives here

- the Figma Variables sync entry point
- the semantic-first token binding logic with legacy aliases for compatibility
- the generated token contract files
- the official brand CSS packs

## Architectural intent

- Semantic tokens are the primary source for runtime colors and surfaces.
- Shared control tokens define reusable dimensions such as radius and padding.
- Component aliases such as `--ff-button-*` sit on top of the control layer so future primitives can share foundations without hard-coding button assumptions into the runtime.
- The generated `tokens.json` includes binding diagnostics so design and frontend teams can see which Figma variables resolved each contract token.

## Release order

This repository must be released before the other platform repositories.

1. `@fuggetlenfe/tokens`
2. `@fuggetlenfe/brand-styles`
3. `@fuggetlenfe/components`
4. `@fuggetlenfe/react-wrapper`
5. `@fuggetlenfe/angular-wrapper`

The other repositories install the published packages from npm. They do not
share token sources through a local workspace link in production.

## Local commands

```bash
npm install
npm test
FIGMA_TOKEN=your_token npm run figma:sync
npm run pack:check
```

## npm publishing

Publishing is handled by GitHub Actions and requires an `NPM_TOKEN` repository
secret. The release workflow publishes both packages with public access and
provenance enabled.
