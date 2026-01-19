module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    comment: true,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    project: true,
    sourceType: 'module',
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  overrides: [
    {
      files: ['**/src/**/*.ts', '**/src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'eslint-plugin-react-hooks'],
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
            importNames: ['DescriptionList'],
            message: 'Use FlightCtlDescriptionList wrapper',
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
          {
            name: '@flightctl/types',
            importNames: ['ApplicationProviderSpec'],
            message: 'Use FixedApplicationProviderSpec instead',
          },
        ],
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/self-closing-comp': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/prop-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'prettier/prettier': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-console': 'error',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  },
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['*.json'],
};
