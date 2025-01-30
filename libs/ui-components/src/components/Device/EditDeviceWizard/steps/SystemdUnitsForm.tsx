import * as React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { DeviceSpecConfigFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';

import ErrorHelperText from '../../../form/FieldHelperText';
import EditableLabelControl from '../../../common/EditableLabelControl';

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

export default SystemdUnitsForm;
