import * as React from 'react';
import { useField } from 'formik';
import { Button, Label, LabelGroup } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';

import { FlightCtlLabel } from '../../types/extraTypes';
import EditableLabelControl from '../common/EditableLabelControl';
import { useTranslation } from '../../hooks/useTranslation';
import ErrorHelperText, { DefaultHelperText } from './FieldHelperText';

type LabelsFieldProps = {
  name: string;
  isEditable?: boolean;
  addButtonText?: string;
  helperText?: React.ReactNode;
  onChangeCallback?: (newLabels: FlightCtlLabel[], hasErrors: boolean) => void;
};

const LabelsField: React.FC<LabelsFieldProps> = ({
  name,
  onChangeCallback,
  addButtonText,
  helperText,
  isEditable = true,
}) => {
  const [{ value: labels }, meta, { setValue: setLabels }] = useField<FlightCtlLabel[]>(name);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (labels && onChangeCallback) {
      onChangeCallback(labels, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLabels = async (newLabels: FlightCtlLabel[]) => {
    const errors = await setLabels(newLabels, true);
    const hasErrors = Object.keys(errors || {}).length > 0;

    onChangeCallback && onChangeCallback(newLabels, hasErrors);
  };

  const onDelete = async (_ev: React.MouseEvent<Element, MouseEvent>, index: number) => {
    if (!isEditable) {
      return;
    }
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    await updateLabels(newLabels);
  };

  const onAdd = async (text: string) => {
    const split = text.split('=');
    let newLabel: FlightCtlLabel;
    if (split.length === 2) {
      newLabel = { key: split[0], value: split[1] };
    } else {
      newLabel = { key: text || '', value: '' };
    }

    const newLabels = [...labels, newLabel];

    await updateLabels(newLabels);
  };

  const onEdit = async (index: number, nextText: string) => {
    const label = nextText.split('=');
    const newLabels = [...labels];
    newLabels.splice(index, 1, { key: label[0], value: label.length ? label[1] : undefined });

    await updateLabels(newLabels);
  };

  return (
    <>
      <LabelGroup
        numLabels={5}
        isEditable={isEditable}
        addLabelControl={
          <EditableLabelControl
            defaultLabel="key=value"
            addButtonText={addButtonText}
            onAddLabel={onAdd}
            isEditable={isEditable}
          />
        }
      >
        {labels.map(({ key, value }, index) => (
          <Label
            key={index}
            id={`${index}`}
            closeBtn={
              isEditable ? undefined : (
                <Button variant="plain" aria-label={t('Delete')} isDisabled icon={<TimesIcon />} />
              )
            }
            onClose={(e) => onDelete(e, index)}
            onEditCancel={(_, prevText) => onEdit(index, prevText)}
            onEditComplete={(_, newText) => onEdit(index, newText)}
            isEditable={isEditable}
          >
            {value ? `${key}=${value}` : key}
          </Label>
        ))}
      </LabelGroup>
      <DefaultHelperText helperText={helperText} />
      <ErrorHelperText meta={meta} touchRequired={false} />
    </>
  );
};

export default LabelsField;
