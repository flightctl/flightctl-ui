import * as React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import { Device } from '@flightctl/types';
import TerminalPage from '../../Terminal/TerminalPage';
import StatusLabel, { StatusLabelColor } from '../../common/StatusLabel';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';

const DeviceTerminal = () => {
  const {
    router: { useParams },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  return (
    <TerminalPage
      id={deviceId}
      resourceLink={ROUTE.DEVICES}
      resourceTypeLabel="Terminal"
      error=""
    ></TerminalPage>
  );
};

export default DeviceTerminal;
