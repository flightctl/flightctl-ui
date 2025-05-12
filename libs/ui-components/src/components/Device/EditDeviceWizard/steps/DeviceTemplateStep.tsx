import * as React from 'react';
import { Alert, CodeBlock, CodeBlockCode, FormGroup, Grid, Spinner } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';
import { Trans } from 'react-i18next';
import { Repository } from '@flightctl/types';

import { CREATE_ACM_REPOSITORY, USING_TEMPLATE_VARIABLES_LINK } from '../../../../links';
import { useTranslation } from '../../../../hooks/useTranslation';
import LabelWithHelperText, { FormGroupWithHelperText } from '../../../common/WithHelperText';
import LearnMoreLink from '../../../common/LearnMoreLink';
import TextField from '../../../form/TextField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { DeviceSpecConfigFormValues } from '../../../../types/deviceSpec';
import ConfigurationTemplates from './ConfigurationTemplates';
import ApplicationsForm from './ApplicationTemplates';
import SystemdUnitsForm from './SystemdUnitsForm';
import CheckboxField from '../../../form/CheckboxField';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { FlightCtlApp, useAppContext } from '../../../../hooks/useAppContext';
import { ACM_REPO_NAME } from '../deviceSpecUtils';

export const deviceTemplateStepId = 'device-template';

export const isDeviceTemplateStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) =>
  !errors.osImage && !errors.configTemplates && !errors.applications && !errors.systemdUnits;

const templateOption1 = '{{ .metadata.labels.key }}';
const templateOption2 = '{{ .metadata.name }}';
const exampleCode = `/device-configs/deployment-sites/site-{{ .metadata.labels.site }}`;

const MicroShiftCheckbox = ({ isFleet, isReadOnly }: { isFleet: boolean; isReadOnly?: boolean }) => {
  const { initialValues } = useFormikContext<DeviceSpecConfigFormValues>();
  const { t } = useTranslation();

  const [repo, loading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${ACM_REPO_NAME}`,
  });
  if (loading) {
    return <Spinner size="sm" />;
  }

  const isDisabled = !initialValues.registerMicroShift && (!repo || !!error);
  return (
    <>
      <FormGroup>
        <CheckboxField
          name="registerMicroShift"
          label={
            isFleet ? (
              <>
                {t('Register all MicroShift devices to ACM')}
                <LabelWithHelperText
                  label="MicroShift registration"
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
                  hideLabel
                />
              </>
            ) : (
              <>
                {t('Register this MicroShift device to ACM')}
                <LabelWithHelperText
                  label="MicroShift registration"
                  content={
                    <>
                      {t('Select this when the device is running MicroShift and you want to register it to ACM.')}
                      <br />
                      {t(
                        "To remove registration, you'll need to uncheck this option and also remove the cluster from ACM's clusters list",
                      )}
                    </>
                  }
                  hideLabel
                />
              </>
            )
          }
          isDisabled={isDisabled || isReadOnly}
        />
      </FormGroup>
      {isDisabled && (
        <FormGroup>
          <Alert variant="warning" title={t('Cannot register MicroShift devices')} isInline>
            {t(`{{ repository }} repository is missing. To re-create the repository`, {
              repository: `'${ACM_REPO_NAME}'`,
            })}
            {', '}
            <LearnMoreLink link={CREATE_ACM_REPOSITORY} text={t('view documentation')} />
          </Alert>
        </FormGroup>
      )}
    </>
  );
};

const DeviceTemplateStep = ({ isFleet, isReadOnly }: { isFleet: boolean; isReadOnly?: boolean }) => {
  const { appType } = useAppContext();
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();
  return (
    <Grid span={8}>
      <FlightCtlForm>
        {isFleet && !isReadOnly && (
          <Alert isInline variant="info" title={t('Using template variables')} isExpandable>
            <Trans t={t}>
              Add a variable by using <strong>{templateOption1}</strong> or <strong>{templateOption2}</strong> and it
              will be applied based on each device&rsquo;s details. For example, you could set the following value to
              apply different files in a Git configuration:
            </Trans>
            <CodeBlock className="pf-v5-u-mt-md">
              <CodeBlockCode>{exampleCode}</CodeBlockCode>
            </CodeBlock>
            <LearnMoreLink link={USING_TEMPLATE_VARIABLES_LINK} />
          </Alert>
        )}
        <FormGroupWithHelperText
          label={t('System image')}
          content={
            isFleet
              ? t("The target system image for this fleet's devices.")
              : t('The target system image for this device.')
          }
        >
          <TextField
            name="osImage"
            aria-label={t('System image')}
            value={values.osImage}
            isDisabled={isReadOnly}
            helperText={t(
              'Must be a reference to a bootable container image (such as "quay.io/<my-org>/my-rhel-with-fc-agent:<version>"). If you do not want to manage your OS from Edge management, leave this field empty.',
            )}
          />
        </FormGroupWithHelperText>
        <FormGroup>
          <ConfigurationTemplates isReadOnly={isReadOnly} />
        </FormGroup>
        <FormGroup>
          <ApplicationsForm isReadOnly={isReadOnly} />
        </FormGroup>
        {isFleet && (
          <FormGroup label={t('Tracked systemd services')}>
            <SystemdUnitsForm isReadOnly={isReadOnly} />
          </FormGroup>
        )}
        {appType === FlightCtlApp.OCP && <MicroShiftCheckbox isFleet={isFleet} isReadOnly={isReadOnly} />}
      </FlightCtlForm>
    </Grid>
  );
};

export default DeviceTemplateStep;
