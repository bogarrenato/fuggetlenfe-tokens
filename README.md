# fuggetlenfe-tokens

The design contract repository for the Fuggetlenfe platform.

This repository publishes two npm packages:

- `@fuggetlenfe/tokens`
- `@fuggetlenfe/brand-styles`

## What lives here

- the Figma Source Manifest (`src/figma-source-manifest.json`) — the authoritative map from Figma identifiers to shipped primitives, tokens, and wrapper exports
- the pluggable Figma sync sources under `src/sources/` (`variables-api.mjs` for live sync, `snapshot.mjs` for offline / non-Enterprise fallback)
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
FIGMA_TOKEN=your_token npm run figma:sync         # live sync (requires file_variables:read)
FIGMA_SOURCE=snapshot npm run figma:sync          # offline sync from tokens/figma-snapshot.json
npm run pack:check
```

### Sync sources

The sync selects a source via `FIGMA_SOURCE` (default `variables-api`):

| Source | Network | Scope required | When to use |
|---|---|---|---|
| `variables-api` | yes | `file_variables:read` (Enterprise) | Normal path for operators with Enterprise access; also refreshes `tokens/figma-snapshot.json` automatically |
| `snapshot` | no | none | CI builds, release pipelines on non-Enterprise plans, reproducible rebuilds from the committed snapshot |

The first successful `variables-api` run bootstraps `tokens/figma-snapshot.json`. Every subsequent CI build can then use `FIGMA_SOURCE=snapshot` without any Figma credentials.

### Source manifest

`src/figma-source-manifest.json` is the single authoritative mapping between the Figma file and the platform. It records the file identity, the roles of each Figma page, the brand and theme identifiers, and one entry per primitive with its Figma component set IDs, variant IDs, Stencil tag name, wrapper exports, and token lists. Governance rules are documented in the PoC monorepo under `docs/governance.md`.

## npm publishing

Publishing is handled by GitHub Actions and requires an `NPM_TOKEN` repository
secret. The release workflow publishes both packages with public access and
provenance enabled.
