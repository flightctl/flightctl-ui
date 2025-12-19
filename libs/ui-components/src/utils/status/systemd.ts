import { TFunction } from 'react-i18next';

import { SystemdActiveStateType, SystemdEnableStateType, SystemdLoadStateType } from '@flightctl/types';

export const getSystemdEnableStateLabel = (enableState: SystemdEnableStateType, t: TFunction): string => {
  switch (enableState) {
    case SystemdEnableStateType.SystemdEnableStateEnabled:
      return t('Enabled');
    case SystemdEnableStateType.SystemdEnableStateDisabled:
      return t('Disabled');
    case SystemdEnableStateType.SystemdEnableStateStatic:
      return t('Static');
    case SystemdEnableStateType.SystemdEnableStateMasked:
      return t('Masked');
    case SystemdEnableStateType.SystemdEnableStateEnabledRuntime:
      return t('Enabled runtime');
    case SystemdEnableStateType.SystemdEnableStateMaskedRuntime:
      return t('Masked runtime');
    case SystemdEnableStateType.SystemdEnableStateLinked:
      return t('Linked');
    case SystemdEnableStateType.SystemdEnableStateLinkedRuntime:
      return t('Linked runtime');
    case SystemdEnableStateType.SystemdEnableStateGenerated:
      return t('Generated');
    case SystemdEnableStateType.SystemdEnableStateTransient:
      return t('Transient');
    case SystemdEnableStateType.SystemdEnableStateIndirect:
      return t('Indirect');
    case SystemdEnableStateType.SystemdEnableStateAlias:
      return t('Alias');
    case SystemdEnableStateType.SystemdEnableStateBad:
      return t('Bad');
    case SystemdEnableStateType.SystemdEnableStateUnknown:
      return t('Unknown');
    case SystemdEnableStateType.SystemdEnableStateEmpty:
      return t('Empty');
    default:
      return enableState;
  }
};

export const getSystemdLoadStateLabel = (loadState: SystemdLoadStateType, t: TFunction): string => {
  switch (loadState) {
    case SystemdLoadStateType.SystemdLoadStateLoaded:
      return t('Loaded');
    case SystemdLoadStateType.SystemdLoadStateNotFound:
      return t('Not found');
    case SystemdLoadStateType.SystemdLoadStateError:
      return t('Error');
    case SystemdLoadStateType.SystemdLoadStateBadSetting:
      return t('Bad setting');
    case SystemdLoadStateType.SystemdLoadStateMasked:
      return t('Masked');
    case SystemdLoadStateType.SystemdLoadStateMerged:
      return t('Merged');
    case SystemdLoadStateType.SystemdLoadStateStub:
      return t('Stub');
    case SystemdLoadStateType.SystemdLoadStateUnknown:
      return t('Unknown');
    default:
      return loadState;
  }
};

export const getSystemdActiveStateLabel = (activeState: SystemdActiveStateType, t: TFunction): string => {
  switch (activeState) {
    case SystemdActiveStateType.SystemdActiveStateActive:
      return t('Active');
    case SystemdActiveStateType.SystemdActiveStateInactive:
      return t('Inactive');
    case SystemdActiveStateType.SystemdActiveStateFailed:
      return t('Failed');
    case SystemdActiveStateType.SystemdActiveStateActivating:
      return t('Activating');
    case SystemdActiveStateType.SystemdActiveStateDeactivating:
      return t('Deactivating');
    case SystemdActiveStateType.SystemdActiveStateReloading:
      return t('Reloading');
    case SystemdActiveStateType.SystemdActiveStateRefreshing:
      return t('Refreshing');
    case SystemdActiveStateType.SystemdActiveStateMaintenance:
      return t('Maintenance');
    case SystemdActiveStateType.SystemdActiveStateUnknown:
      return t('Unknown');
    default:
      return activeState;
  }
};
