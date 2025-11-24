import * as React from 'react';
import { FormGroup } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import TextField from '../../form/TextField';

const OAuth2ProviderFields = () => {
  const { t } = useTranslation();
  return (
    <>
      <FormGroup label={t('Authorization URL')} isRequired>
        <TextField name="authorizationUrl" aria-label={t('Authorization URL')} />
      </FormGroup>
      <FormGroup label={t('Token URL')} isRequired>
        <TextField name="tokenUrl" aria-label={t('Token URL')} />
      </FormGroup>
      <FormGroup label={t('Userinfo URL')} isRequired>
        <TextField name="userinfoUrl" aria-label={t('Userinfo URL')} />
      </FormGroup>
    </>
  );
};

export default OAuth2ProviderFields;
