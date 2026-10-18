import { describe, expect, it } from 'vitest';

import { APP_TITLE } from './constants';

describe('application branding', () => {
  it('When the upstream standalone UI sets a device route title, it should use Flight Control branding', () => {
    expect(`${APP_TITLE} | Device`).toBe('Flight Control | Device');
  });

  it('When the upstream standalone UI sets a route title, it should not use downstream branding', () => {
    expect(APP_TITLE).not.toBe('Edge Manager');
  });
});
