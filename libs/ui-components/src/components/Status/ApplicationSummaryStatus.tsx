import * as React from 'react';

import { type ApplicationsSummaryStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getApplicationSummaryStatusItems } from '../../utils/status/applications';
import StatusDisplay from './StatusDisplay';

/**
 * Refers to the summary status of all applications in one device
 *
 * @param status the summary application status
 * @constructor
 */
const ApplicationSummaryStatus = ({ statusSummary }: { statusSummary?: ApplicationsSummaryStatus }) => {
  const { t } = useTranslation();

  const statusItems = getApplicationSummaryStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === statusSummary?.status;
  });
  return <StatusDisplay item={item} message={statusSummary?.info} />;
};
export default ApplicationSummaryStatus;
