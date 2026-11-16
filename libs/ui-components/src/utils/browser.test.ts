import { describe, expect, it } from 'vitest';

import { isPlainLeftClick } from './browser';

const click = (overrides: Partial<React.MouseEvent> = {}) => ({ button: 0, ...overrides }) as React.MouseEvent;

describe('isPlainLeftClick', () => {
  it('accepts a plain left click', () => {
    expect(isPlainLeftClick(click())).toBe(true);
  });

  it('guards when the event shape is unknown', () => {
    expect(isPlainLeftClick({})).toBe(true);
  });

  it.each(['button', 'metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const)('rejects %s', (key) => {
    expect(isPlainLeftClick(click({ [key]: key === 'button' ? 1 : true }))).toBe(false);
  });
});
