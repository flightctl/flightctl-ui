import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Label,
  LabelGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { type PortMapping } from '../../types/deviceSpec';
import { VM_PORT_PROTOCOLS } from '../../utils/vmApplications';
import ErrorHelperText from './FieldHelperText';
import { toFormPortMappingWithProtocol } from '../Device/EditDeviceWizard/deviceSpecUtils';
import { isDuplicatePortMapping, isValidPortMapping, validatePortNumber } from './validations';

type ApplicationPortMappingFieldProps = {
  ports: PortMapping[];
  onChange: (ports: PortMapping[]) => void;
  isReadOnly?: boolean;
  description: string;
  targetPortAriaLabel: string;
  targetPortPlaceholder: string;
  withProtocol?: boolean;
};

const normalizeProtocol = (protocol?: string) => (protocol || 'tcp').toLowerCase();

const isDuplicatePort = (
  hostPort: string,
  targetPort: string,
  existingPorts: PortMapping[],
  options?: { protocol?: string; excludeIndex?: number; matchProtocol?: boolean },
): boolean => {
  const otherPorts =
    options?.excludeIndex !== undefined
      ? existingPorts.filter((_, index) => index !== options.excludeIndex)
      : existingPorts;

  if (options?.matchProtocol) {
    const protocol = normalizeProtocol(options.protocol);
    return otherPorts.some(
      (port) =>
        port.hostPort === hostPort && port.targetPort === targetPort && normalizeProtocol(port.protocol) === protocol,
    );
  }

  return isDuplicatePortMapping(hostPort, targetPort, otherPorts);
};

const ApplicationPortMappingField = ({
  ports = [],
  onChange,
  isReadOnly,
  description,
  targetPortAriaLabel,
  targetPortPlaceholder,
  withProtocol,
}: ApplicationPortMappingFieldProps) => {
  const { t } = useTranslation();

  const [hostPort, setHostPort] = React.useState('');
  const [targetPort, setTargetPort] = React.useState('');
  const [protocol, setProtocol] = React.useState<string>('tcp');
  const [isProtocolOpen, setIsProtocolOpen] = React.useState(false);
  const [hostPortTouched, setHostPortTouched] = React.useState(false);
  const [targetPortTouched, setTargetPortTouched] = React.useState(false);
  const [editingPortIndex, setEditingPortIndex] = React.useState<number | null>(null);
  const [editingPortError, setEditingPortError] = React.useState<string | undefined>(undefined);

  const canAddPorts =
    !editingPortError &&
    isValidPortMapping(hostPort, targetPort, withProtocol ? [] : ports) &&
    !isReadOnly &&
    (!withProtocol || !isDuplicatePort(hostPort, targetPort, ports, { protocol, matchProtocol: true }));

  const duplicateCheckOptions = {
    protocol: withProtocol ? protocol : undefined,
    matchProtocol: withProtocol,
  };

  const validateHostPort = (port: string): string | undefined => {
    const error = validatePortNumber(port, t);
    if (error) {
      return error;
    }
    if (isDuplicatePort(port, targetPort, ports, duplicateCheckOptions)) {
      return t('This port mapping already exists');
    }
    return undefined;
  };

  const validateTargetPort = (port: string): string | undefined => {
    const error = validatePortNumber(port, t);
    if (error) {
      return error;
    }
    if (isDuplicatePort(hostPort, port, ports, duplicateCheckOptions)) {
      return t('This port mapping already exists');
    }
    return undefined;
  };

  const hostPortError = hostPortTouched ? validateHostPort(hostPort) : undefined;
  const targetPortError = targetPortTouched ? validateTargetPort(targetPort) : undefined;

  const formatPortText = (port: PortMapping) =>
    withProtocol
      ? `${port.hostPort}:${port.targetPort}/${normalizeProtocol(port.protocol)}`
      : `${port.hostPort}:${port.targetPort}`;

  const onAddPort = () => {
    if (!isValidPortMapping(hostPort, targetPort, withProtocol ? [] : ports)) {
      return;
    }
    if (withProtocol && isDuplicatePort(hostPort, targetPort, ports, { protocol, matchProtocol: true })) {
      return;
    }

    onChange([...ports, { hostPort, targetPort, ...(withProtocol ? { protocol } : {}) }]);
    setHostPort('');
    setTargetPort('');
    setProtocol('tcp');
    setHostPortTouched(false);
    setTargetPortTouched(false);
    setEditingPortIndex(null);
    setEditingPortError(undefined);
  };

  const onDeletePort = (index: number) => {
    const newPorts = [...ports];
    newPorts.splice(index, 1);
    onChange(newPorts);
    if (editingPortIndex === index) {
      setEditingPortIndex(null);
      setEditingPortError(undefined);
    } else if (editingPortIndex !== null && editingPortIndex > index) {
      setEditingPortIndex(editingPortIndex - 1);
    }
  };

  const validatePortMapping = (
    hostPortValue: string,
    targetPortValue: string,
    excludeIndex?: number,
    protocolValue?: string,
  ): string | undefined => {
    if (!hostPortValue || !targetPortValue) {
      return withProtocol
        ? t('Port mapping must be in format "hostPort:targetPort[/protocol]"')
        : t('Port mapping must be in format "hostPort:targetPort"');
    }
    const hostError = validatePortNumber(hostPortValue, t);
    if (hostError) {
      return hostError;
    }

    const targetError = validatePortNumber(targetPortValue, t);
    if (targetError) {
      return targetError;
    }

    if (!isValidPortMapping(hostPortValue, targetPortValue, [])) {
      return t('Invalid port values');
    }

    if (withProtocol) {
      const normalizedProtocol = normalizeProtocol(protocolValue);
      if (!VM_PORT_PROTOCOLS.includes(normalizedProtocol as (typeof VM_PORT_PROTOCOLS)[number])) {
        return t('Invalid port values');
      }
    }

    if (
      isDuplicatePort(hostPortValue, targetPortValue, ports, {
        protocol: protocolValue,
        excludeIndex,
        matchProtocol: withProtocol,
      })
    ) {
      return t('This port mapping already exists');
    }

    return undefined;
  };

  const onEditPort = (index: number, newText: string) => {
    const portObj = toFormPortMappingWithProtocol(newText);
    const error = validatePortMapping(
      portObj.hostPort,
      portObj.targetPort,
      index,
      withProtocol ? portObj.protocol : undefined,
    );

    if (error) {
      setEditingPortIndex(index);
      setEditingPortError(error);
      return;
    }

    const newPorts = [...ports];
    newPorts[index] = withProtocol ? portObj : { hostPort: portObj.hostPort, targetPort: portObj.targetPort };
    onChange(newPorts);

    setEditingPortIndex(null);
    setEditingPortError(undefined);
  };

  const onEditCancel = (index: number) => {
    if (editingPortIndex === index) {
      setEditingPortIndex(null);
      setEditingPortError(undefined);
    }
  };

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

  let addedPortsContent: React.ReactNode;
  if (ports.length > 0) {
    addedPortsContent = (
      <>
        <LabelGroup numLabels={5} categoryName={t('Added ports')} isEditable={!isReadOnly}>
          {ports.map((port, portIndex) => {
            const portText = formatPortText(port);
            const isEditing = editingPortIndex === portIndex;
            const hasError = isEditing && editingPortError;

            const key = `${port.hostPort}_${port.targetPort}_${port.protocol ?? 'tcp'}_${portIndex}`;
            if (isReadOnly) {
              return (
                <Label key={key} textMaxWidth="20ch">
                  {portText}
                </Label>
              );
            }
            return (
              <Label
                key={key}
                textMaxWidth="20ch"
                onClose={() => onDeletePort(portIndex)}
                onEditComplete={(_, newText) => onEditPort(portIndex, newText)}
                onEditCancel={() => onEditCancel(portIndex)}
                title={portText}
                isEditable={!editingPortError || portIndex === editingPortIndex}
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
    );
  } else if (isReadOnly) {
    addedPortsContent = <Content>{t('None defined')}</Content>;
  }

  const fieldContent = !isReadOnly ? (
    <Split hasGutter>
      <SplitItem isFilled>
        <TextInput
          aria-label={t('Host port')}
          value={hostPort}
          placeholder={t('Enter host port')}
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
          aria-label={targetPortAriaLabel}
          value={targetPort}
          placeholder={targetPortPlaceholder ?? t('Enter target port')}
          onChange={(_, value) => {
            setTargetPort(value);
            setTargetPortTouched(true);
          }}
          onBlur={() => setTargetPortTouched(true)}
          onKeyDown={handleKeyDown}
          isDisabled={isReadOnly}
          validated={targetPortError ? 'error' : 'default'}
        />
        {targetPortError ? <ErrorHelperText error={targetPortError} touchRequired={false} /> : <div>&nbsp;</div>}
      </SplitItem>
      {withProtocol && (
        <SplitItem>
          <Select
            isOpen={isProtocolOpen}
            selected={protocol}
            onOpenChange={(open) => setIsProtocolOpen(open)}
            onSelect={(_, value) => {
              setProtocol(String(value));
              setIsProtocolOpen(false);
            }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                aria-label={t('Protocol')}
                onClick={() => setIsProtocolOpen(!isProtocolOpen)}
                isExpanded={isProtocolOpen}
                style={{ minWidth: '5.5rem' }}
              >
                {protocol.toUpperCase()}
              </MenuToggle>
            )}
          >
            <SelectList>
              {VM_PORT_PROTOCOLS.map((option) => (
                <SelectOption key={option} value={option}>
                  {option.toUpperCase()}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </SplitItem>
      )}
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
  ) : null;

  return (
    <FormGroup label={t('Ports')}>
      <Stack hasGutter>
        {!isReadOnly && (
          <>
            <StackItem>
              <Content component={ContentVariants.small}>{description}</Content>
            </StackItem>
            <StackItem>{fieldContent}</StackItem>
          </>
        )}
        <StackItem>{addedPortsContent}</StackItem>
      </Stack>
    </FormGroup>
  );
};

export default ApplicationPortMappingField;
