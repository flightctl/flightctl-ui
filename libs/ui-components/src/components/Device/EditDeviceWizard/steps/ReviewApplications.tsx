import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { TFunction } from 'react-i18next';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AppForm, getAppIdentifier } from '../../../../types/deviceSpec';
import { getAppTypeLabel } from '../../../../utils/apps';

const getAppName = (app: AppForm, t: TFunction): string => {
  if (app.name) {
    return app.name;
  }
  if ('image' in app && app.image) {
    return `${t('Unnamed')} (${app.image})`;
  }
  return '';
};

const ReviewApplications = ({ apps }: { apps: AppForm[] }) => {
  const { t } = useTranslation();

  if (apps.length === 0) {
    return '-';
  }

  return (
    <Stack hasGutter>
      {apps.map((app, index) => {
        const name = getAppName(app, t);
        const appType = getAppTypeLabel(app.appType, t);
        return (
          <StackItem key={`${getAppIdentifier(app)}_${index}`}>
            {name} ({appType})
          </StackItem>
        );
      })}
    </Stack>
  );
};

export default ReviewApplications;
