module.exports = {
  // tells eslint to use the TypeScript parser
  parser: '@typescript-eslint/parser',
  // tell the TypeScript parser that we want to use JSX syntax
  parserOptions: {
    tsx: true,
    jsx: true,
    js: true,
    useJSXTextNode: true,
    project: ['./tsconfig.json', './cypress/tsconfig.json'],
    tsconfigRootDir: '.',
  },
  // we want to use the recommended rules provided from the typescript plugin
  extends: [
    '@redhat-cloud-services/eslint-config-redhat-cloud-services',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:storybook/recommended',
  ],
  globals: {
    window: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    it: 'readonly',
    process: 'readonly',
    document: 'readonly',
    insights: 'readonly',
    shallow: 'readonly',
    render: 'readonly',
    mount: 'readonly',
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      overrides: [
        {
          // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching testing files!
          files: ['**/?(*.)+(spec).ts?(x)'],
          extends: ['plugin:testing-library/react'],
        },
      ],
      rules: {
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
      },
    },
  ],
  settings: {
    react: {
      version: '^16.11.0',
    },
  },
  // includes the typescript specific rules found here: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
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
            importNames: ['ActionGroup'],
            message: 'Use FlightCtlActionGroup to wrap the footer actions',
          },
        ],
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/self-closing-comp': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'prettier/prettier': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-console': 'error',
    "testing-library/prefer-user-event": "error",
  },
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: [],
};
