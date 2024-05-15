import * as React from 'react';
import { Alert, Button, Form, Label, LabelGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { useTranslation } from '../../../hooks/useTranslation';
import EditableLabelControl from '../../common/EditableLabelControl';

export type MatchPatternsFormValues = {
  matchPatterns: string[];
};

export type MatchPatternsFormProps = {
  onClose: (reload?: boolean) => void;
  error?: string;
};

const MatchPatternsForm: React.FC<MatchPatternsFormProps> = ({ onClose, error }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<MatchPatternsFormValues>();

  const onPatternClose = (e: React.MouseEvent<Element, MouseEvent>, index: number) => {
    const newMatchPatterns = [...values.matchPatterns];
    newMatchPatterns.splice(index, 1);
    void setFieldValue('matchPatterns', newMatchPatterns);
  };

  const onAdd = (text: string) => {
    const newMatchPatterns = [...values.matchPatterns, text];
    void setFieldValue('matchPatterns', newMatchPatterns);
  };

  const onEdit = (index: number, nextText: string) => {
    const newMatchPatterns = [...values.matchPatterns];
    newMatchPatterns.splice(index, 1, nextText);
    void setFieldValue('matchPatterns', newMatchPatterns);
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <LabelGroup
        isEditable
        addLabelControl={
          <EditableLabelControl defaultLabel="pattern\\*" addButtonText={t('Add match pattern')} onAddLabel={onAdd} />
        }
        numLabels={20}
        defaultIsOpen
      >
        {values.matchPatterns.map((pattern, index) => (
          <Label
            key={index}
            id={`${index}`}
            color="blue"
            onClose={(e) => onPatternClose(e, index)}
            onEditCancel={(_, prevText) => onEdit(index, prevText)}
            onEditComplete={(_, newText) => onEdit(index, newText)}
            isEditable
          >
            {pattern}
          </Label>
        ))}
      </LabelGroup>
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button key="confirm" variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
          {t('Update match patterns')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

export default MatchPatternsForm;
