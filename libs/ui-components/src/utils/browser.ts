// PatternFly types its NavItem onClick as a FormEvent.
export type ClickEvent = {
  button?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

// A missing button counts as a plain click.
export const isPlainLeftClick = (event: ClickEvent): boolean =>
  (event.button ?? 0) === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
