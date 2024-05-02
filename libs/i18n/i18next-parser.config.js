module.exports = {
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultValue: function (a, b, key) {
    return key;
  },
};
