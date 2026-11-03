import { describe, expect, it } from 'vitest';

import {
  fromAPILabel,
  labelToExactApiMatchString,
  labelToString,
  stringToLabel,
  textToPartialApiMatchString,
  toAPILabel,
} from './labels';

describe('label utilities', () => {
  it('converts API labels to UI labels', () => {
    expect(fromAPILabel({ environment: 'production', site: 'edge' })).toEqual([
      { key: 'environment', value: 'production' },
      { key: 'site', value: 'edge' },
    ]);
  });

  it('converts UI labels back to API labels', () => {
    expect(
      toAPILabel([
        { key: 'environment', value: 'production' },
        { key: 'site', value: undefined },
      ]),
    ).toEqual({ environment: 'production', site: '' });
  });

  it('builds exact and partial API match strings', () => {
    expect(labelToExactApiMatchString({ key: 'environment', value: 'production' })).toBe('environment=production');
    expect(textToPartialApiMatchString('environment=production')).toBe(
      'metadata.labels.key=environment,metadata.labels.value contains production',
    );
    expect(textToPartialApiMatchString('environment')).toBe('metadata.labels.keyOrValue contains environment');
  });

  it('round-trips a label through its string representation', () => {
    expect(labelToString({ key: 'environment', value: 'production' })).toBe('environment=production');
    expect(stringToLabel('environment=production')).toEqual({ key: 'environment', value: 'production' });
    expect(stringToLabel('environment')).toEqual({ key: 'environment', value: undefined });
  });
});
