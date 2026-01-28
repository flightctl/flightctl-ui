import * as React from 'react';
import { useField } from 'formik';
import { Content, FormGroup, FormSection, Switch } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import { RUN_AS_DEFAULT_USER, RUN_AS_ROOT_USER } from '../../../../types/deviceSpec';

type ApplicationIntegritySettingsProps = {
  index: number;
  isReadOnly?: boolean;
};

const ApplicationIntegritySettings = ({ index, isReadOnly }: ApplicationIntegritySettingsProps) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: runAs }, , { setValue: setRunAs }] = useField<string | undefined>(`${appFieldName}.runAs`);
  const isRootless = runAs !== RUN_AS_ROOT_USER;

  return (
    <FormSection title={t('Access & permissions')}>
      <FormGroup>
        <Switch
          id={`${appFieldName}-system-integrity-switch`}
          aria-label={t('System integrity protection')}
          label={isRootless ? t('System integrity protection enabled') : t('System integrity protection disabled')}
          isChecked={isRootless}
          onChange={async (_, checked) => {
            await setRunAs(checked ? RUN_AS_DEFAULT_USER : RUN_AS_ROOT_USER);
          }}
          isDisabled={isReadOnly}
        />
        <DefaultHelperText
          helperText={
            <Content component="small">
              {t(
                'Prevents this workload from modifying critical host operating system files. We recommend keeping this enabled to maintain system integrity.',
              )}
            </Content>
          }
        />
      </FormGroup>
      {isRootless && (
        <FormGroup label={t('Rootless user identity')} isRequired>
          <TextField
            aria-label={t('Rootless user identity')}
            name={`${appFieldName}.runAs`}
            value={runAs || RUN_AS_DEFAULT_USER}
            isDisabled
            readOnly
            helperText={t(
              "By default, workloads run as the '{{ runAsUser }}' user. To specify a custom user identity, edit the application configuration via YAML or CLI.",
              {
                runAsUser: RUN_AS_DEFAULT_USER,
              },
            )}
          />
        </FormGroup>
      )}
    </FormSection>
  );
};

export default ApplicationIntegritySettings;
