import type { TFunction } from 'i18next';

import type { QuickStartPhase } from './types';

export const QUICK_START_PHASE_ORDER = ['orientation', 'image-building', 'enrollment', 'fleet-management'] as const;

export type QuickStartPhaseId = (typeof QUICK_START_PHASE_ORDER)[number];

export const getQuickStartPhases = (t: TFunction, productName: string): QuickStartPhase[] => [
  {
    id: 'orientation',
    title: t('Welcome & Orientation'),
    icon: 'home',
    description: t('Get familiar with {{ productName }} and learn how to navigate the console.', {
      productName,
    }),
  },
  {
    id: 'image-building',
    title: t('Build an OS Image'),
    icon: 'image',
    description: t('Create a custom edge OS image so devices auto-register on boot.'),
  },
  {
    id: 'enrollment',
    title: t('Enroll Your First Device'),
    icon: 'plus',
    description: t('Boot a device with your image, then approve it to bring it under management.'),
  },
  {
    id: 'fleet-management',
    title: t('Create and Manage Fleets'),
    icon: 'cubes',
    description: t(
      'Group devices that share identical or similar configuration and update policy for centralized management.',
    ),
  },
];
