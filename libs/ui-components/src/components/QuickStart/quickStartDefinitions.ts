import type { TFunction } from 'react-i18next';
import { RESOURCE, VERB } from '../../types/rbac';
import type { PermissionCheck } from '../common/PermissionsContext';
import type { QuickStartPhaseDefinition } from './types';

export const QUICK_START_PHASE_IDS = ['orientation', 'enroll-device', 'manage-fleet', 'build-image'] as const;
export type QuickStartPhaseId = (typeof QUICK_START_PHASE_IDS)[number];

// Contains only static definitions for the quickStart phases.
// Dynamic values such as title, description etc are handled separately.
export const quickStartPhaseDefinitions: QuickStartPhaseDefinition[] = [
  {
    id: 'orientation',
    icon: 'home',
    estimatedMinutes: 5,
    listResourceNeeded: null,
  },
  {
    id: 'build-image',
    icon: 'image',
    estimatedMinutes: 15,
    listResourceNeeded: RESOURCE.IMAGE_BUILD,
  },
  {
    id: 'enroll-device',
    icon: 'plus',
    estimatedMinutes: 10,
    listResourceNeeded: RESOURCE.DEVICE,
  },
  {
    id: 'manage-fleet',
    icon: 'cubes',
    estimatedMinutes: 16,
    listResourceNeeded: RESOURCE.FLEET,
  },
];

export const getPhaseTitle = (t: TFunction, phaseId: QuickStartPhaseId) => {
  switch (phaseId) {
    case 'orientation':
      return t('Welcome & Orientation');
    case 'build-image':
      return t('Build an OS Image');
    case 'enroll-device':
      return t('Enroll Your First Device');
    case 'manage-fleet':
      return t('Create and Manage Fleets');
  }
};

export const getPhaseDescription = (
  t: TFunction,
  phaseId: QuickStartPhaseId,
  productName: string,
  checkPermissions?: (checks: PermissionCheck[]) => boolean[],
) => {
  switch (phaseId) {
    case 'orientation':
      return t('Get familiar with {{ productName }} and learn how to navigate the console.', { productName });
    case 'build-image':
      return t('Create a custom edge OS image so devices auto-register on boot.');
    case 'enroll-device':
      return t('Boot a device with your image, then approve it to bring it under management.');
    case 'manage-fleet':
      if (checkPermissions && !checkPermissions([{ kind: RESOURCE.FLEET, verb: VERB.CREATE }])[0]) {
        return t(
          'Learn how fleets group devices, what you can view on the Fleets page, and how fleet administrators manage rollouts.',
        );
      }
      return t('Group devices that share the same OS image and update policy into a fleet for centralized management.');
  }
};
