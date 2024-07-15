import * as React from 'react';
import { useFormikContext } from 'formik';

import { Alert, Button, Form, FormGroup, Icon, Spinner } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { EnrollmentRequest, Fleet, FleetList } from '@flightctl/types';
import RichValidationTextField from '../../form/RichValidationTextField';
import LabelsField from '../../form/LabelsField';
import { getLabelValueValidations } from '../../form/validations';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import ResourceLink from '../../common/ResourceLink';

import './ApproveDevideForm.css';

export type ApproveDeviceFormValues = {
  labels: FlightCtlLabel[];
  displayName: string;
};

export type ApproveDeviceFormProps = {
  enrollmentRequest: EnrollmentRequest;
  onClose: (refetch?: boolean) => void;
  error?: string;
  children?: React.ReactNode;
};

type DeviceMatchStatus = {
  status: 'unchecked' | 'checking' | 'checked--unique' | 'checked--multiple' | 'checked--empty';
  fleetName?: string;
};

const findMatchingFleets = (fleets: Fleet[], deviceLabels: FlightCtlLabel[]) => {
  return fleets.filter((fleet) => {
    const fleetMatch = fleet.spec.selector?.matchLabels || {};
    return Object.entries(fleetMatch).every(([fleetMatchKey, fleetMatchValue]) => {
      const matchingDeviceLabel = deviceLabels.find((dLabel) => dLabel.key === fleetMatchKey);
      return matchingDeviceLabel && (matchingDeviceLabel.value || '') === (fleetMatchValue || '');
    });
  });
};

const FleetLabelMatchResult = ({ matchStatus }: { matchStatus: DeviceMatchStatus }) => {
  const { t } = useTranslation();

  let icon: React.ReactNode;
  let text: string = '';
  let isPlaceholder = false;

  switch (matchStatus.status) {
    case 'unchecked':
      isPlaceholder = true;
      text = t('Add labels to select a fleet');
      break;
    case 'checking':
      icon = <Spinner size="sm" />;
      break;
    case 'checked--empty':
      icon = icon = (
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      );
      text = t('No fleet is matching the selected labels');
      break;
    case 'checked--multiple':
      icon = (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      );
      text = t(
        "More than one fleet is matching the selected labels. The device will ignore the fleets' configurations",
      );
      break;
    case 'checked--unique':
      text = matchStatus.fleetName || '';
      break;
  }

  return (
    <div className="fctl_approve-device__fleetname">
      {icon && <span className="fctl_approve-device__fleetname__icon">{icon}</span>}
      <span className={isPlaceholder ? 'fctl_approve-device__fleetname__placeholder' : ''}>{text}</span>
    </div>
  );
};

const ApproveDeviceForm: React.FC<ApproveDeviceFormProps> = ({ enrollmentRequest, onClose, error, children }) => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const { submitForm, isSubmitting, errors: formErrors } = useFormikContext<ApproveDeviceFormValues>();
  const [matchStatus, setMatchStatus] = React.useState<DeviceMatchStatus>({
    status: 'unchecked',
    fleetName: '',
  });

  const disableSubmit = Object.keys(formErrors).length > 0;
  const isLoading = isSubmitting || matchStatus.status === 'checking';

  const onChangeLabels = React.useCallback(
    (newLabels: FlightCtlLabel[]) => {
      const updateMatchStatus = async () => {
        if (newLabels.length > 0) {
          setMatchStatus({ status: 'checking' });

          // TODO PoC implementation, we're missing the ability of filtering in the "fleets" endpoint.
          const allFleets = await get<FleetList>('fleets');
          const matchFleets = findMatchingFleets(allFleets.items ?? [], newLabels);
          const matchCount = matchFleets?.length || 0;
          switch (matchCount) {
            case 0:
              setMatchStatus({ status: 'checked--empty' });
              break;
            case 1:
              setMatchStatus({ status: 'checked--unique', fleetName: matchFleets[0].metadata.name });
              break;
            default:
              setMatchStatus({ status: 'checked--multiple' });
              break;
          }
        } else {
          setMatchStatus({ status: 'unchecked' });
        }
      };
      void updateMatchStatus();
    },
    [get],
  );

  return (
    <Form onSubmit={(ev) => ev.preventDefault()}>
      <RichValidationTextField
        fieldName="displayName"
        aria-label={t('Device name')}
        validations={getLabelValueValidations(t)}
      />
      {enrollmentRequest && (
        <FormGroup label={t('Fingerprint')} aria-label={t('Fingerprint')}>
          <ResourceLink id={enrollmentRequest.metadata.name as string} variant="full" />
        </FormGroup>
      )}
      <FormGroup label={t('Labels')}>
        <LabelsField name="labels" onChangeCallback={onChangeLabels} />
      </FormGroup>
      <FormGroup label={t('Fleet name')}>
        <FleetLabelMatchResult matchStatus={matchStatus} />
      </FormGroup>
      {children}
      {error && <Alert isInline title={error} variant="danger" />}
      <FlightCtlActionGroup>
        <Button
          key="confirm"
          variant="primary"
          onClick={submitForm}
          isDisabled={disableSubmit || isLoading}
          isLoading={isLoading}
        >
          {t('Approve')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isLoading}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

export default ApproveDeviceForm;
