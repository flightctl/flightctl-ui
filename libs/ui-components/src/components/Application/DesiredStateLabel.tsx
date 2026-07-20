import * as React from 'react';
import { Label } from '@patternfly/react-core';

import { ApplicationDesiredState } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';

const DesiredStateLabel = ({ desiredState }: { desiredState?: ApplicationDesiredState }) => {
  const { t } = useTranslation();
  if (desiredState === ApplicationDesiredState.ApplicationDesiredStateStopped) {
    return (
      <Label color="grey" isCompact>
        {t('Stopped')}
      </Label>
    );
  }
  return (
    <Label color="green" isCompact>
      {t('Running')}
    </Label>
  );
};

export default DesiredStateLabel;
