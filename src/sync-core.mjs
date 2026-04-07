const COLOR_MODE_ALIASES = {
  light: ['light', 'default', 'base', 'day'],
  dark: ['dark', 'night']
};

const THEME_BINDINGS = {
  light: {
    canvas: ['semantic/background/canvas', 'theme/light/canvas', 'background/neutral/primary'],
    surface: ['semantic/background/surface', 'theme/light/surface', 'background/neutral/primary'],
    textPrimary: ['semantic/text/primary', 'text/neutral/primary'],
    textSecondary: ['semantic/text/secondary', 'text/neutral/secondary', 'text/neutral/tertiary'],
    textMuted: ['semantic/text/muted', 'text/neutral/muted', 'text/neutral/disabled'],
    borderSubtle: ['semantic/border/subtle', 'border/neutral/subtle', 'background/neutral/disabled']
  },
  dark: {
    canvas: ['semantic/background/canvas', 'theme/dark/canvas', 'background/neutral/primary'],
    surface: ['semantic/background/surface', 'theme/dark/surface', 'background/neutral/primary'],
    textPrimary: ['semantic/text/primary', 'text/neutral/primary'],
    textSecondary: ['semantic/text/secondary', 'text/neutral/secondary', 'text/neutral/tertiary'],
    textMuted: ['semantic/text/muted', 'text/neutral/muted', 'text/neutral/disabled'],
    borderSubtle: ['semantic/border/subtle', 'border/neutral/subtle', 'background/neutral/disabled']
  }
};

const BRAND_BINDINGS = {
  'brand-1': {
    label: 'Brand 1',
    fontFamily: { candidates: ['font/family/arial'], unit: null },
    radius: { candidates: ['border-radius/0', 'borderradius/0'], unit: 'px' },
    paddingInline: { candidates: ['spacing/8'], unit: 'px' },
    paddingBlock: { candidates: ['spacing/0'], unit: 'px' }
  },
  'brand-2': {
    label: 'Brand 2',
    fontFamily: { candidates: ['font/family/inter'], unit: null },
    radius: { candidates: ['border-radius/4', 'borderradius/4'], unit: 'px' },
    paddingInline: { candidates: ['spacing/8'], unit: 'px' },
    paddingBlock: { candidates: ['spacing/0'], unit: 'px' }
  },
  'brand-3': {
    label: 'Brand 3',
    fontFamily: { candidates: ['font/family/opensans', 'font/family/open-sans'], unit: null },
    radius: { candidates: ['border-radius/999', 'borderradius/999'], unit: 'px' },
    paddingInline: { candidates: ['spacing/16'], unit: 'px' },
    paddingBlock: { candidates: ['spacing/4'], unit: 'px' }
  }
};

const BUTTON_BINDINGS = {
  'brand-1': {
    default: {
      background: ['component/button/brand-1/background/default', 'background/brand1/primary'],
      foreground: ['component/button/brand-1/foreground/default', 'text/brand1/inverse']
    },
    hover: {
      background: ['component/button/brand-1/background/hover', 'background/brand1/secondary'],
      foreground: ['component/button/brand-1/foreground/hover', 'text/brand1/inverse']
    },
    active: {
      background: ['component/button/brand-1/background/active', 'background/brand1/tertiary'],
      foreground: ['component/button/brand-1/foreground/active', 'text/brand1/primary']
    },
    disabled: {
      background: ['component/button/brand-1/background/disabled', 'background/neutral/disabled'],
      foreground: ['component/button/brand-1/foreground/disabled', 'text/neutral/disabled']
    }
  },
  'brand-2': {
    default: {
      background: ['component/button/brand-2/background/default', 'background/brand2/primary'],
      foreground: ['component/button/brand-2/foreground/default', 'semantic/text/primary', 'text/neutral/primary']
    },
    hover: {
      background: ['component/button/brand-2/background/hover', 'background/brand2/secondary'],
      foreground: ['component/button/brand-2/foreground/hover', 'semantic/text/primary', 'text/neutral/primary']
    },
    active: {
      background: ['component/button/brand-2/background/active', 'background/brand2/tertiary'],
      foreground: ['component/button/brand-2/foreground/active', 'text/neutral/tertiary', 'semantic/text/secondary']
    },
    disabled: {
      background: ['component/button/brand-2/background/disabled', 'background/neutral/disabled'],
      foreground: ['component/button/brand-2/foreground/disabled', 'semantic/text/muted', 'text/neutral/disabled']
    }
  },
  'brand-3': {
    default: {
      background: ['component/button/brand-3/background/default', 'background/brand3/primary'],
      foreground: ['component/button/brand-3/foreground/default', 'text/neutral/tertiary', 'semantic/text/secondary']
    },
    hover: {
      background: ['component/button/brand-3/background/hover', 'background/brand3/secondary'],
      foreground: ['component/button/brand-3/foreground/hover', 'text/neutral/tertiary', 'semantic/text/secondary']
    },
    active: {
      background: ['component/button/brand-3/background/active', 'background/brand3/tertiary'],
      foreground: ['component/button/brand-3/foreground/active', 'text/neutral/tertiary', 'semantic/text/secondary']
    },
    disabled: {
      background: ['component/button/brand-3/background/disabled', 'background/neutral/disabled'],
      foreground: ['component/button/brand-3/foreground/disabled', 'semantic/text/muted', 'text/neutral/disabled']
    }
  }
};

const BRAND_STYLE_THEMES = ['light', 'dark'];

export function buildTokensFromVariablePayload(variablePayload, options = {}) {
  const registry = createVariableRegistry(variablePayload);
  const syncedAt = options.syncedAt ?? new Date().toISOString();
  const figmaFileKey = options.figmaFileKey ?? 'unknown';
  const warnings = [];

  const palettes = extractPaletteTokens(registry);
  if (Object.keys(palettes).length === 0) {
    warnings.push('No palette variables matched the expected palette naming patterns.')
  }

  const themes = Object.fromEntries(
    Object.entries(THEME_BINDINGS).map(([themeName, themeBindings]) => [
      themeName,
      Object.fromEntries(
        Object.entries(themeBindings).map(([tokenName, candidates]) => [
          tokenName,
          resolveBinding(registry, {
            candidates,
            modeName: themeName,
            tokenName: `${themeName}.${tokenName}`
          })
        ])
      )
    ])
  );

  const brands = Object.fromEntries(
    Object.entries(BRAND_BINDINGS).map(([brandName, brandBindings]) => [
      brandName,
      {
        label: brandBindings.label,
        fontFamily: resolveBinding(registry, {
          ...brandBindings.fontFamily,
          tokenName: `${brandName}.fontFamily`
        }),
        radius: resolveBinding(registry, {
          ...brandBindings.radius,
          tokenName: `${brandName}.radius`
        }),
        paddingInline: resolveBinding(registry, {
          ...brandBindings.paddingInline,
          tokenName: `${brandName}.paddingInline`
        }),
        paddingBlock: resolveBinding(registry, {
          ...brandBindings.paddingBlock,
          tokenName: `${brandName}.paddingBlock`
        })
      }
    ])
  );

  const button = Object.fromEntries(
    Object.entries(BUTTON_BINDINGS).map(([brandName, stateBindings]) => [
      brandName,
      Object.fromEntries(
        BRAND_STYLE_THEMES.map((themeName) => [
          themeName,
          Object.fromEntries(
            Object.entries(stateBindings).map(([stateName, styleBindings]) => [
              stateName,
              {
                background: resolveBinding(registry, {
                  candidates: styleBindings.background,
                  modeName: themeName,
                  tokenName: `${brandName}.${themeName}.button.${stateName}.background`
                }),
                foreground: resolveBinding(registry, {
                  candidates: styleBindings.foreground,
                  modeName: themeName,
                  tokenName: `${brandName}.${themeName}.button.${stateName}.foreground`
                })
              }
            ])
          )
        ])
      )
    ])
  );

  return {
    meta: {
      source: {
        figmaFileKey,
        syncedAt,
        strategy: 'variables-local',
        requiredScope: 'file_variables:read'
      },
      notes: [
        'Generated from the Figma Variables API.',
        'The sync resolves named token bindings and fails fast when required tokens are missing.'
      ],
      warnings
    },
    palettes,
    themes,
    brands,
    components: {
      button
    }
  };
}

export function buildGeneratedArtifacts(tokens) {
  return {
    tokensJson: `${JSON.stringify(tokens, null, 2)}\n`,
    contractCss: buildContractCss(tokens),
    figmaPresetCss: buildFigmaPresetCss(tokens),
    themeCss: buildThemeCss(),
    indexJs: buildIndexJs(),
    indexTypes: buildIndexTypes(),
    brandStyles: buildOfficialBrandStyles(tokens)
  };
}

export function buildContractCss(tokens) {
  const defaultBrandName = Object.keys(tokens.components.button)[0] ?? 'brand-1';
  const defaultThemeName = Object.keys(tokens.themes)[0] ?? 'light';
  const defaultBrand = tokens.brands[defaultBrandName];
  const defaultTheme = tokens.themes[defaultThemeName];
  const defaultButton = tokens.components.button[defaultBrandName]?.[defaultThemeName] ?? {};

  return `/*
  Stable public token contract.

  Components may consume these variables, but should not redefine brand or theme values.
  Official brand packs and consumer-owned override packs sit on top of this contract.
*/
:root {
  --ff-font-family-brand: ${defaultBrand?.fontFamily ?? 'inherit'};
  --ff-button-radius: ${defaultBrand?.radius ?? '0px'};
  --ff-button-padding-inline: ${defaultBrand?.paddingInline ?? '0.875rem'};
  --ff-button-padding-block: ${defaultBrand?.paddingBlock ?? '0.5rem'};
  --ff-color-canvas: ${defaultTheme?.canvas ?? '#ffffff'};
  --ff-color-surface: ${defaultTheme?.surface ?? '#ffffff'};
  --ff-color-text-primary: ${defaultTheme?.textPrimary ?? '#111111'};
  --ff-color-text-secondary: ${defaultTheme?.textSecondary ?? '#5f5f5f'};
  --ff-color-text-muted: ${defaultTheme?.textMuted ?? '#8b8b8b'};
  --ff-color-border-subtle: ${defaultTheme?.borderSubtle ?? '#d8d8d8'};
  --ff-button-bg-default: ${defaultButton.default?.background ?? 'transparent'};
  --ff-button-fg-default: ${defaultButton.default?.foreground ?? 'currentColor'};
  --ff-button-bg-hover: ${defaultButton.hover?.background ?? 'transparent'};
  --ff-button-fg-hover: ${defaultButton.hover?.foreground ?? 'currentColor'};
  --ff-button-bg-active: ${defaultButton.active?.background ?? 'transparent'};
  --ff-button-fg-active: ${defaultButton.active?.foreground ?? 'currentColor'};
  --ff-button-bg-disabled: ${defaultButton.disabled?.background ?? 'transparent'};
  --ff-button-fg-disabled: ${defaultButton.disabled?.foreground ?? '#9a9a9a'};
}
`;
}

export function buildFigmaPresetCss(tokens) {
  const paletteCss = Object.entries(tokens.palettes)
    .map(([groupName, values]) =>
      Object.entries(values)
        .map(([step, color]) => `  --ff-palette-${groupName}-${step}: ${color};`)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n');

  const brandCss = Object.entries(tokens.brands)
    .map(
      ([brandName, config]) => `
[data-brand="${brandName}"] {
  --ff-font-family-brand: ${config.fontFamily};
  --ff-button-radius: ${config.radius};
  --ff-button-padding-inline: ${config.paddingInline};
  --ff-button-padding-block: ${config.paddingBlock};
}`.trim()
    )
    .join('\n\n');

  const themeCss = Object.entries(tokens.themes)
    .map(
      ([themeName, values]) => `
[data-theme="${themeName}"] {
  --ff-color-canvas: ${values.canvas};
  --ff-color-surface: ${values.surface};
  --ff-color-text-primary: ${values.textPrimary};
  --ff-color-text-secondary: ${values.textSecondary};
  --ff-color-text-muted: ${values.textMuted};
  --ff-color-border-subtle: ${values.borderSubtle};
}`.trim()
    )
    .join('\n\n');

  const buttonCss = Object.entries(tokens.components.button)
    .flatMap(([brandName, themeVariants]) =>
      Object.entries(themeVariants).map(
        ([themeName, states]) => `
[data-brand="${brandName}"][data-theme="${themeName}"] {
  --ff-button-bg-default: ${states.default.background};
  --ff-button-fg-default: ${states.default.foreground};
  --ff-button-bg-hover: ${states.hover.background};
  --ff-button-fg-hover: ${states.hover.foreground};
  --ff-button-bg-active: ${states.active.background};
  --ff-button-fg-active: ${states.active.foreground};
  --ff-button-bg-disabled: ${states.disabled.background};
  --ff-button-fg-disabled: ${states.disabled.foreground};
}`.trim()
      )
    )
    .join('\n\n');

  return `/*
  Generated from the Figma Variables API.
  This file is a full design snapshot and should not be hand-edited.
*/
${paletteCss ? `:root {\n${paletteCss}\n}\n\n` : ''}${brandCss}

${themeCss}

${buttonCss}
`;
}

export function buildThemeCss() {
  return `@import './contract.css';
@import './figma-preset.css';
`;
}

export function buildIndexJs() {
  return `import tokens from './tokens.json' with { type: 'json' };

export { tokens };
export const contractStylesheet = './contract.css';
export const figmaPresetStylesheet = './figma-preset.css';
export const themeStylesheet = './theme.css';
`;
}

export function buildIndexTypes() {
  return `export declare const tokens: typeof import('./tokens.json');
export declare const contractStylesheet: string;
export declare const figmaPresetStylesheet: string;
export declare const themeStylesheet: string;
`;
}

export function buildOfficialBrandStyles(tokens) {
  const brandStyles = {};

  for (const [brandName, brandConfig] of Object.entries(tokens.brands)) {
    for (const themeName of BRAND_STYLE_THEMES) {
      const themeValues = tokens.themes[themeName];
      const buttonValues = tokens.components.button[brandName]?.[themeName];
      if (!themeValues || !buttonValues) {
        continue;
      }

      brandStyles[`${brandName}-${themeName}.css`] = `/*
  Generated from the Figma Variables API.
  This is an official brand pack file. Do not hand-edit it.
*/
[data-theme='${themeName}'] {
  --ff-color-canvas: ${themeValues.canvas};
  --ff-color-surface: ${themeValues.surface};
  --ff-color-text-primary: ${themeValues.textPrimary};
  --ff-color-text-secondary: ${themeValues.textSecondary};
  --ff-color-text-muted: ${themeValues.textMuted};
  --ff-color-border-subtle: ${themeValues.borderSubtle};
}

[data-brand='${brandName}'] {
  --ff-font-family-brand: ${brandConfig.fontFamily};
  --ff-button-radius: ${brandConfig.radius};
  --ff-button-padding-inline: ${brandConfig.paddingInline};
  --ff-button-padding-block: ${brandConfig.paddingBlock};
}

[data-brand='${brandName}'][data-theme='${themeName}'] {
  --ff-button-bg-default: ${buttonValues.default.background};
  --ff-button-fg-default: ${buttonValues.default.foreground};
  --ff-button-bg-hover: ${buttonValues.hover.background};
  --ff-button-fg-hover: ${buttonValues.hover.foreground};
  --ff-button-bg-active: ${buttonValues.active.background};
  --ff-button-fg-active: ${buttonValues.active.foreground};
  --ff-button-bg-disabled: ${buttonValues.disabled.background};
  --ff-button-fg-disabled: ${buttonValues.disabled.foreground};
}
`;
    }
  }

  return brandStyles;
}

function createVariableRegistry(variablePayload) {
  const meta = variablePayload?.meta ?? variablePayload ?? {};
  const variableCollections = asRecord(meta.variableCollections ?? {});
  const variables = asRecord(meta.variables ?? {});

  const collectionsById = new Map();
  for (const [collectionId, collection] of Object.entries(variableCollections)) {
    collectionsById.set(collectionId, {
      id: collection.id ?? collectionId,
      name: collection.name ?? collectionId,
      defaultModeId: collection.defaultModeId,
      modes: (collection.modes ?? []).map((mode) => ({
        id: mode.modeId ?? mode.id,
        name: mode.name ?? mode.modeId ?? mode.id
      }))
    });
  }

  const variablesById = new Map();
  const variablesByNormalizedName = new Map();

  for (const [variableId, variable] of Object.entries(variables)) {
    const collection = collectionsById.get(variable.variableCollectionId) ?? {
      id: variable.variableCollectionId ?? 'unknown',
      name: variable.variableCollectionId ?? 'unknown',
      defaultModeId: firstKey(variable.valuesByMode),
      modes: Object.keys(variable.valuesByMode ?? {}).map((modeId) => ({ id: modeId, name: modeId }))
    };

    const record = {
      id: variable.id ?? variableId,
      name: variable.name ?? variableId,
      normalizedName: normalizeTokenPath(variable.name ?? variableId),
      resolvedType: variable.resolvedType ?? 'UNKNOWN',
      valuesByMode: variable.valuesByMode ?? {},
      collection
    };

    variablesById.set(record.id, record);
    if (!variablesByNormalizedName.has(record.normalizedName)) {
      variablesByNormalizedName.set(record.normalizedName, []);
    }
    variablesByNormalizedName.get(record.normalizedName).push(record);
  }

  return {
    collectionsById,
    variablesById,
    variablesByNormalizedName
  };
}

function extractPaletteTokens(registry) {
  const palettes = {};

  for (const variables of registry.variablesByNormalizedName.values()) {
    for (const variable of variables) {
      if (variable.resolvedType !== 'COLOR') {
        continue;
      }

      const paletteMatch =
        variable.normalizedName.match(/^palette\/([^/]+)\/(\d+)$/) ??
        variable.normalizedName.match(/^color\/([^/]+)\/(\d+)$/) ??
        variable.normalizedName.match(/^([^/]+)\/(\d+)$/);

      if (!paletteMatch) {
        continue;
      }

      const [, rawGroupName, rawStep] = paletteMatch;
      if (!/^\d+$/.test(rawStep)) {
        continue;
      }

      const groupName = normalizePaletteGroup(rawGroupName);
      const colorValue = resolveVariableValue(registry, variable, { modeName: undefined });
      if (!groupName || !colorValue) {
        continue;
      }

      if (!palettes[groupName]) {
        palettes[groupName] = {};
      }
      palettes[groupName][rawStep] = colorValue;
    }
  }

  return sortPaletteGroups(palettes);
}

function resolveBinding(registry, binding) {
  const { candidates, modeName, unit, tokenName } = binding;
  const normalizedCandidates = candidates.map((candidate) => normalizeTokenPath(candidate));

  for (const candidateName of normalizedCandidates) {
    const matchingVariables = registry.variablesByNormalizedName.get(candidateName) ?? [];
    if (matchingVariables.length === 0) {
      continue;
    }

    const value = resolveVariableValue(registry, matchingVariables[0], { modeName, unit });
    if (value !== undefined) {
      return value;
    }
  }

  throw new Error(
    `Missing required Figma variable binding for "${tokenName}". Checked: ${candidates.join(', ')}.`
  );
}

function resolveVariableValue(registry, variable, options, visitedIds = new Set()) {
  if (visitedIds.has(variable.id)) {
    throw new Error(`Detected a circular alias while resolving "${variable.name}".`);
  }

  const modeId = pickModeId(variable, options.modeName);
  const rawValue = variable.valuesByMode[modeId];
  if (rawValue === undefined) {
    return undefined;
  }

  if (isVariableAlias(rawValue)) {
    const aliasVariable = registry.variablesById.get(rawValue.id);
    if (!aliasVariable) {
      throw new Error(`Variable alias target "${rawValue.id}" is missing for "${variable.name}".`);
    }

    visitedIds.add(variable.id);
    const resolvedAlias = resolveVariableValue(registry, aliasVariable, options, visitedIds);
    visitedIds.delete(variable.id);
    return resolvedAlias;
  }

  return formatCssValue(rawValue, options.unit);
}

function pickModeId(variable, requestedModeName) {
  const modeIds = Object.keys(variable.valuesByMode);
  if (modeIds.length === 0) {
    return undefined;
  }

  if (!requestedModeName) {
    return variable.collection.defaultModeId && modeIds.includes(variable.collection.defaultModeId)
      ? variable.collection.defaultModeId
      : modeIds[0];
  }

  const requestedModeAliases = COLOR_MODE_ALIASES[requestedModeName] ?? [requestedModeName];
  const matchingMode = variable.collection.modes.find((mode) => {
    const normalizedModeName = normalizeTokenPath(mode.name);
    return requestedModeAliases.some((alias) => normalizeTokenPath(alias) === normalizedModeName);
  });

  if (matchingMode && modeIds.includes(matchingMode.id)) {
    return matchingMode.id;
  }

  return variable.collection.defaultModeId && modeIds.includes(variable.collection.defaultModeId)
    ? variable.collection.defaultModeId
    : modeIds[0];
}

function formatCssValue(rawValue, unit) {
  if (typeof rawValue === 'string') {
    return rawValue;
  }

  if (typeof rawValue === 'number') {
    return unit ? `${rawValue}${unit}` : String(rawValue);
  }

  if (typeof rawValue === 'boolean') {
    return String(rawValue);
  }

  if (rawValue && typeof rawValue === 'object' && hasColorChannels(rawValue)) {
    const { r: red, g: green, b: blue, a: alpha = 1 } = rawValue;
    if (alpha !== 1) {
      return `rgba(${to255(red)}, ${to255(green)}, ${to255(blue)}, ${Number(alpha.toFixed(2))})`;
    }

    return `#${[red, green, blue]
      .map((channelValue) => to255(channelValue).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;
  }

  throw new Error(`Unsupported Figma variable value: ${JSON.stringify(rawValue)}.`);
}

function hasColorChannels(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.r === 'number' &&
    typeof value.g === 'number' &&
    typeof value.b === 'number'
  );
}

function isVariableAlias(value) {
  return value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS' && typeof value.id === 'string';
}

function normalizeTokenPath(tokenPath) {
  return String(tokenPath)
    .trim()
    .replace(/Backround/gi, 'Background')
    .replace(/BorderRadius/gi, 'Border Radius')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/[/:]/)
    .map((segment) => segment.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
    .join('/');
}

function normalizePaletteGroup(groupName) {
  const normalized = normalizeTokenPath(groupName).replace(/\//g, '-');
  return normalized
    .replace(/^brand1$/, 'brand-1')
    .replace(/^brand2$/, 'brand-2')
    .replace(/^brand3$/, 'brand-3');
}

function sortPaletteGroups(palettes) {
  return Object.fromEntries(
    Object.entries(palettes)
      .sort(([leftGroupName], [rightGroupName]) => leftGroupName.localeCompare(rightGroupName))
      .map(([groupName, values]) => [
        groupName,
        Object.fromEntries(
          Object.entries(values).sort(
            ([leftStep], [rightStep]) => Number(leftStep) - Number(rightStep)
          )
        )
      ])
  );
}

function asRecord(value) {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map((entry) => [entry.id, entry]));
  }

  return value;
}

function firstKey(record = {}) {
  return Object.keys(record)[0];
}

function to255(channelValue) {
  return Math.round(channelValue * 255);
}
