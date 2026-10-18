import { describe, expect, it } from 'vitest';

import { getFleetResource, getInitialValues } from './utils';

describe('getFleetResource', () => {
  it('keeps user-defined fleet metadata labels on the fleet resource', () => {
    const resource = getFleetResource({
      ...getInitialValues(),
      name: 'edge-fleet',
      fleetLabels: [{ key: 'environment', value: 'production' }],
    });

    expect(resource.metadata).toEqual({
      name: 'edge-fleet',
      labels: { environment: 'production' },
    });
    expect(resource.spec.template.metadata).toBeUndefined();
  });

  it('does not copy long fleet names into template labels', () => {
    const name = `fleet-${'a'.repeat(100)}`;
    const resource = getFleetResource({ ...getInitialValues(), name });

    expect(resource.metadata.name).toBe(name);
    expect(resource.spec.template.metadata).toBeUndefined();
  });
});
