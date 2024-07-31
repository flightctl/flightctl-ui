import * as React from 'react';
import { Alert, CodeBlock, CodeBlockCode, ExpandableSection, Form, FormGroup, Grid } from '@patternfly/react-core';
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

const templateOption1 = '{{ device.metadata.labels[key] }}';
const templateOption2 = '{{ device.metadata.name }}';
const exampleCode = `/device-configs/factory-floors/floor-{{ device.metadata.labels[factory-floor] }}`;

const DeviceTemplateStep = ({ isFleet }: { isFleet: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();

  return (
    <Grid span={8}>
      <Form>
        {isFleet && (
          <Alert isInline variant="info" title={t('Using template variables')}>
            <ExpandableSection toggleTextCollapsed={t('Show more')} toggleTextExpanded={t('Show less')}>
              <Trans t={t}>
                Add a variable by using <strong>{templateOption1}</strong> or <strong>{templateOption2}</strong> and it
                will be applied based each device&rsquo;s details. For example, you could set the following value to
                apply different files in a Git configuration:
              </Trans>
              <CodeBlock className="pf-v5-u-mt-md">
                <CodeBlockCode>{exampleCode}</CodeBlockCode>
              </CodeBlock>
            </ExpandableSection>
          </Alert>
        )}
        <FormGroup
          label={
            <WithHelperText
              ariaLabel={t('System image')}
              content={t("The target system image for this fleet's devices.")}
              showLabel
            />
          }
        >
          <TextField
            name="osImage"
            aria-label={t('System image')}
            value={values.osImage}
            helperText={t(
              'Must be either an OCI image ref (e.g. "quay.io/redhat/rhde:9.3") or ostree ref (e.g. "https://ostree.fedoraproject.org/iot?ref=fedora/stable/x86_64/iot"). Keep this empty if you do not want to manage your OS from fleet.',
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
