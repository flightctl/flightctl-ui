import * as React from 'react';
import { useFormikContext } from 'formik';
import { Alert, Button, FormGroup } from '@patternfly/react-core';

import { EnrollmentRequest } from '@flightctl/types';
import RichValidationTextField from '../../form/RichValidationTextField';
import LabelsField from '../../form/LabelsField';
import { getLabelValueValidations } from '../../form/validations';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import FlightCtlForm from '../../form/FlightCtlForm';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useTranslation } from '../../../hooks/useTranslation';
import useDeviceLabelMatch from '../../../hooks/useDeviceLabelMatch';
import ResourceLink from '../../common/ResourceLink';
import DeviceLabelMatch from './DeviceLabelMatch';

export type ApproveDeviceFormValues = {
  labels: FlightCtlLabel[];
  deviceAlias: string;
};

export type ApproveDeviceFormProps = {
  enrollmentRequest: EnrollmentRequest;
  onClose: (refetch?: boolean) => void;
  error?: string;
  children?: React.ReactNode;
};

const ApproveDeviceForm: React.FC<ApproveDeviceFormProps> = ({ enrollmentRequest, onClose, error, children }) => {
  const { t } = useTranslation();
  const { submitForm, isSubmitting, errors: formErrors } = useFormikContext<ApproveDeviceFormValues>();

  const disableSubmit = Object.keys(formErrors).length > 0;
  const [matchLabelsOnChange, matchStatus] = useDeviceLabelMatch();
  const defaultAlias = enrollmentRequest.spec.labels?.alias;

  return (
    <FlightCtlForm>
      <RichValidationTextField
        fieldName="deviceAlias"
        aria-label={t('Alias')}
        validations={getLabelValueValidations(t)}
        isDisabled={!!defaultAlias}
      />
      <FormGroup label={t('Name')} aria-label={t('Name')}>
        <ResourceLink id={enrollmentRequest.metadata.name as string} variant="full" />
      </FormGroup>
      <FormGroup label={t('Labels')}>
        <LabelsField name="labels" onChangeCallback={matchLabelsOnChange} />
      </FormGroup>
      <FormGroup label={t('Fleet name')}>
        <DeviceLabelMatch matchStatus={matchStatus} />
      </FormGroup>
      {children}
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button
          key="confirm"
          variant="primary"
          onClick={submitForm}
          isDisabled={disableSubmit || isSubmitting}
          isLoading={isSubmitting}
        >
          {t('Approve')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </FlightCtlForm>
  );
};

export default ApproveDeviceForm;
