import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import { FormGroup, Grid } from '@patternfly/react-core';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import ApplicationPortMappingField from '../../../form/ApplicationPortMappingField';
import { useTranslation } from '../../../../hooks/useTranslation';
import { PortMapping, SingleContainerAppForm } from '../../../../types/deviceSpec';

import './ApplicationContainerForm.css';

const ApplicationContainerForm = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }] = useField<SingleContainerAppForm>(`${appFieldName}`);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const ports = React.useMemo(() => app.ports || [], [app.ports]);

  const updatePorts = async (newPorts: PortMapping[]) => {
    await setFieldValue(`${appFieldName}.ports`, newPorts, true);
    setFieldTouched(`${appFieldName}.ports`, true);
  };

  return (
    <Grid hasGutter>
      <FormGroupWithHelperText
        label={t('Application name')}
        content={t('If not specified, the image name will be used. Application name must be unique.')}
      >
        <TextField aria-label={t('Application name')} name={`${appFieldName}.name`} isDisabled={isReadOnly} />
      </FormGroupWithHelperText>
      <FormGroup label={t('Image')} isRequired>
        <TextField
          aria-label={t('Image')}
          name={`${appFieldName}.image`}
          isDisabled={isReadOnly}
          helperText={t('Provide a valid image reference')}
        />
      </FormGroup>

      <ApplicationPortMappingField
        ports={ports}
        onChange={updatePorts}
        isReadOnly={isReadOnly}
        description={t('Provide a list of ports to map to the container')}
        targetPortAriaLabel={t('Container port')}
        targetPortPlaceholder={t('Enter container port')}
      />

      <FormGroup label={t('Resources')}>
        <Grid hasGutter>
          <FormGroupWithHelperText
            label={t('CPU limit')}
            content={t(
              'Set the maximum CPU usage for your container. Use fractional values ("0.5" for half a CPU core) or whole numbers ("1", "2" for full cores). Consider your device\'s total CPU capacity when setting limits.',
            )}
          >
            <TextField
              aria-label={t('CPU limit')}
              name={`${appFieldName}.cpuLimit`}
              value={app.cpuLimit || ''}
              placeholder={t('Enter numeric value')}
              isDisabled={isReadOnly}
              helperText={t('Provide a valid CPU value (e.g., "0.4" or "2").')}
            />
          </FormGroupWithHelperText>
          <FormGroupWithHelperText
            label={t('Memory limit')}
            content={t(
              'Set the maximum memory usage for your container using Podman format. You can specify a number with an optional unit: "b" (bytes), "k" (kibibytes), "m" (mebibytes), "g" (gibibytes). Examples: "512", "512m", "1g", "2048k". Ensure the limit fits within your device\'s available memory and accounts for other applications and system processes.',
            )}
          >
            <TextField
              aria-label={t('Memory limit')}
              name={`${appFieldName}.memoryLimit`}
              value={app.memoryLimit || ''}
              placeholder={t('Enter numeric value with optional unit')}
              isDisabled={isReadOnly}
              helperText={t('Provide a valid memory value (e.g., "512", "512m", "2g", "1024k").')}
            />
          </FormGroupWithHelperText>
        </Grid>
      </FormGroup>
    </Grid>
  );
};

export default ApplicationContainerForm;
