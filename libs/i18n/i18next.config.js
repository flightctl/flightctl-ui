/** @type {import('i18next-cli').I18nextToolkitConfig} */
module.exports = {
  locales: ['en'],
  extract: {
    input: ['../../{libs,apps}/*/src/**/*.{js,jsx,ts,tsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
    defaultNS: 'translation',
    primaryLanguage: 'en',
    keySeparator: false,
    nsSeparator: '~',
    removeUnusedKeys: true,
    // Keep generated catalogs stable between runs.
    sort: true,
    functions: ['t', '*.t'],
    transComponents: ['Trans'],
  },
};
