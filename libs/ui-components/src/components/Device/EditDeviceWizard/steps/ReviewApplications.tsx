import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';

import { AppType } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { AppForm, getAppIdentifier, isImageAppForm } from '../../../../types/deviceSpec';

const ReviewApplications = ({ apps }: { apps: AppForm[] }) => {
  const { t } = useTranslation();
  if (apps.length === 0) {
    return '-';
  }

  const getAppFormatLabel = (appType?: AppType) => {
    if (appType === AppType.AppTypeQuadlet) {
      return t('Quadlet');
    }
    return t('Compose');
  };

  return (
    <Stack hasGutter>
      {apps.map((app, index) => {
        const isImageApp = isImageAppForm(app);
        const specType = isImageApp ? t('Image based') : t('Inline');
        const formatType = getAppFormatLabel(app.appType);
        const type = `${specType} - ${formatType}`;
        let name: string = '';
        if (!isImageApp || app.name) {
          name = app.name as string;
        } else if (app.image) {
          name = `${t('Unnamed')} (${app.image})`;
        }
        return (
          <StackItem key={`${getAppIdentifier(app)}_${index}`}>
            {name} ({type})
          </StackItem>
        );
      })}
    </Stack>
  );
};

export default ReviewApplications;
