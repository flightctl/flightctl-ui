import * as React from 'react';
import {
  Alert,
  Button,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  Radio,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';
import { Formik, useFormikContext } from 'formik';
import { DeviceList, DeviceResumeRequest, DeviceResumeResponse, Fleet } from '@flightctl/types';

import { FlightCtlLabel } from '../../../../types/extraTypes';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetch } from '../../../../hooks/useFetch';
import LabelsField from '../../../form/LabelsField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { createMassResumeValidationSchema } from '../../../form/validations';
import { getErrorMessage } from '../../../../utils/error';
import { commonQueries } from '../../../../utils/query';
import { getApiListCount } from '../../../../utils/api';
import { fromAPILabel, labelToExactApiMatchString } from '../../../../utils/labels';
import { useFleets } from '../../../Fleet/useFleets';

// Adds an artificial delay to make sure that the user notices the count is refreshing.
// This is specially needed when users switch between modes, and the selection for the new mode is already valid.
const showSpinnerBriefly = () => new Promise((resolve) => setTimeout(resolve, 450));

type SelectionMode = 'fleet' | 'labels' | 'all';

type MassResumeFormValues = {
  mode: SelectionMode;
  fleetId: string;
  labels: FlightCtlLabel[];
};

interface MassResumeDevicesModalProps {
  onClose: (hasResumed?: boolean) => void;
}

const SelectionMode = {
  FLEET: 'fleet',
  LABELS: 'labels',
  ALL: 'all',
} as const;

const getSelectedFleetLabels = (fleets: Fleet[], fleetId: string) => {
  const selectedFleet = fleets.find((fleet) => fleet.metadata.name === fleetId);
  if (!selectedFleet) {
    throw new Error('Selected fleet not found');
  }
  return fromAPILabel(selectedFleet.spec.selector?.matchLabels || {});
};

const MassResumeDevicesModalContent = ({ onClose }: MassResumeDevicesModalProps) => {
  const { t } = useTranslation();
  const { get, post } = useFetch();
  const { values, setFieldValue, isValid, dirty } = useFormikContext<MassResumeFormValues>();

  const { fleets, isLoading: fleetsLoading } = useFleets({});
  const [isFleetListOpen, setIsFleetSelectOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | undefined>(undefined);

  // Resume result state
  const [resumedCount, setResumedCount] = React.useState<number | undefined>(undefined);

  // Device count state
  const [deviceCountNum, setDeviceCountNum] = React.useState<number>(0);
  const [isCountLoading, setIsCountLoading] = React.useState(false);
  const [countError, setCountError] = React.useState<string | null>(null);

  const hasResumedAtLeastOne = Boolean(resumedCount !== undefined && resumedCount > 0);
  const hasResumedAllExpected =
    values.mode === SelectionMode.ALL ? hasResumedAtLeastOne : deviceCountNum > 0 && resumedCount === deviceCountNum;
  const isSubmitEnabled =
    (values.mode === SelectionMode.ALL || deviceCountNum > 0) &&
    !isSubmitting &&
    !isCountLoading &&
    isValid &&
    resumedCount === undefined;
  const deviceCount = deviceCountNum.toString();

  const loadMatchingDevicesCount = React.useCallback(
    async (criteria: { fleetId?: string; labels?: FlightCtlLabel[] }) => {
      setIsCountLoading(true);
      setCountError(null);
      setDeviceCountNum(0);

      try {
        const fleetLabels = criteria.fleetId ? getSelectedFleetLabels(fleets, criteria.fleetId) : criteria.labels || [];
        if (fleetLabels.length === 0) {
          throw new Error('Invalid criteria: must provide either fleetId or labels');
        }

        const deviceResult = await get<DeviceList>(commonQueries.getSuspendedDeviceCountByLabels(fleetLabels));
        await showSpinnerBriefly();
        setDeviceCountNum(getApiListCount(deviceResult) || 0);
      } catch (error) {
        await showSpinnerBriefly();
        setCountError(t('Failed to obtain the number of matching devices'));
      } finally {
        setIsCountLoading(false);
      }
    },
    [get, t, fleets],
  );

  const handleResume = async () => {
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      let labels: FlightCtlLabel[];

      if (values.mode === SelectionMode.ALL) {
        // Currently the API will resume all ConflictPaused devices by sending an empty labelSelector
        // TODO: The API should have an explicit way to resume all suspended devices
        labels = [];
      } else if (values.mode === SelectionMode.FLEET) {
        labels = getSelectedFleetLabels(fleets, values.fleetId);
      } else {
        labels = values.labels;
      }

      const resumeRequest: DeviceResumeRequest = {
        labelSelector: labels.map((label) => labelToExactApiMatchString(label)).join(','),
      };

      const resumeResponse = await post<DeviceResumeRequest, DeviceResumeResponse>(
        'deviceactions/resume',
        resumeRequest,
      );
      setResumedCount(resumeResponse.resumedDevices || 0);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectionModeChanged = (mode: SelectionMode) => {
    setFieldValue('mode', mode);

    if (mode === SelectionMode.FLEET && values.fleetId) {
      // If switching to a mode that already had a valid selection, we refresh the count
      loadMatchingDevicesCount({ fleetId: values.fleetId });
    } else if (mode === SelectionMode.LABELS && values.labels.length > 0) {
      loadMatchingDevicesCount({ labels: values.labels });
    } else {
      // Clear the count if there isn't a valid selection, and also in "all" mode
      setDeviceCountNum(0);
      setCountError(null);
      setIsCountLoading(false);
    }
  };

  const handleFleetSelected = (fleetId: string) => {
    setFieldValue('fleetId', fleetId);
    setIsFleetSelectOpen(false);

    if (fleetId) {
      loadMatchingDevicesCount({ fleetId });
    } else {
      setDeviceCountNum(0);
      setCountError(null);
    }
  };

  const handleLabelsChanged = (newLabels: FlightCtlLabel[], hasErrors: boolean) => {
    if (hasErrors || newLabels.length === 0) {
      setDeviceCountNum(0);
      setCountError(null);
      return;
    } else if (newLabels.length > 0) {
      loadMatchingDevicesCount({ labels: newLabels });
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t('Resume devices')}
      isOpen
      onClose={() => onClose(hasResumedAtLeastOne)}
      actions={[
        <Button
          key="resume"
          variant="primary"
          onClick={handleResume}
          isLoading={isSubmitting}
          isDisabled={!isSubmitEnabled}
        >
          {t('Resume selection')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => onClose(hasResumedAtLeastOne)} isDisabled={isSubmitting}>
          {hasResumedAtLeastOne ? t('Close') : t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <FlightCtlForm>
          <StackItem>
            <TextContent>
              <Text>
                {t(
                  "Following a system restore, devices have been identified with configurations newer than the server's records. To prevent data loss, they have been suspended from receiving updates.",
                )}
              </Text>
            </TextContent>
          </StackItem>
          <StackItem>
            <TextContent>
              <Text>{t('Choose the criteria to select the devices to resume')}:</Text>
            </TextContent>
          </StackItem>

          <StackItem>
            <FormGroup isRequired fieldId="selection-mode">
              <Radio
                label={t('Fleet')}
                id="selectionModeFleet"
                name="selectionMode"
                isChecked={values.mode === SelectionMode.FLEET}
                onChange={() => {
                  handleSelectionModeChanged(SelectionMode.FLEET);
                }}
                description={t('Resume all suspended devices associated with a given fleet')}
              />
              <Radio
                label={t('Labels')}
                id="selectionModeLabels"
                name="selectionMode"
                isChecked={values.mode === SelectionMode.LABELS}
                onChange={() => {
                  handleSelectionModeChanged(SelectionMode.LABELS);
                }}
                description={t('Resume all suspended devices matching the specified labels')}
              />
              <Radio
                label={t('All suspended devices')}
                id="selectionModeAll"
                name="selectionMode"
                isChecked={values.mode === SelectionMode.ALL}
                onChange={() => {
                  handleSelectionModeChanged(SelectionMode.ALL);
                }}
                description={t('Resume all suspended devices')}
              />
            </FormGroup>
          </StackItem>

          {values.mode === SelectionMode.FLEET && (
            <StackItem>
              <FormGroup label={t('Fleet')} isRequired fieldId="fleetId">
                <Select
                  id="fleetSelection"
                  isOpen={isFleetListOpen}
                  selected={values.fleetId}
                  onSelect={(_, selection) => handleFleetSelected(selection as string)}
                  onOpenChange={(isOpen) => setIsFleetSelectOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsFleetSelectOpen(!isFleetListOpen)}
                      isExpanded={isFleetListOpen}
                      isDisabled={fleetsLoading}
                      style={{ width: '100%' }}
                    >
                      {values.fleetId || t('Select a fleet')}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <SelectList>
                    {fleets.map((fleet) => {
                      const fleetId = fleet.metadata.name || '';
                      const deviceSelectorStr = Object.entries(fleet.spec?.selector?.matchLabels || {})
                        .map(([key, value]) => (value ? `${key}=${value}` : key))
                        .join(',');

                      let description = '';
                      if (deviceSelectorStr) {
                        description = `${t('Device selector labels')}: ${deviceSelectorStr}`;
                      } else {
                        description = t('This fleet does not select any devices');
                      }

                      return (
                        <SelectOption
                          key={fleetId}
                          value={fleetId}
                          description={description}
                          isDisabled={!deviceSelectorStr}
                        >
                          {fleetId}
                        </SelectOption>
                      );
                    })}
                  </SelectList>
                </Select>
              </FormGroup>
            </StackItem>
          )}

          {values.mode === SelectionMode.LABELS && (
            <StackItem>
              <FormGroup label={t('Device labels')} fieldId="labelsSelection" isRequired>
                <LabelsField name="labels" onChangeCallback={handleLabelsChanged} />
              </FormGroup>
            </StackItem>
          )}
        </FlightCtlForm>

        {isValid && dirty && values.mode !== SelectionMode.ALL && (
          <StackItem>
            {isCountLoading ? (
              <Alert variant="info" isInline title={t('Refreshing device count')}>
                <Spinner size="md" className="pf-v5-u-mr-sm" />
                {t('Checking how many suspended devices match your criteria...')}
              </Alert>
            ) : countError ? (
              <Alert variant="warning" isInline title={t('Unable to refresh device count')}>
                {countError}
              </Alert>
            ) : deviceCountNum > 0 ? (
              <Alert variant="success" isInline title={t('Devices found')}>
                {values.mode === SelectionMode.FLEET ? (
                  <Trans t={t}>
                    <strong>{deviceCount}</strong> suspended devices are currently associated with fleet{' '}
                    <strong>{values.fleetId}</strong>.
                  </Trans>
                ) : (
                  <Trans t={t}>
                    <strong>{deviceCount}</strong> suspended devices match the specified labels.
                  </Trans>
                )}
              </Alert>
            ) : (
              <Alert variant="warning" isInline title={t('No devices found')}>
                {values.mode === SelectionMode.FLEET ? (
                  <Trans t={t}>
                    No suspended devices are associated with fleet <strong>{values.fleetId}</strong>.
                  </Trans>
                ) : (
                  t('No suspended devices match the specified labels.')
                )}
              </Alert>
            )}
          </StackItem>
        )}

        {submitError && (
          <StackItem>
            <Alert isInline variant="danger" title={t('Resume devices failed')}>
              {submitError}
            </Alert>
          </StackItem>
        )}

        {/* Display an alert for "all" mode before the user resumes all devices */}
        {resumedCount === undefined && values.mode === SelectionMode.ALL && (
          <StackItem>
            <Alert variant="warning" isInline title={t('Resume all devices')}>
              {t(
                'You are about to resume all suspended devices. This action is irreversible and will allow all affected devices to receive new configuration updates from the server.',
              )}
            </Alert>
          </StackItem>
        )}

        {resumedCount !== undefined && hasResumedAllExpected && (
          <StackItem>
            <Alert isInline variant="success" title={t('Resume successful')}>
              {t('{{ resumedCount }} devices were resumed', { resumedCount })}
            </Alert>
          </StackItem>
        )}

        {resumedCount !== undefined && !hasResumedAllExpected && (
          <StackItem>
            <Alert isInline variant="warning" title={t('Resumed with warnings')}>
              {t('{{ expectedCount }} devices to resume, and {{ resumedCount }} resumed successfully', {
                deviceCountNum,
                resumedCount,
              })}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

const MassResumeDevicesModal = ({ onClose }: MassResumeDevicesModalProps) => {
  const { t } = useTranslation();

  return (
    <Formik<MassResumeFormValues>
      initialValues={{
        mode: SelectionMode.FLEET,
        fleetId: '',
        labels: [],
      }}
      validationSchema={createMassResumeValidationSchema(t)}
      onSubmit={() => {
        // This will be handled by the inner component
      }}
    >
      <MassResumeDevicesModalContent onClose={onClose} />
    </Formik>
  );
};

export default MassResumeDevicesModal;
