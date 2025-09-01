import * as React from 'react';
import { Alert, Button, Label, LabelGroup, TextInput } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import ErrorHelperText from '../../form/FieldHelperText';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import FlightCtlForm from '../../form/FlightCtlForm';
import { SystemdUnitFormValue } from '../../../types/deviceSpec';

export type SystemdUnitsFormValues = {
  systemdUnits: SystemdUnitFormValue[];
};

export type TrackSystemdUnitsFormProps = {
  onClose: (reload?: boolean) => void;
  error?: string;
};

const TrackSystemdUnitsForm: React.FC<TrackSystemdUnitsFormProps> = ({ onClose, error }) => {
  const { t } = useTranslation();
  const {
    values,
    setFieldValue,
    submitForm,
    isSubmitting,
    errors: formErrors,
  } = useFormikContext<SystemdUnitsFormValues>();
  const [currentText, setCurrentText] = React.useState<string>('');

  const onDeleteSystemdUnit = (deleteIndex: number) => {
    const newSystemdUnits = values.systemdUnits.filter((_, index) => deleteIndex !== index);
    void setFieldValue('systemdUnits', newSystemdUnits);
  };

  const onAdd = () => {
    if (currentText) {
      const newSystemdUnits = [...values.systemdUnits, { pattern: currentText, exists: false }];
      void setFieldValue('systemdUnits', newSystemdUnits);
      setCurrentText('');
    }
  };

  const onEdit = (editIndex: number, nextText: string) => {
    const newSystemdUnits = [...values.systemdUnits].map((systemdUnit, index) => {
      if (index === editIndex) {
        return { pattern: nextText, exists: false };
      }
      return systemdUnit;
    });
    void setFieldValue('systemdUnits', newSystemdUnits);
  };

  const textError = typeof formErrors.systemdUnits === 'string' ? formErrors.systemdUnits : undefined;
  return (
    <FlightCtlForm>
      <TextInput
        aria-label={t('Systemd service name')}
        placeholder="name.service"
        value={currentText}
        onBlur={onAdd}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') {
            onAdd();
          }
        }}
        onChange={(_ev, text) => {
          setCurrentText(text);
        }}
      />
      <LabelGroup numLabels={20} defaultIsOpen>
        {values.systemdUnits.map((systemdUnit, index) => {
          if (systemdUnit.exists) {
            return null;
          }
          return (
            <Label
              key={index}
              id={`${index}`}
              onClose={() => onDeleteSystemdUnit(index)}
              onEditCancel={(_, prevText) => onEdit(index, prevText)}
              onEditComplete={(_, newText) => onEdit(index, newText)}
              isEditable
            >
              {systemdUnit.pattern}
            </Label>
          );
        })}
      </LabelGroup>
      <ErrorHelperText error={textError} />
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button
          key="confirm"
          variant="primary"
          onClick={submitForm}
          isDisabled={isSubmitting || !!textError}
          isLoading={isSubmitting}
        >
          {t('Track services')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </FlightCtlForm>
  );
};

export default TrackSystemdUnitsForm;
