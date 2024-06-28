import * as React from 'react';

import { ApplicationStatusType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getApplicationStatusItems } from '../../utils/status/applications';
import StatusDisplay from './StatusDisplay';

/**
 * Refers to the summary status of all applications in one device
 *
 * @param status the summary application status
 * @constructor
 */
const ApplicationStatus = ({ status }: { status?: ApplicationStatusType }) => {
  const { t } = useTranslation();

  const statusItems = getApplicationStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });
  return <StatusDisplay item={item} />;
};

export default ApplicationStatus;
