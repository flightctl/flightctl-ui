import * as React from 'react';

import { ApplicationsSummaryStatusType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getApplicationSummaryStatusItems } from '../../utils/status/applications';
import StatusDisplay from './StatusDisplay';

/**
 * Refers to the summary status of all applications in one device
 *
 * @param status the summary application status
 * @constructor
 */
const ApplicationSummaryStatus = ({ status }: { status?: ApplicationsSummaryStatusType }) => {
  const { t } = useTranslation();

  const statusItems = getApplicationSummaryStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });
  return <StatusDisplay item={item} />;
};
export default ApplicationSummaryStatus;
