import * as React from 'react';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppLinks } from '../../../../hooks/useAppLinks';
import { ImageAppForm } from '../../../../types/deviceSpec';

const ApplicationImageForm = ({
  app,
  index,
  isReadOnly,
}: {
  app: ImageAppForm;
  index: number;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const createAppLink = useAppLinks('createApp');

  return (
    <FormGroupWithHelperText
      label={t('Image')}
      content={
        <span>
          {t('The application image. Learn how to create one')} <LearnMoreLink text={t('here')} link={createAppLink} />
        </span>
      }
      isRequired
    >
      <TextField
        aria-label={t('Image')}
        name={`applications.${index}.image`}
        value={app.image || ''}
        isDisabled={isReadOnly}
      />
    </FormGroupWithHelperText>
  );
};

export default ApplicationImageForm;
