import * as monacoEditor from 'monaco-editor';

type Monaco = typeof monacoEditor;

// TODO import from PF6 react-tokens. These are not available in PF5
const t_color_green_70 = '#204d00';
const t_color_white = '#ffffff';
const t_color_black = '#000000';
const t_color_gray_60 = '#4d4d4d';
const t_color_yellow_70 = '#73480b';
const t_color_yellow_30 = '#ffcc17';
const t_color_green_30 = '#afdc8f';
const t_color_blue_30 = '#92c5f9';
const t_color_blue_70 = '#003366';
const t_color_purple_70 = '#21134d';
const t_color_purple_30 = '#b6a6e9';
const t_color_gray_90 = '#1f1f1f';
const t_color_gray_20 = '#e0e0e0';

// Defines the same color scheme as in the OCP console
export const defineConsoleThemes = (monaco: Monaco) => {
  monaco.editor.defineTheme('console-light', {
    base: 'vs',
    inherit: true,
    colors: {
      'editor.background': t_color_white,
      'editorLineNumber.activeForeground': t_color_black,
      'editorLineNumber.foreground': t_color_gray_60,
    },
    rules: [
      { token: 'number', foreground: t_color_green_70 },
      { token: 'type', foreground: t_color_yellow_70 },
      { token: 'string', foreground: t_color_blue_70 },
      { token: 'keyword', foreground: t_color_purple_70 },
    ],
  });

  monaco.editor.defineTheme('console-dark', {
    base: 'vs-dark',
    inherit: true,
    colors: {
      'editor.background': t_color_gray_90,
      'editorLineNumber.activeForeground': t_color_white,
      'editorLineNumber.foreground': t_color_gray_20,
    },
    rules: [
      { token: 'number', foreground: t_color_green_30 },
      { token: 'type', foreground: t_color_blue_30 },
      { token: 'string', foreground: t_color_yellow_30 },
      { token: 'keyword', foreground: t_color_purple_30 },
    ],
  });
};
