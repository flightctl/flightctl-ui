import * as React from 'react';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { getCreatingApplicationsLink } from '../../../../links';
import { useTranslation } from '../../../../hooks/useTranslation';
import { ImageAppForm } from '../../../../types/deviceSpec';
import { useAppContext } from '../../../../hooks/useAppContext';

const ApplicationImageForm = ({ app, index }: { app: ImageAppForm; index: number }) => {
  const { t } = useTranslation();
  const { appType } = useAppContext();
  return (
    <FormGroupWithHelperText
      label={t('Image')}
      content={
        <span>
          {t('The application image. Learn how to create one')}{' '}
          <LearnMoreLink text={t('here')} link={getCreatingApplicationsLink(appType)} />
        </span>
      }
      isRequired
    >
      <TextField aria-label={t('Image')} name={`applications.${index}.image`} value={app.image || ''} />
    </FormGroupWithHelperText>
  );
};

export default ApplicationImageForm;
