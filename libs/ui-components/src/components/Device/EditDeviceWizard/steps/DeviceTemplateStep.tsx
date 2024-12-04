import * as React from 'react';
import { Alert, CodeBlock, CodeBlockCode, FormGroup, Grid, Spinner } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';
import { Trans } from 'react-i18next';
import { Repository } from '@flightctl/types';

import { useTranslation } from '../../../../hooks/useTranslation';
import WithHelperText from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { DeviceSpecConfigFormValues } from '../types';
import ConfigurationTemplates from './ConfigurationTemplates';
import ApplicationsForm from './ApplicationTemplates';
import CheckboxField from '../../../form/CheckboxField';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { useAppContext } from '../../../../hooks/useAppContext';
import { ACM_REPO_NAME } from '../deviceSpecUtils';

export const deviceTemplateStepId = 'device-template';

export const isDeviceTemplateStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) => {
  return !errors.osImage && !errors.configTemplates && !errors.applications;
};

const templateOption1 = '{{ device.metadata.labels[key] }}';
const templateOption2 = '{{ device.metadata.name }}';
const exampleCode = `/device-configs/factory-floors/floor-{{ device.metadata.labels[factory-floor] }}`;

const MicroShiftCheckbox = ({ isFleet }: { isFleet: boolean }) => {
  const { t } = useTranslation();

  const [repo, loading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${ACM_REPO_NAME}`,
  });
  if (loading) {
    return <Spinner size="sm" />;
  }

  const isDisabled = !repo || !!error;
  return (
    <CheckboxField
      name="registerMicroShift"
      label={
        isFleet ? (
          <>
            {t('Register all MicroShift devices to ACM')}
            <WithHelperText
              ariaLabel="MicroShift registration"
              content={
                <>
                  {t(
                    'Select this when all the devices in the fleet are running MicroShift and you want to register them to ACM.',
                  )}
                  <br />
                  {t(
                    "To remove registration, you'll need to uncheck this option and also remove the clusters from ACM's clusters list",
                  )}
                </>
              }
            />
          </>
        ) : (
          <>
            {t('Register this MicroShift device to ACM')}
            <WithHelperText
              ariaLabel="MicroShift registration"
              content={
                <>
                  {t('Select this when the device is running MicroShift and you want to register it to ACM.')}
                  <br />
                  {t(
                    "To remove registration, you'll need to uncheck this option and also remove the cluster from ACM's clusters list",
                  )}
                </>
              }
            />
          </>
        )
      }
      isDisabled={isDisabled}
    />
  );
};

const DeviceTemplateStep = ({ isFleet }: { isFleet: boolean }) => {
  const { appType } = useAppContext();
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();
  return (
    <Grid span={8}>
      <FlightCtlForm>
        {isFleet && (
          <Alert isInline variant="info" title={t('Using template variables')} isExpandable>
            <Trans t={t}>
              Add a variable by using <strong>{templateOption1}</strong> or <strong>{templateOption2}</strong> and it
              will be applied based on each device&rsquo;s details. For example, you could set the following value to
              apply different files in a Git configuration:
            </Trans>
            <CodeBlock className="pf-v5-u-mt-md">
              <CodeBlockCode>{exampleCode}</CodeBlockCode>
            </CodeBlock>
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
          <ConfigurationTemplates />
        </FormGroup>
        <FormGroup>
          <ApplicationsForm />
        </FormGroup>
        {appType === 'ocp' && (
          <FormGroup>
            <MicroShiftCheckbox isFleet={isFleet} />
          </FormGroup>
        )}
      </FlightCtlForm>
    </Grid>
  );
};

export default DeviceTemplateStep;
