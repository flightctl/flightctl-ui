import * as React from 'react';
import { Alert, Form, FormGroup, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../../../hooks/useTranslation';
import WithHelperText from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import { DeviceSpecConfigFormValues } from '../types';
import ConfigTemplateForm from './ConfigTemplateForm';

export const deviceTemplateStepId = 'device-template';

export const isDeviceTemplateStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) => {
  return !errors.osImage && !errors.configTemplates;
};

const templateCode = '{{ device.metadata.labels[key] }}';

const DeviceTemplateStep = ({ isFleet }: { isFleet: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues & { fleetMatch: string }>();

  return (
    <Grid span={8}>
      <Form>
        {isFleet && (
          <Alert isInline variant="info" title={t('Using template variables')}>
            <Trans t={t}>
              Add a variable using <strong>{templateCode}</strong> and it will be applied based on the devices labels.
              Template variables can only be used in Inline and Git configurations.
            </Trans>
          </Alert>
        )}
        <FormGroup
          label={
            <WithHelperText
              ariaLabel={t('System image')}
              content={
                isFleet
                  ? t("The target system image for this fleet's devices.")
                  : t('The target system image for this device.')
              }
              showLabel
            />
          }
        >
          <TextField
            name="osImage"
            aria-label={t('System image')}
            value={values.osImage}
            helperText={t(
              'Must be either an OCI image ref (e.g. "quay.io/redhat/rhde:9.3") or ostree ref (e.g. "https://ostree.fedoraproject.org/iot?ref=fedora/stable/x86_64/iot"). Keep this empty if you do not want to manage your OS from Flight Control.',
            )}
          />
        </FormGroup>
        <FormGroup>
          <ConfigTemplateForm />
        </FormGroup>
      </Form>
    </Grid>
  );
};

export default DeviceTemplateStep;
