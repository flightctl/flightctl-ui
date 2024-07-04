import * as React from 'react';

import { useTranslation } from '../../hooks/useTranslation';
import { StatusLevel } from '../../utils/status/common';
import { StatusDisplayContent } from './StatusDisplay';

const SystemdStatus = ({ status }: { status: string | undefined }) => {
  let level: StatusLevel;
  const { t } = useTranslation();

  switch (status) {
    case 'running':
      level = 'success';
      break;
    default:
      level = 'unknown';
      break;
  }
  return <StatusDisplayContent level={level} label={status || t('Unknown')} />;
};

export default SystemdStatus;
