import { JsxLexer } from 'i18next-parser';

export default class EscapePreservingJsxLexer extends JsxLexer {
  nodeToString(node, sourceText) {
    return super.nodeToString(node, sourceText).replace(/&/g, '&amp;');
  }
}
