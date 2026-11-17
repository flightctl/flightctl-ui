import EscapePreservingJsxLexer from './escape-preserving-jsx-lexer.mjs';

export default {
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultValue: function (a, b, key) {
    return key;
  },
  lexers: {
    jsx: [{ lexer: EscapePreservingJsxLexer }],
    tsx: [{ lexer: EscapePreservingJsxLexer }],
  },
};
