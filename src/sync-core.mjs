const COLOR_MODE_ALIASES = {
  light: ['light', 'default', 'base', 'day'],
  dark: ['dark', 'night']
};

const THEME_TOKEN_BINDINGS = {
  light: {
    canvas: createThemeBinding('light.canvas', 'background/canvas', ['theme/light/canvas', 'background/neutral/primary']),
    surface: createThemeBinding('light.surface', 'background/surface', ['theme/light/surface', 'background/neutral/primary']),
    textPrimary: createThemeBinding('light.textPrimary', 'text/primary', ['text/neutral/primary']),
    textSecondary: createThemeBinding('light.textSecondary', 'text/secondary', ['text/neutral/secondary', 'text/neutral/tertiary']),
    textMuted: createThemeBinding('light.textMuted', 'text/muted', ['text/neutral/muted', 'text/neutral/disabled']),
    borderSubtle: createThemeBinding('light.borderSubtle', 'border/subtle', ['border/neutral/subtle', 'background/neutral/disabled'])
  },
  dark: {
    canvas: createThemeBinding('dark.canvas', 'background/canvas', ['theme/dark/canvas', 'background/neutral/primary']),
    surface: createThemeBinding('dark.surface', 'background/surface', ['theme/dark/surface', 'background/neutral/primary']),
    textPrimary: createThemeBinding('dark.textPrimary', 'text/primary', ['text/neutral/primary']),
    textSecondary: createThemeBinding('dark.textSecondary', 'text/secondary', ['text/neutral/secondary', 'text/neutral/tertiary']),
    textMuted: createThemeBinding('dark.textMuted', 'text/muted', ['text/neutral/muted', 'text/neutral/disabled']),
    borderSubtle: createThemeBinding('dark.borderSubtle', 'border/subtle', ['border/neutral/subtle', 'background/neutral/disabled'])
  }
};

const BRAND_ALIASES = {
  'brand-1': ['brand-1', 'brand1'],
  'brand-2': ['brand-2', 'brand2'],
  'brand-3': ['brand-3', 'brand3']
};

const BRAND_FOUNDATION_BINDINGS = {
  'brand-1': {
    label: 'Brand 1',
    fontFamily: createBrandFoundationBinding('brand-1.fontFamily', 'brand-1', 'font-family', ['font/family/arial']),
    controlRadius: createBrandFoundationBinding('brand-1.controlRadius', 'brand-1', 'control/radius', ['border-radius/0', 'borderradius/0'], 'px'),
    controlPaddingInline: createBrandFoundationBinding('brand-1.controlPaddingInline', 'brand-1', 'control/padding-inline', ['spacing/8'], 'px'),
    controlPaddingBlock: createBrandFoundationBinding('brand-1.controlPaddingBlock', 'brand-1', 'control/padding-block', ['spacing/0'], 'px')
  },
  'brand-2': {
    label: 'Brand 2',
    fontFamily: createBrandFoundationBinding('brand-2.fontFamily', 'brand-2', 'font-family', ['font/family/inter']),
    controlRadius: createBrandFoundationBinding('brand-2.controlRadius', 'brand-2', 'control/radius', ['border-radius/4', 'borderradius/4'], 'px'),
    controlPaddingInline: createBrandFoundationBinding('brand-2.controlPaddingInline', 'brand-2', 'control/padding-inline', ['spacing/8'], 'px'),
    controlPaddingBlock: createBrandFoundationBinding('brand-2.controlPaddingBlock', 'brand-2', 'control/padding-block', ['spacing/0'], 'px')
  },
  'brand-3': {
    label: 'Brand 3',
    fontFamily: createBrandFoundationBinding('brand-3.fontFamily', 'brand-3', 'font-family', ['font/family/opensans', 'font/family/open-sans']),
    controlRadius: createBrandFoundationBinding('brand-3.controlRadius', 'brand-3', 'control/radius', ['border-radius/999', 'borderradius/999'], 'px'),
    controlPaddingInline: createBrandFoundationBinding('brand-3.controlPaddingInline', 'brand-3', 'control/padding-inline', ['spacing/16'], 'px'),
    controlPaddingBlock: createBrandFoundationBinding('brand-3.controlPaddingBlock', 'brand-3', 'control/padding-block', ['spacing/4'], 'px')
  }
};

const BUTTON_STATE_ORDER = ['default', 'hover', 'active', 'disabled'];
const BUTTON_FACETS = {
  background: 'background',
  foreground: 'foreground'
};
const BRAND_STYLE_THEMES = ['light', 'dark'];

export function buildTokensFromVariablePayload(variablePayload, options = {}) {
  const registry = createVariableRegistry(variablePayload);
  const syncedAt = options.syncedAt ?? new Date().toISOString();
  const figmaFileKey = options.figmaFileKey ?? 'unknown';
  const warnings = [];

  const palettes = extractPaletteTokens(registry);
  if (Object.keys(palettes).length === 0) {
    warnings.push('No palette variables matched the expected palette naming patterns.');
  }

  const themeBindings = {};
  const themes = {};

  for (const [themeName, tokenBindings] of Object.entries(THEME_TOKEN_BINDINGS)) {
    themeBindings[themeName] = {};
    themes[themeName] = {};

    for (const [tokenName, bindingDefinition] of Object.entries(tokenBindings)) {
      const resolution = resolveBinding(registry, {
        ...bindingDefinition,
        modeName: themeName
      });

      themeBindings[themeName][tokenName] = serializeBinding(resolution);
      themes[themeName][tokenName] = resolution.value;
    }
  }

  const brandBindings = {};
  const brands = {};

  for (const [brandName, brandDefinition] of Object.entries(BRAND_FOUNDATION_BINDINGS)) {
    brandBindings[brandName] = {};
    brands[brandName] = {
      label: brandDefinition.label,
      fontFamily: '',
      control: {
        radius: '',
        paddingInline: '',
        paddingBlock: ''
      }
    };

    const fontFamilyResolution = resolveBinding(registry, brandDefinition.fontFamily);
    brandBindings[brandName].fontFamily = serializeBinding(fontFamilyResolution);
    brands[brandName].fontFamily = fontFamilyResolution.value;

    const controlRadiusResolution = resolveBinding(registry, brandDefinition.controlRadius);
    brandBindings[brandName].controlRadius = serializeBinding(controlRadiusResolution);
    brands[brandName].control.radius = controlRadiusResolution.value;

    const controlPaddingInlineResolution = resolveBinding(registry, brandDefinition.controlPaddingInline);
    brandBindings[brandName].controlPaddingInline = serializeBinding(controlPaddingInlineResolution);
    brands[brandName].control.paddingInline = controlPaddingInlineResolution.value;

    const controlPaddingBlockResolution = resolveBinding(registry, brandDefinition.controlPaddingBlock);
    brandBindings[brandName].controlPaddingBlock = serializeBinding(controlPaddingBlockResolution);
    brands[brandName].control.paddingBlock = controlPaddingBlockResolution.value;
  }

  const buttonBindings = {};
  const button = {};

  for (const brandName of Object.keys(BRAND_FOUNDATION_BINDINGS)) {
    buttonBindings[brandName] = {};
    button[brandName] = {};

    for (const themeName of BRAND_STYLE_THEMES) {
      buttonBindings[brandName][themeName] = {};
      button[brandName][themeName] = {};

      for (const stateName of BUTTON_STATE_ORDER) {
        buttonBindings[brandName][themeName][stateName] = {};
        button[brandName][themeName][stateName] = {};

        for (const [facetName, facetPath] of Object.entries(BUTTON_FACETS)) {
          const resolution = resolveBinding(
            registry,
            createButtonStateBinding({
              brandName,
              themeName,
              stateName,
              facetPath,
              tokenName: `${brandName}.${themeName}.button.${stateName}.${facetName}`
            })
          );

          buttonBindings[brandName][themeName][stateName][facetName] = serializeBinding(resolution);
          button[brandName][themeName][stateName][facetName] = resolution.value;
        }
      }
    }
  }

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
        'The sync resolves semantic-first token bindings and only falls back to legacy aliases when required.',
        'Bindings include source diagnostics so design and frontend teams can review which Figma variables powered the generated contract.'
      ],
      warnings,
      bindings: {
        themes: themeBindings,
        brands: brandBindings,
        components: {
          button: buttonBindings
        }
      }
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

  This is the CSS custom property API that every component in the design system reads from.
  It is the single coupling point between the design layer and the component layer.

  ## Architectural intent

  - Semantic tokens drive the generated theme layer.
  - Brand foundations drive shared control-level dimensions and typography.
  - Component tokens remain explicit so each primitive can evolve without leaking internal DOM details.

  ## How the token cascade works

  1. This file (contract.css) defines every --ff-* variable with safe fallback values.
  2. Official brand packs override semantic and control variables through [data-brand][data-theme].
  3. Component structural CSS reads only this stable contract via var(--ff-*).

  Generated from the Figma Variables API. Do not hand-edit.
*/
:root {
  --ff-font-family-brand: ${defaultBrand?.fontFamily ?? 'inherit'};

  --ff-control-radius: ${defaultBrand?.control?.radius ?? '0px'};
  --ff-control-padding-inline: ${defaultBrand?.control?.paddingInline ?? '0.875rem'};
  --ff-control-padding-block: ${defaultBrand?.control?.paddingBlock ?? '0.5rem'};

  --ff-button-radius: var(--ff-control-radius);
  --ff-button-padding-inline: var(--ff-control-padding-inline);
  --ff-button-padding-block: var(--ff-control-padding-block);

  --ff-color-canvas: ${defaultTheme?.canvas ?? '#ffffff'};
  --ff-color-surface: ${defaultTheme?.surface ?? '#ffffff'};
  --ff-color-text-primary: ${defaultTheme?.textPrimary ?? '#111111'};
  --ff-color-text-secondary: ${defaultTheme?.textSecondary ?? '#5f5f5f'};
  --ff-color-text-muted: ${defaultTheme?.textMuted ?? '#8b8b8b'};
  --ff-color-border-subtle: ${defaultTheme?.borderSubtle ?? '#d8d8d8'};
  --ff-color-focus-ring: color-mix(in srgb, var(--ff-color-text-primary) 28%, transparent);

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
  --ff-control-radius: ${config.control.radius};
  --ff-control-padding-inline: ${config.control.paddingInline};
  --ff-control-padding-block: ${config.control.paddingBlock};
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
  --ff-control-radius: ${brandConfig.control.radius};
  --ff-control-padding-inline: ${brandConfig.control.paddingInline};
  --ff-control-padding-block: ${brandConfig.control.paddingBlock};
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
  const normalizedCandidates = binding.candidates.map((candidate) => normalizeTokenPath(candidate));

  for (let index = 0; index < normalizedCandidates.length; index += 1) {
    const candidateName = normalizedCandidates[index];
    const matchingVariables = registry.variablesByNormalizedName.get(candidateName) ?? [];
    if (matchingVariables.length === 0) {
      continue;
    }

    const matchedVariable = matchingVariables[0];
    const value = resolveVariableValue(registry, matchedVariable, {
      modeName: binding.modeName,
      unit: binding.unit
    });

    if (value !== undefined) {
      return {
        tokenName: binding.tokenName,
        value,
        matchedCandidate: binding.candidates[index],
        variableName: matchedVariable.name,
        variableNormalizedName: matchedVariable.normalizedName,
        modeName: binding.modeName ?? 'default'
      };
    }
  }

  throw new Error(
    `Missing required Figma variable binding for "${binding.tokenName}". Checked: ${binding.candidates.join(', ')}.`
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

function createThemeBinding(tokenName, semanticPath, legacyCandidates = []) {
  return {
    tokenName,
    candidates: uniqueCandidates([
      `semantic/${semanticPath}`,
      `theme/${tokenName.split('.')[0]}/${semanticPath}`,
      ...legacyCandidates
    ])
  };
}

function createBrandFoundationBinding(tokenName, brandName, semanticPath, legacyCandidates = [], unit = null) {
  return {
    tokenName,
    unit,
    candidates: uniqueCandidates([
      ...brandScopedCandidates(brandName, semanticPath, [
        'semantic/brand',
        'brand',
        'foundation/brand'
      ]),
      ...legacyCandidates
    ])
  };
}

function createButtonStateBinding({ brandName, themeName, stateName, facetPath, tokenName }) {
  return {
    tokenName,
    candidates: uniqueCandidates([
      ...brandScopedCandidates(brandName, `button/${facetPath}/${stateName}`, [
        'component',
        'semantic/component'
      ]),
      ...brandScopedCandidates(brandName, `component/button/${facetPath}/${stateName}`, ['semantic']),
      ...legacyButtonCandidates(brandName, stateName, facetPath),
      ...themeAwareButtonCandidates(themeName, stateName, facetPath),
      `component/button/${facetPath}/${stateName}`,
      `semantic/component/button/${facetPath}/${stateName}`
    ])
  };
}

function brandScopedCandidates(brandName, leafPath, roots) {
  const aliases = BRAND_ALIASES[brandName] ?? [brandName];
  const pathSegments = leafPath.split('/').filter(Boolean);

  return roots.flatMap((root) =>
    aliases.flatMap((brandAlias) => [
      [root, brandAlias, ...pathSegments].join('/'),
      [root, ...pathSegments, brandAlias].join('/')
    ])
  );
}

function themeAwareButtonCandidates(themeName, stateName, facetPath) {
  return [
    `semantic/button/${themeName}/${facetPath}/${stateName}`,
    `component/button/${themeName}/${facetPath}/${stateName}`
  ];
}

function legacyButtonCandidates(brandName, stateName, facetPath) {
  const legacyBrandName = brandName.replace('-', '');

  if (facetPath === 'background') {
    const legacyStateMap = {
      default: 'primary',
      hover: 'secondary',
      active: 'tertiary',
      disabled: 'neutral/disabled'
    };

    const mappedValue = legacyStateMap[stateName];
    if (mappedValue === 'neutral/disabled') {
      return ['background/neutral/disabled'];
    }

    return [`background/${legacyBrandName}/${mappedValue}`];
  }

  const legacyForegroundMap = {
    'brand-1': {
      default: ['text/brand1/inverse'],
      hover: ['text/brand1/inverse'],
      active: ['text/brand1/primary'],
      disabled: ['text/neutral/disabled']
    },
    'brand-2': {
      default: ['semantic/text/primary', 'text/neutral/primary'],
      hover: ['semantic/text/primary', 'text/neutral/primary'],
      active: ['text/neutral/tertiary', 'semantic/text/secondary'],
      disabled: ['semantic/text/muted', 'text/neutral/disabled']
    },
    'brand-3': {
      default: ['text/neutral/tertiary', 'semantic/text/secondary'],
      hover: ['text/neutral/tertiary', 'semantic/text/secondary'],
      active: ['text/neutral/tertiary', 'semantic/text/secondary'],
      disabled: ['semantic/text/muted', 'text/neutral/disabled']
    }
  };

  return legacyForegroundMap[brandName]?.[stateName] ?? ['semantic/text/primary'];
}

function uniqueCandidates(candidates) {
  return Array.from(
    new Set(
      candidates
        .flat()
        .filter(Boolean)
        .map((candidate) => normalizeTokenPath(candidate))
    )
  );
}

function serializeBinding(resolution) {
  return {
    candidate: resolution.matchedCandidate,
    variable: resolution.variableName,
    normalizedVariable: resolution.variableNormalizedName,
    mode: resolution.modeName,
    value: resolution.value
  };
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
