import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import type { DeviceGpu } from '@flightctl/types';

import { getGpuLabel } from './capabilities';

const t = ((key: string) => key) as unknown as TFunction;

describe('getGpuLabel', () => {
  it('joins vendor and model when both are present', () => {
    const gpu: DeviceGpu = { index: 0, vendor: 'NVIDIA', model: 'RTX 4090' };
    expect(getGpuLabel(gpu, t)).toBe('NVIDIA RTX 4090');
  });

  it('shows only the vendor when the model is missing', () => {
    const gpu: DeviceGpu = { index: 0, vendor: 'NVIDIA' };
    expect(getGpuLabel(gpu, t)).toBe('NVIDIA');
  });

  it('shows only the model when the vendor is missing', () => {
    const gpu: DeviceGpu = { index: 0, model: 'RTX 4090' };
    expect(getGpuLabel(gpu, t)).toBe('RTX 4090');
  });

  it('falls back to a placeholder when both vendor and model are missing', () => {
    const gpu: DeviceGpu = { index: 0 };
    expect(getGpuLabel(gpu, t)).toBe('Detected (details unavailable)');
  });

  it('falls back when vendor and model are empty strings', () => {
    const gpu: DeviceGpu = { index: 0, vendor: '', model: '' };
    expect(getGpuLabel(gpu, t)).toBe('Detected (details unavailable)');
  });
});
