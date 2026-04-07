import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGeneratedArtifacts,
  buildTokensFromVariablePayload
} from '../src/sync-core.mjs';

const colorCollectionId = 'VariableCollectionId:colors';
const primitiveCollectionId = 'VariableCollectionId:primitives';
const lightModeId = 'ModeId:light';
const darkModeId = 'ModeId:dark';
const defaultModeId = 'ModeId:default';

const colorCollection = {
  id: colorCollectionId,
  name: 'Semantic colors',
  defaultModeId: lightModeId,
  modes: [
    { modeId: lightModeId, name: 'Light' },
    { modeId: darkModeId, name: 'Dark' }
  ]
};

const primitiveCollection = {
  id: primitiveCollectionId,
  name: 'Primitives',
  defaultModeId,
  modes: [{ modeId: defaultModeId, name: 'Default' }]
};

function colorVariable(id, name, lightValue, darkValue = lightValue) {
  return {
    id,
    name,
    variableCollectionId: colorCollectionId,
    resolvedType: 'COLOR',
    valuesByMode: {
      [lightModeId]: lightValue,
      [darkModeId]: darkValue
    }
  };
}

function primitiveVariable(id, name, value, resolvedType = 'STRING') {
  return {
    id,
    name,
    variableCollectionId: primitiveCollectionId,
    resolvedType,
    valuesByMode: {
      [defaultModeId]: value
    }
  };
}

const variablePayload = {
  meta: {
    variableCollections: {
      [colorCollectionId]: colorCollection,
      [primitiveCollectionId]: primitiveCollection
    },
    variables: {
      'palette-brand1-10': colorVariable(
        'palette-brand1-10',
        'Palette/Brand1/10',
        { r: 0.94, g: 0.937, b: 1, a: 1 }
      ),
      'palette-neutral-10': colorVariable(
        'palette-neutral-10',
        'Palette/Neutral/10',
        { r: 0.98, g: 0.98, b: 0.98, a: 1 }
      ),
      'semantic-canvas': colorVariable(
        'semantic-canvas',
        'Semantic/Background/Canvas',
        { r: 0.98, g: 0.98, b: 0.98, a: 1 },
        { r: 0.263, g: 0.251, b: 0.251, a: 1 }
      ),
      'semantic-surface': colorVariable(
        'semantic-surface',
        'Semantic/Background/Surface',
        { r: 0.98, g: 0.98, b: 0.98, a: 1 },
        { r: 0.263, g: 0.251, b: 0.251, a: 1 }
      ),
      'semantic-text-primary': colorVariable(
        'semantic-text-primary',
        'Semantic/Text/Primary',
        { r: 0.263, g: 0.251, b: 0.251, a: 1 },
        { r: 0.98, g: 0.98, b: 0.98, a: 1 }
      ),
      'semantic-text-secondary': colorVariable(
        'semantic-text-secondary',
        'Semantic/Text/Secondary',
        { r: 0.502, g: 0.502, b: 0.502, a: 1 },
        { r: 0.824, g: 0.824, b: 0.824, a: 1 }
      ),
      'semantic-text-muted': colorVariable(
        'semantic-text-muted',
        'Semantic/Text/Muted',
        { r: 0.663, g: 0.663, b: 0.663, a: 1 },
        { r: 0.58, g: 0.58, b: 0.58, a: 1 }
      ),
      'semantic-border-subtle': colorVariable(
        'semantic-border-subtle',
        'Semantic/Border/Subtle',
        { r: 0.851, g: 0.851, b: 0.851, a: 1 },
        { r: 0.424, g: 0.416, b: 0.416, a: 1 }
      ),
      'brand1-primary': colorVariable(
        'brand1-primary',
        'Backround/Brand1/Primary',
        { r: 0.412, g: 0.369, b: 0.992, a: 1 },
        { r: 0.318, g: 0.278, b: 0.859, a: 1 }
      ),
      'brand1-secondary': colorVariable(
        'brand1-secondary',
        'Backround/Brand1/Secondary',
        { r: 0.678, g: 0.655, b: 1, a: 1 },
        { r: 0.165, g: 0.133, b: 0.592, a: 1 }
      ),
      'brand1-tertiary': colorVariable(
        'brand1-tertiary',
        'Backround/Brand1/Tertiary',
        { r: 0.941, g: 0.937, b: 1, a: 1 },
        { r: 0.063, g: 0.043, b: 0.325, a: 1 }
      ),
      'brand2-primary': colorVariable(
        'brand2-primary',
        'Backround/Brand2/Primary',
        { r: 0.553, g: 1, b: 0.553, a: 1 },
        { r: 0.431, g: 0.914, b: 0.431, a: 1 }
      ),
      'brand2-secondary': colorVariable(
        'brand2-secondary',
        'Backround/Brand2/Secondary',
        { r: 0.753, g: 1, b: 0.753, a: 1 },
        { r: 0.196, g: 0.647, b: 0.196, a: 1 }
      ),
      'brand2-tertiary': colorVariable(
        'brand2-tertiary',
        'Backround/Brand2/Tertiary',
        { r: 0.953, g: 1, b: 0.953, a: 1 },
        { r: 0.055, g: 0.38, b: 0.055, a: 1 }
      ),
      'brand3-primary': colorVariable(
        'brand3-primary',
        'Backround/Brand3/Primary',
        { r: 0.38, g: 0.965, b: 0.918, a: 1 },
        { r: 0.286, g: 0.831, b: 0.788, a: 1 }
      ),
      'brand3-secondary': colorVariable(
        'brand3-secondary',
        'Backround/Brand3/Secondary',
        { r: 0.667, g: 1, b: 0.973, a: 1 },
        { r: 0.141, g: 0.565, b: 0.529, a: 1 }
      ),
      'brand3-tertiary': colorVariable(
        'brand3-tertiary',
        'Backround/Brand3/Tertiary',
        { r: 0.937, g: 1, b: 0.992, a: 1 },
        { r: 0.047, g: 0.298, b: 0.278, a: 1 }
      ),
      'brand1-inverse-text': colorVariable(
        'brand1-inverse-text',
        'Text/Brand1/Inverse',
        { r: 0.941, g: 0.937, b: 1, a: 1 },
        { r: 0.063, g: 0.043, b: 0.325, a: 1 }
      ),
      'brand1-primary-text': colorVariable(
        'brand1-primary-text',
        'Text/Brand1/Primary',
        { r: 0.318, g: 0.278, b: 0.859, a: 1 },
        { r: 0.412, g: 0.369, b: 0.992, a: 1 }
      ),
      'neutral-disabled-background': colorVariable(
        'neutral-disabled-background',
        'Backround/Neutral/Disabled',
        { r: 0.741, g: 0.741, b: 0.741, a: 1 },
        { r: 0.502, g: 0.502, b: 0.502, a: 1 }
      ),
      'neutral-disabled-text': colorVariable(
        'neutral-disabled-text',
        'Text/Neutral/Disabled',
        { r: 0.663, g: 0.663, b: 0.663, a: 1 },
        { r: 0.58, g: 0.58, b: 0.58, a: 1 }
      ),
      'neutral-tertiary-text': colorVariable(
        'neutral-tertiary-text',
        'Text/Neutral/Tertiary',
        { r: 0.502, g: 0.502, b: 0.502, a: 1 },
        { r: 0.741, g: 0.741, b: 0.741, a: 1 }
      ),
      'font-family-arial': primitiveVariable('font-family-arial', 'Font/Family/Arial', 'Arial, sans-serif'),
      'font-family-inter': primitiveVariable(
        'font-family-inter',
        'Font/Family/Inter',
        '"Inter", Arial, sans-serif'
      ),
      'font-family-open-sans': primitiveVariable(
        'font-family-open-sans',
        'Font/Family/OpenSans',
        '"Open Sans", Arial, sans-serif'
      ),
      'border-radius-0': primitiveVariable('border-radius-0', 'BorderRadius/0', 0, 'FLOAT'),
      'border-radius-4': primitiveVariable('border-radius-4', 'BorderRadius/4', 4, 'FLOAT'),
      'border-radius-999': primitiveVariable('border-radius-999', 'BorderRadius/999', 999, 'FLOAT'),
      'spacing-0': primitiveVariable('spacing-0', 'Spacing/0', 0, 'FLOAT'),
      'spacing-4': primitiveVariable('spacing-4', 'Spacing/4', 4, 'FLOAT'),
      'spacing-8': primitiveVariable('spacing-8', 'Spacing/8', 8, 'FLOAT'),
      'spacing-16': primitiveVariable('spacing-16', 'Spacing/16', 16, 'FLOAT')
    }
  }
};

test('buildTokensFromVariablePayload resolves named Figma variables into the token graph', () => {
  const tokens = buildTokensFromVariablePayload(variablePayload, {
    figmaFileKey: 'example-file',
    syncedAt: '2026-04-03T09:00:00.000Z'
  });

  assert.equal(tokens.meta.source.strategy, 'variables-local');
  assert.equal(tokens.palettes['brand-1']['10'], '#F0EFFF');
  assert.equal(tokens.themes.light.canvas, '#FAFAFA');
  assert.equal(tokens.themes.dark.textPrimary, '#FAFAFA');
  assert.equal(tokens.brands['brand-2'].fontFamily, '"Inter", Arial, sans-serif');
  assert.equal(tokens.brands['brand-3'].paddingBlock, '4px');
  assert.equal(tokens.components.button['brand-1'].light.default.background, '#695EFD');
  assert.equal(tokens.components.button['brand-1'].dark.active.foreground, '#695EFD');
  assert.equal(tokens.components.button['brand-2'].dark.active.foreground, '#BDBDBD');
});

test('buildGeneratedArtifacts emits contract, preset, and official brand pack stylesheets', () => {
  const tokens = buildTokensFromVariablePayload(variablePayload, {
    figmaFileKey: 'example-file',
    syncedAt: '2026-04-03T09:00:00.000Z'
  });
  const generatedArtifacts = buildGeneratedArtifacts(tokens);

  assert.match(generatedArtifacts.contractCss, /--ff-color-canvas: #FAFAFA;/);
  assert.match(generatedArtifacts.figmaPresetCss, /\[data-brand="brand-2"\]\[data-theme="dark"\]/);
  assert.ok(generatedArtifacts.brandStyles['brand-1-light.css']);
  assert.match(generatedArtifacts.brandStyles['brand-1-light.css'], /--ff-button-bg-default: #695EFD;/);
  assert.match(generatedArtifacts.brandStyles['brand-3-dark.css'], /\[data-theme='dark'\]/);
});
