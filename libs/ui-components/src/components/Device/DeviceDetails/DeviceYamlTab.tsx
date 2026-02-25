import React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import { showSpinnerBriefly } from '../../../utils/time';
import { useTranslation } from '../../../hooks/useTranslation';

const YAML_TAB_REFETCH_DELAY_MS = 500;

const DeviceYamlTab = ({
  device,
  refetch,
  editDisabledReason,
  canEdit,
}: {
  device: Required<Device>;
  refetch: VoidFunction;
  editDisabledReason?: string;
  canEdit: boolean;
}) => {
  const { t } = useTranslation();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // We want the YAML editor to open with the latest device version from the beginning.
    // We add a delay that should be enough for refetch to have finished
    const updateDevice = async () => {
      refetch();
      setReady(false);
      await showSpinnerBriefly(YAML_TAB_REFETCH_DELAY_MS);
      setReady(true);
    };
    void updateDevice();
  }, [refetch]);

  if (!ready) {
    return (
      <Bullseye>
        <Spinner size="lg" aria-label={t('Refreshing device')} />
      </Bullseye>
    );
  }

  return <YamlEditor apiObj={device} refetch={refetch} disabledEditReason={editDisabledReason} canEdit={canEdit} />;
};

export default DeviceYamlTab;
