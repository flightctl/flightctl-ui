import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import { Button, FormGroup, Grid, Label, LabelGroup, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';

import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import TextField from '../../../form/TextField';
import ErrorHelperText from '../../../form/FieldHelperText';
import { isDuplicatePortMapping, isValidPortMapping, validatePortNumber } from '../../../form/validations';
import { useTranslation } from '../../../../hooks/useTranslation';
import { PortMapping, SingleContainerAppForm } from '../../../../types/deviceSpec';

import './ApplicationContainerForm.css';

const ApplicationContainerForm = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }] = useField<SingleContainerAppForm>(`${appFieldName}`);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const ports = React.useMemo(() => app.ports || [], [app.ports]);

  const [hostPort, setHostPort] = React.useState('');
  const [containerPort, setContainerPort] = React.useState('');
  const [hostPortTouched, setHostPortTouched] = React.useState(false);
  const [containerPortTouched, setContainerPortTouched] = React.useState(false);
  const [editingPortIndex, setEditingPortIndex] = React.useState<number | null>(null);
  const [editingPortError, setEditingPortError] = React.useState<string | undefined>(undefined);

  const canAddPorts = !editingPortError && isValidPortMapping(hostPort, containerPort, ports) && !isReadOnly;

  const validatePort = (port: string): string | undefined => {
    const error = validatePortNumber(port, t);
    if (error) {
      return error;
    }
    // Check for duplicate if both ports match the number pattern
    if (isDuplicatePortMapping(port, containerPort, ports)) {
      return t('This port mapping already exists');
    }
    return undefined;
  };

  const hostPortError = hostPortTouched ? validatePort(hostPort) : undefined;
  const containerPortError = containerPortTouched ? validatePort(containerPort) : undefined;

  const updatePorts = async (newPorts: PortMapping[]) => {
    await setFieldValue(`${appFieldName}.ports`, newPorts, true);
    setFieldTouched(`${appFieldName}.ports`, true);
  };

  const onAddPort = () => {
    if (isValidPortMapping(hostPort, containerPort, ports)) {
      updatePorts([...ports, { hostPort, containerPort }]);
      setHostPort('');
      setContainerPort('');
      setHostPortTouched(false);
      setContainerPortTouched(false);
      setEditingPortIndex(null);
      setEditingPortError(undefined);
    }
  };

  const onDeletePort = async (index: number) => {
    const newPorts = [...ports];
    newPorts.splice(index, 1);
    await updatePorts(newPorts);
    // Clear error state if the deleted port was being edited
    if (editingPortIndex === index) {
      setEditingPortIndex(null);
      setEditingPortError(undefined);
    } else if (editingPortIndex !== null && editingPortIndex > index) {
      // Adjust the editing index if a port before it was deleted
      setEditingPortIndex(editingPortIndex - 1);
    }
  };

  const validatePortMapping = (
    hostPortValue: string,
    containerPortValue: string,
    excludeIndex?: number,
  ): string | undefined => {
    if (!hostPortValue || !containerPortValue) {
      return t('Port mapping must be in format "hostPort:containerPort"');
    }
    // Validate host port
    const hostError = validatePortNumber(hostPortValue, t);
    if (hostError) {
      return hostError;
    }

    // Validate container port
    const containerError = validatePortNumber(containerPortValue, t);
    if (containerError) {
      return containerError;
    }

    // Validate both ports together
    if (!isValidPortMapping(hostPortValue, containerPortValue, [])) {
      return t('Invalid port values');
    }

    // Check for duplicates, excluding the current port being edited
    const otherPorts = excludeIndex !== undefined ? ports.filter((_, i) => i !== excludeIndex) : ports;
    if (isDuplicatePortMapping(hostPortValue, containerPortValue, otherPorts)) {
      return t('This port mapping already exists');
    }

    return undefined;
  };

  const onEditPort = async (index: number, newText: string) => {
    const [newHostPort, newContainerPort] = newText.split(':');

    const error = validatePortMapping(newHostPort || '', newContainerPort || '', index);

    if (error) {
      // Keep label in edit mode and show error
      setEditingPortIndex(index);
      setEditingPortError(error);
      return;
    }

    const newPorts = [...ports];
    newPorts[index] = { hostPort: newHostPort || '', containerPort: newContainerPort || '' };
    await updatePorts(newPorts);

    // Clear editing state
    setEditingPortIndex(null);
    setEditingPortError(undefined);
  };

  const onEditCancel = (index: number) => {
    // Clear editing state when user cancels
    if (editingPortIndex === index) {
      setEditingPortIndex(null);
      setEditingPortError(undefined);
    }
  };

  // Clear error state if the editing index becomes invalid (e.g., port was deleted externally)
  React.useEffect(() => {
    if (editingPortIndex !== null && editingPortIndex >= ports.length) {
      setEditingPortIndex(null);
      setEditingPortError(undefined);
    }
  }, [editingPortIndex, ports]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddPort();
    }
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

      <FormGroup label={t('Ports')}>
        <small>{t('Provide a list of ports to map to the container')}</small>
        {!isReadOnly && (
          <Split hasGutter className="pf-v6-u-mt-sm">
            <SplitItem isFilled>
              <TextInput
                aria-label={t('Host port')}
                value={hostPort}
                placeholder={t('Host port')}
                onChange={(_, value) => {
                  setHostPort(value);
                  setHostPortTouched(true);
                }}
                onBlur={() => setHostPortTouched(true)}
                onKeyDown={handleKeyDown}
                isDisabled={isReadOnly}
                validated={hostPortError ? 'error' : 'default'}
              />
              {hostPortError ? <ErrorHelperText error={hostPortError} touchRequired={false} /> : <div>&nbsp;</div>}
            </SplitItem>
            <SplitItem isFilled>
              <TextInput
                aria-label={t('Container port')}
                value={containerPort}
                placeholder={t('Container port')}
                onChange={(_, value) => {
                  setContainerPort(value);
                  setContainerPortTouched(true);
                }}
                onBlur={() => setContainerPortTouched(true)}
                onKeyDown={handleKeyDown}
                isDisabled={isReadOnly}
                validated={containerPortError ? 'error' : 'default'}
              />
            </SplitItem>
            <SplitItem>
              <Button
                aria-label={t('Add port mapping')}
                variant="control"
                icon={<ArrowRightIcon />}
                iconPosition="end"
                onClick={onAddPort}
                isDisabled={!canAddPorts}
              >
                {t('Add')}
              </Button>
            </SplitItem>
          </Split>
        )}
        {ports && ports.length > 0 && (
          <>
            <LabelGroup
              numLabels={5}
              categoryName={t('Added ports')}
              isEditable={!isReadOnly}
              className="fctl-containerapp__added-ports"
            >
              {ports.map((port, portIndex) => {
                const portText = `${port.hostPort}:${port.containerPort}`;
                const isEditing = editingPortIndex === portIndex;
                const hasError = isEditing && editingPortError;
                return (
                  <Label
                    key={`${port.hostPort}_${port.containerPort}_${portIndex}`}
                    textMaxWidth="16ch"
                    onClose={!isReadOnly ? () => onDeletePort(portIndex) : undefined}
                    onEditComplete={!isReadOnly ? (_, newText) => onEditPort(portIndex, newText) : undefined}
                    onEditCancel={!isReadOnly ? () => onEditCancel(portIndex) : undefined}
                    title={portText}
                    isEditable={!isReadOnly && (!editingPortError || portIndex === editingPortIndex)}
                    color={hasError ? 'red' : undefined}
                  >
                    {portText}
                  </Label>
                );
              })}
            </LabelGroup>
            {editingPortError && editingPortIndex !== null && (
              <ErrorHelperText error={editingPortError} touchRequired={false} />
            )}
          </>
        )}
      </FormGroup>
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
