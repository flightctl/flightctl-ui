import * as React from 'react';
import { useField } from 'formik';
import { Content, FormGroup, FormSection, Grid, Switch } from '@patternfly/react-core';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import LearnMoreLink from '../../../common/LearnMoreLink';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppLinks } from '../../../../hooks/useAppLinks';
import {
  ComposeImageAppForm,
  QuadletImageAppForm,
  RUN_AS_DEFAULT_USER,
  RUN_AS_ROOT_USER,
  isQuadletImageAppForm,
} from '../../../../types/deviceSpec';

const ApplicationImageForm = ({
  app,
  index,
  isReadOnly,
}: {
  app: QuadletImageAppForm | ComposeImageAppForm;
  index: number;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const createAppLink = useAppLinks('createApp');
  const appFieldName = `applications[${index}]`;
  const isQuadlet = isQuadletImageAppForm(app);
  const [{ value: runAs }, , { setValue: setRunAs }] = useField<string | undefined>(`${appFieldName}.runAs`);
  const isRootless = runAs !== RUN_AS_ROOT_USER;

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
        <TextField
          aria-label={t('Image')}
          name={`applications.${index}.image`}
          value={app.image || ''}
          isDisabled={isReadOnly}
        />
      </FormGroupWithHelperText>
      {isQuadlet && (
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
      )}
    </Grid>
  );
};

export default ApplicationImageForm;
