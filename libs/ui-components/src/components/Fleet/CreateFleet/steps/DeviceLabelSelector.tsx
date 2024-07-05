import * as React from 'react';
import { useField } from 'formik';
import { Spinner } from '@patternfly/react-core';
import { Trans } from 'react-i18next';
import debounce from 'lodash/debounce';

import { DeviceList } from '@flightctl/types';
import LabelsField from '../../../../components/form/LabelsField';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetch } from '../../../../hooks/useFetch';
import { FlightCtlLabel } from '../../../../types/extraTypes';
import { getApiListCount } from '../../../../utils/api';
import { getInvalidKubernetesLabels, hasUniqueLabelKeys } from '../../../form/validations';

const validateLabels = (labels: FlightCtlLabel[]) =>
  hasUniqueLabelKeys(labels) && getInvalidKubernetesLabels(labels).length === 0;

const DeviceLabelSelector = () => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const [{ value: labels }] = useField<FlightCtlLabel[]>('labels');

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [deviceCount, setDeviceCount] = React.useState<number>(0);

  const updateDeviceCount = async (matchLabels: FlightCtlLabel[]) => {
    const labelSelector = matchLabels.map((label) => {
      const valueStr = label.value ? `=${label.value}` : label.value;
      return `${label.key}${valueStr}`;
    }, '');

    try {
      const deviceListResp = await get<DeviceList>(`devices?labelSelector=${labelSelector.join(',')}&limit=1`);
      const num = getApiListCount(deviceListResp);
      setDeviceCount(num || 0);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateCount = React.useCallback(debounce(updateDeviceCount, 800), []);

  React.useEffect(() => {
    const hasLabels = labels.length > 0;
    // The error field is not set on time, we manually validate the labels
    // to make sure we only trigger requests when labels are valid
    const validLabels = validateLabels(labels);
    if (validLabels && hasLabels) {
      setIsLoading(true);
      void debouncedUpdateCount(labels);
    } else if (!hasLabels) {
      setDeviceCount(0);
    }
  }, [get, labels, debouncedUpdateCount]);

  const count = deviceCount;

  let helperText: React.ReactNode;
  if (isLoading) {
    helperText = (
      <>
        {t('Updating selected devices...')}
        <Spinner size="sm" />
      </>
    );
  } else if (labels.length > 0) {
    helperText = (
      <Trans count={count}>
        {/* @ts-expect-error Necessary syntax for count + strong */}
        <strong>{{ count }}</strong> devices selected.
      </Trans>
    );
  } else {
    helperText = t("Add at least one label to select this fleet's devices.");
  }

  return <LabelsField name="labels" helperText={helperText} />;
};

export default DeviceLabelSelector;
