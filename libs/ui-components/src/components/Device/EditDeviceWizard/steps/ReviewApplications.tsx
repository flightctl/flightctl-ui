import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { type TFunction } from 'react-i18next';

import { useTranslation } from '../../../../hooks/useTranslation';
import {
  type ApplicationEntry,
  type ManualAppForm,
  getAppIdentifier,
  isCatalogAppEntry,
} from '../../../../types/deviceSpec';
import { getAppTypeLabel } from '../../../../utils/catalogTypes';

const getManualAppName = (app: ManualAppForm, t: TFunction): string => {
  if (app.name) {
    return app.name;
  }
  if ('image' in app && app.image) {
    return `${t('Unnamed')} (${app.image})`;
  }
  return '';
};

const ReviewApplications = ({ apps }: { apps: ApplicationEntry[] }) => {
  const { t } = useTranslation();

  if (apps.length === 0) {
    return '-';
  }

  return (
    <Stack hasGutter>
      {apps.map((entry, index) => {
        if (isCatalogAppEntry(entry)) {
          const name = entry.app.name || t('Unnamed');
          return (
            <StackItem key={`${getAppIdentifier(entry)}_${index}`}>
              {name} ({t('Catalog')})
            </StackItem>
          );
        }
        const name = getManualAppName(entry.app, t);
        const appType = getAppTypeLabel(entry.app.appType, t);
        return (
          <StackItem key={`${getAppIdentifier(entry)}_${index}`}>
            {name} ({appType})
          </StackItem>
        );
      })}
    </Stack>
  );
};

export default ReviewApplications;
