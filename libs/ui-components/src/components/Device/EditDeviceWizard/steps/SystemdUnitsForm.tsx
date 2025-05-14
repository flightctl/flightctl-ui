import * as React from 'react';
import { FormGroup, Label, LabelGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { DeviceSpecConfigFormValues } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';

import ErrorHelperText from '../../../form/FieldHelperText';
import EditableLabelControl from '../../../common/EditableLabelControl';
import LabelsView from '../../../common/LabelsView';

const SystemdUnitsForm = () => {
  const { t } = useTranslation();
  const { values, setFieldValue, errors } = useFormikContext<DeviceSpecConfigFormValues>();

  const onAdd = (text: string) => {
    if (text) {
      void setFieldValue(
        'systemdUnits',
        values.systemdUnits.concat({
          pattern: text,
          exists: false,
        }),
      );
    }
  };

  const onEdit = (editIndex: number, text: string) => {
    void setFieldValue(
      'systemdUnits',
      values.systemdUnits.map((systemdUnit, index) => {
        if (index === editIndex) {
          return { pattern: text, exists: systemdUnit.exists };
        } else {
          return systemdUnit;
        }
      }),
    );
  };

  const removeLabel = (removeIndex: number) => {
    void setFieldValue(
      'systemdUnits',
      values.systemdUnits.filter((_, index) => index !== removeIndex),
    );
  };

  const textError = typeof errors.systemdUnits === 'string' ? errors.systemdUnits : undefined;
  return (
    <>
      <LabelGroup
        isEditable
        addLabelControl={
          <EditableLabelControl
            defaultLabel="name.service"
            addButtonText={t('Add service')}
            onAddLabel={onAdd}
            isEditable
          />
        }
      >
        {values.systemdUnits.map((systemD, index) => (
          <Label
            key={`${systemD.pattern}-${index}`}
            isEditable
            onEditComplete={(_, newText) => onEdit(index, newText)}
            onClose={() => removeLabel(index)}
          >
            {systemD.pattern}
          </Label>
        ))}
      </LabelGroup>
      <ErrorHelperText error={textError} />
    </>
  );
};

const SystemdUnitsFormWrapper = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();
  const { t } = useTranslation();

  if (isReadOnly && values.systemdUnits.length === 0) {
    return null;
  }

  if (isReadOnly) {
    const labels: Record<string, string> = {};
    values.systemdUnits.forEach((systemdUnit) => {
      labels[systemdUnit.pattern] = '';
    });

    return (
      <FormGroup label={t('Tracked systemd services')}>
        <LabelsView prefix="systemdUnits" labels={labels} />
      </FormGroup>
    );
  }
  return (
    <FormGroup label={t('Tracked systemd services')}>
      <SystemdUnitsForm />
    </FormGroup>
  );
};

export default SystemdUnitsFormWrapper;
