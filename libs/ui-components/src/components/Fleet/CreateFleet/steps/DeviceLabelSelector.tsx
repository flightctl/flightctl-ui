import * as React from 'react';
import { useField } from 'formik';
import { Alert, Button, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { RedoIcon } from '@patternfly/react-icons/dist/js/icons/redo-icon';
import debounce from 'lodash/debounce';

import { DeviceList } from '@flightctl/types';
import LabelsField from '../../../form/LabelsField';
import { getInvalidKubernetesLabels, hasUniqueLabelKeys } from '../../../form/validations';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetch } from '../../../../hooks/useFetch';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import { getApiListCount } from '../../../../utils/api';
import { getErrorMessage } from '../../../../utils/error';
import { commonQueries } from '../../../../utils/query';
import LabelsView from '../../../common/LabelsView';
import { toAPILabel } from '../../../../utils/labels';

const validateLabels = (labels: FlightCtlLabel[]) =>
  hasUniqueLabelKeys(labels) && getInvalidKubernetesLabels(labels).length === 0;

const DeviceLabelSelector = () => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const [{ value: labels }] = useField<FlightCtlLabel[]>('labels');

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [deviceCountError, setDeviceCountError] = React.useState<string>();
  const [deviceCount, setDeviceCount] = React.useState<number>(0);

  const updateDeviceCount = async (matchLabels: FlightCtlLabel[]) => {
    try {
      const deviceListResp = await get<DeviceList>(
        commonQueries.getDevicesWithExactLabelMatching(matchLabels, { limit: 1 }),
      );
      const num = getApiListCount(deviceListResp);
      setDeviceCount(num || 0);
    } catch (e) {
      setDeviceCountError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateCount = React.useCallback(debounce(updateDeviceCount, 800), []);

  const reloadDeviceSelection = React.useCallback(
    (labels: FlightCtlLabel[]) => {
      const hasLabels = labels.length > 0;

      // The error field is not set on time, we manually validate the labels
      // to make sure we only trigger requests when labels are valid
      const validLabels = validateLabels(labels);
      if (validLabels && hasLabels) {
        setIsLoading(true);
        setDeviceCountError(undefined);
        void debouncedUpdateCount(labels);
      } else if (!hasLabels) {
        setDeviceCount(0);
      }
    },
    [debouncedUpdateCount],
  );

  React.useEffect(() => {
    reloadDeviceSelection(labels);
  }, [labels, reloadDeviceSelection]);

  let message: React.ReactNode;
  let showHelperText = true;
  if (isLoading) {
    message = <Spinner size="sm" />;
  } else if (deviceCountError) {
    showHelperText = false;
    message = (
      <Alert isInline variant="danger" title={t('Failed to determine the number of selected devices')}>
        {deviceCountError}
        <Button
          variant="link"
          icon={<RedoIcon />}
          onClick={() => {
            reloadDeviceSelection(labels);
          }}
        >
          {t('Try again')}
        </Button>
      </Alert>
    );
  } else if (labels.length > 0) {
    showHelperText = false;
    message = (
      <Alert
        isInline
        variant={deviceCount === 0 ? 'warning' : 'info'}
        title={t('{{ count }} devices matching the labels were selected.', { count: deviceCount })}
      />
    );
  } else {
    message = t('Labels used to select devices for your fleet. If not specified, no devices will be added.');
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <LabelsField name="labels" helperText={showHelperText ? message : undefined} />
      </StackItem>
      {!showHelperText && message && <StackItem>{message}</StackItem>}
    </Stack>
  );
};

const DeviceLabelSelectorWrapper = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const [{ value: labels }] = useField<FlightCtlLabel[]>('labels');

  if (isReadOnly) {
    return <LabelsView prefix="device-selector" labels={toAPILabel(labels)} />;
  }
  return <DeviceLabelSelector />;
};

export default DeviceLabelSelectorWrapper;
