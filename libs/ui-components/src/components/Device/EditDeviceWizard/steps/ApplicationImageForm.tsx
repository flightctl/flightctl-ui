import * as React from 'react';
import { Grid } from '@patternfly/react-core';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppLinks } from '../../../../hooks/useAppLinks';

const ApplicationImageForm = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const createAppLink = useAppLinks('createApp');

  return (
    <Grid hasGutter>
      <FormGroupWithHelperText
        label={t('Image')}
        content={
          <span>
            {t('The application image. Learn how to create one')}{' '}
            <LearnMoreLink text={t('here')} link={createAppLink} />
          </span>
        }
        isRequired
      >
        <TextField aria-label={t('Image')} name={`applications.${index}.image`} isDisabled={isReadOnly} />
      </FormGroupWithHelperText>
    </Grid>
  );
};

export default ApplicationImageForm;
