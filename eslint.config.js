const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');

const { fixupPluginRules } = require('@eslint/compat');

const globals = require('globals');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        comment: true,

        ecmaFeatures: {
          jsx: true,
        },

        project: true,
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    extends: compat.extends(
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
    ),

    settings: {
      react: {
        version: 'detect',
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': fixupPluginRules(reactHooks),
    },

    rules: {
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@patternfly/react-icons/dist/esm**'],
              message: 'Import using the full js path `@patternfly/react-icons/dist/js/icons<icon>` instead',
            },
            {
              group: ['@patternfly/react-tokens/dist/esm**'],
              message: 'Import using the full js path `@patternfly/react-tokens/dist/js/icons<icon>` instead',
            },
          ],

          paths: [
            {
              name: '@patternfly/react-icons',
              message: 'Import using full path `@patternfly/react-icons/dist/js/icons<icon>` instead',
            },
            {
              name: '@patternfly/react-tokens',
              message: 'Import using full path `@patternfly/react-tokens/dist/js/<token>` instead',
            },
            {
              name: '@patternfly/react-core',
              importNames: ['Form'],
              message: 'Use FlightCtlForm wrapper',
            },
            {
              name: '@patternfly/react-core',
              importNames: ['WizardFooterWrapper', 'WizardFooter'],
              message: 'Use FlightCtlWizardFooter wrapper',
            },
            {
              name: 'react-i18next',
              importNames: ['useTranslation'],
              message: 'Import useTranslation from @flightctl/ui-components/hooks/useTranslation instead',
            },
            {
              name: 'lodash',
              message: 'Import using full path `lodash/<function>` instead',
            },
          ],
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/prop-types': 'off',
      'no-console': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  globalIgnores(['**/*.json']),
]);
