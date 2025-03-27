import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AppForm, getAppIdentifier, isInlineAppForm } from '../../../../types/deviceSpec';

const ReviewApplications = ({ apps }: { apps: AppForm[] }) => {
  const { t } = useTranslation();
  if (apps.length === 0) {
    return '-';
  }

  return (
    <Stack hasGutter>
      {apps.map((app, index) => {
        const isInlineApp = isInlineAppForm(app);
        const type = isInlineApp ? t('Inline') : t('Image based');
        let name: string = '';
        if (isInlineApp || app.name) {
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
