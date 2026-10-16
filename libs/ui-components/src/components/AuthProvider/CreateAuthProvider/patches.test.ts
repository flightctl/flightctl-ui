import { describe, expect, it } from 'vitest';
import { type OIDCProviderSpec, type PatchRequest } from '@flightctl/types';

import { type DynamicAuthProviderSpec } from '../../../types/extraTypes';
import { DEFAULT_PROMPT } from './types';
import { patchAuthProviderFields } from './patches';

const baseOidcSpec = (overrides?: Partial<OIDCProviderSpec>): DynamicAuthProviderSpec => ({
  providerType: 'oidc',
  issuer: 'https://issuer.example.com',
  clientId: 'client-id',
  clientSecret: 'client-secret',
  enabled: true,
  scopes: ['openid'],
  usernameClaim: ['preferred_username'],
  organizationAssignment: {
    type: 'static',
    organizationName: 'default',
  },
  roleAssignment: {
    type: 'static',
    roles: ['flightctl-admin'],
  },
  ...overrides,
});

const promptPatches = (original: DynamicAuthProviderSpec, next: DynamicAuthProviderSpec): PatchRequest => {
  const patches: PatchRequest = [];
  patchAuthProviderFields(patches, original, next);
  return patches.filter((patch) => patch.path === '/spec/prompt');
};

describe('patchAuthProviderFields', () => {
  describe('prompt', () => {
    it('When prompt is unset and the form keeps the default it should not patch prompt', () => {
      const original = baseOidcSpec({ prompt: undefined });
      const next = baseOidcSpec({ prompt: DEFAULT_PROMPT });

      expect(promptPatches(original, next)).toEqual([]);
    });

    it('When prompt is null and the form keeps the default it should not patch prompt', () => {
      const original = baseOidcSpec({ prompt: null });
      const next = baseOidcSpec({ prompt: DEFAULT_PROMPT });

      expect(promptPatches(original, next)).toEqual([]);
    });

    it('When prompt is unset and the form sets an empty string it should add prompt as empty string', () => {
      const original = baseOidcSpec({ prompt: undefined });
      const next = baseOidcSpec({ prompt: '' });

      expect(promptPatches(original, next)).toEqual([{ op: 'add', path: '/spec/prompt', value: '' }]);
    });

    it('When prompt is null and the form sets a custom value it should add prompt', () => {
      const original = baseOidcSpec({ prompt: null });
      const next = baseOidcSpec({ prompt: 'consent' });

      expect(promptPatches(original, next)).toEqual([{ op: 'add', path: '/spec/prompt', value: 'consent' }]);
    });

    it('When prompt is an empty string and the form sets to the default prompt, it should replace the prompt', () => {
      const original = baseOidcSpec({ prompt: '' });
      const next = baseOidcSpec({ prompt: DEFAULT_PROMPT });

      expect(promptPatches(original, next)).toEqual([{ op: 'replace', path: '/spec/prompt', value: DEFAULT_PROMPT }]);
    });

    it('When prompt is the default prompt and the form clears it, it should replace with empty string not remove', () => {
      const original = baseOidcSpec({ prompt: DEFAULT_PROMPT });
      const next = baseOidcSpec({ prompt: '' });

      expect(promptPatches(original, next)).toEqual([{ op: 'replace', path: '/spec/prompt', value: '' }]);
    });

    it.each([
      { name: 'default prompt', prompt: DEFAULT_PROMPT },
      { name: 'empty string', prompt: '' },
      { name: `${DEFAULT_PROMPT} consent`, prompt: `${DEFAULT_PROMPT} consent` },
    ])('When prompt is unchanged ($name) it should not patch prompt', ({ prompt }) => {
      const original = baseOidcSpec({ prompt });
      const next = baseOidcSpec({ prompt });

      expect(promptPatches(original, next)).toEqual([]);
    });

    it('When prompt has extra spaces it should preserve them in the patch value', () => {
      const promptWithSpaces = ` ${DEFAULT_PROMPT}  consent `;
      const original = baseOidcSpec({ prompt: DEFAULT_PROMPT });
      const next = baseOidcSpec({ prompt: promptWithSpaces });

      expect(promptPatches(original, next)).toEqual([{ op: 'replace', path: '/spec/prompt', value: promptWithSpaces }]);
    });

    it('When only non-prompt fields change and prompt stays at the default display value it should not patch prompt', () => {
      const original = baseOidcSpec({ prompt: undefined, displayName: 'Old' });
      const next = baseOidcSpec({ prompt: DEFAULT_PROMPT, displayName: 'New' });

      const patches: PatchRequest = [];
      patchAuthProviderFields(patches, original, next);

      expect(patches.filter((patch) => patch.path === '/spec/prompt')).toEqual([]);
      expect(patches).toEqual(expect.arrayContaining([{ op: 'replace', path: '/spec/displayName', value: 'New' }]));
    });
  });
});
