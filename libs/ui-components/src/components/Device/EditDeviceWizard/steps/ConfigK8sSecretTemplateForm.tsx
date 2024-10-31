import * as React from 'react';
import { useFormikContext } from 'formik';
import { FormGroup } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';

import TextField from '../../../form/TextField';
import { DeviceSpecConfigFormValues } from '../types';
import { KubeSecretTemplate } from '../../../../types/deviceSpec';

type ConfigK8sSecretTemplateFormProps = {
  index: number;
};

const ConfigK8sSecretTemplateForm = ({ index }: ConfigK8sSecretTemplateFormProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();
  const template = values.configTemplates[index] as KubeSecretTemplate;
  return (
    <>
      <FormGroup label={t('Secret name')} isRequired>
        <TextField
          aria-label={t('Secret name')}
          value={template.secretName}
          name={`configTemplates.${index}.secretName`}
          isDisabled
        />
      </FormGroup>
      <FormGroup label={t('Secret namespace')} isRequired>
        <TextField
          aria-label={t('Secret namespace')}
          name={`configTemplates.${index}.secretNs`}
          value={template.secretNs}
          isDisabled
        />
      </FormGroup>
      <FormGroup label={t('Mount path')} isRequired>
        <TextField
          aria-label={t('Mount path')}
          name={`configTemplates.${index}.mountPath`}
          value={template.mountPath}
          placeholder={t('/absolute/path')}
          isDisabled
        />
      </FormGroup>
    </>
  );
};

export default ConfigK8sSecretTemplateForm;
