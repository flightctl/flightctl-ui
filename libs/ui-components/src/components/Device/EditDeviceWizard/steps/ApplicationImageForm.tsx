import * as React from 'react';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { CREATING_APPLICATIONS_LINK } from '../../../../links';
import { useTranslation } from '../../../../hooks/useTranslation';
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
  return (
    <FormGroupWithHelperText
      label={t('Image')}
      content={
        <span>
          {t('The application image. Learn how to create one')}{' '}
          <LearnMoreLink text={t('here')} link={CREATING_APPLICATIONS_LINK} />
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
