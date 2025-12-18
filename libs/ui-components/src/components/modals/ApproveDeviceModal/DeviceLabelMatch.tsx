import * as React from 'react';
import { Spinner, TextInput } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceMatchStatus } from '../../../hooks/useDeviceLabelMatch';

export const DeviceLabelMatch = ({ matchStatus }: { matchStatus: DeviceMatchStatus }) => {
  const { t } = useTranslation();

  switch (matchStatus.status) {
    case 'unchecked':
      return <TextInput value="" placeholder={t('Add labels to select a fleet.')} readOnlyVariant="default" />;
    case 'unchecked--invalid':
      return (
        <TextInput
          value={t('Fleet label match cannot cannot be evaluated when there are invalid labels.')}
          type="text"
          validated="warning"
          readOnlyVariant="default"
        />
      );
    case 'checking':
      return <TextInput value="" customIcon={<Spinner size="sm" />} readOnlyVariant="default" />;
    case 'checked--unique':
      return (
        <TextInput
          className="fctl-device-label-match"
          type="text"
          readOnlyVariant="default"
          value={matchStatus.detail || ''}
          validated="success"
        />
      );
    case 'checked--empty':
      return (
        <TextInput
          value={t('No fleet is matching the selected labels.')}
          validated="warning"
          readOnlyVariant="default"
        />
      );
    case 'checked--multiple':
      return (
        <TextInput
          readOnlyVariant="default"
          value={t(
            "More than one fleet is matching the selected labels. The device will ignore the fleets' configurations.",
          )}
          validated="error"
        />
      );
    case 'checked--error': {
      const text = t('Check for matching fleet(s) failed. {{errorMessage}}', {
        errorMessage: matchStatus.detail || t('Unknown error'),
      });
      return <TextInput value={text} validated="error" readOnlyVariant="default" />;
    }
  }
};

export default DeviceLabelMatch;
