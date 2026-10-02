import { describe, expect, it } from 'vitest';

import { sanitizeLabelValue } from './labels';

// Fixtures mirrored from flightctl/internal/util/validation/validation_test.go TestSanitizeLabelValue
describe('sanitizeLabelValue', () => {
  it.each([
    { name: 'empty string', input: '', expected: '' },
    { name: 'valid label unchanged', input: 'valid-label', expected: 'valid-label' },
    { name: 'valid with underscores and dots', input: 'test_value.123', expected: 'test_value.123' },
    { name: 'spaces replaced with hyphens', input: 'CentOS Stream', expected: 'CentOS-Stream' },
    {
      name: 'multiple spaces',
      input: 'Red Hat Enterprise Linux',
      expected: 'Red-Hat-Enterprise-Linux',
    },
    { name: 'special characters replaced', input: 'version@2.0!test', expected: 'version-2.0-test' },
    { name: 'leading special chars trimmed', input: '!!!valid-label', expected: 'valid-label' },
    { name: 'trailing special chars trimmed', input: 'valid-label!!!', expected: 'valid-label' },
    {
      name: 'leading and trailing special chars trimmed',
      input: '---valid-label---',
      expected: 'valid-label',
    },
    { name: 'only special characters', input: '!!!', expected: '' },
    { name: 'only hyphens', input: '---', expected: '' },
    { name: 'IP address is valid', input: '127.0.0.1', expected: '127.0.0.1' },
    { name: 'IPv6 colons replaced', input: '::1', expected: '1' },
    { name: 'single character', input: 'a', expected: 'a' },
    { name: 'truncate long value', input: 'a'.repeat(100), expected: 'a'.repeat(63) },
    {
      name: 'truncate and trim trailing hyphens',
      input: `${'a'.repeat(60)}---${'b'.repeat(10)}`,
      expected: 'a'.repeat(60),
    },
    { name: 'parentheses replaced', input: 'version(1.2.3)', expected: 'version-1.2.3' },
    { name: 'mixed valid and invalid chars', input: 'Test_Label-123.v2', expected: 'Test_Label-123.v2' },
    { name: 'unicode replaced', input: 'label™', expected: 'label' },
    { name: 'slashes replaced', input: 'path/to/value', expected: 'path-to-value' },
    {
      name: 'realistic distro name',
      input: 'Red Hat Enterprise Linux 9.5 (Plow)',
      expected: 'Red-Hat-Enterprise-Linux-9.5--Plow',
    },
    {
      name: 'realistic product name',
      input: 'Dell PowerEdge R640',
      expected: 'Dell-PowerEdge-R640',
    },
    { name: 'boolean true', input: true, expected: 'true' },
    { name: 'boolean false', input: false, expected: 'false' },
    { name: 'number', input: 42, expected: '42' },
    { name: 'null', input: null, expected: '' },
    { name: 'undefined', input: undefined, expected: '' },
  ])('$name', ({ input, expected }) => {
    expect(sanitizeLabelValue(input)).toBe(expected);
  });
});
