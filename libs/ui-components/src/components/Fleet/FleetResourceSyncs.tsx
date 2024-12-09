import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { ConditionType, ResourceSync, ResourceSyncList } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { getLastTransitionTime, getRepositorySyncStatus } from '../../utils/status/repository';

// Entries format: <rs0Name>@@<rs0LastSync>,<rs1Name>@@<rs1LastSync>,...
const RS_DISMISS_STORAGE_KEY = 'FC_DISMISS_SYNCS';

const RS_DISMISS_PARTS_SEPARATOR = '@@';

const getRsDismissKey = (rs: ResourceSync) => {
  if (rs.metadata.generation !== undefined) {
    return `${rs.metadata.name}${RS_DISMISS_PARTS_SEPARATOR}${rs.metadata.generation}`;
  }
  const lastTransition = getLastTransitionTime(rs.status?.conditions);
  return `${rs.metadata.name}${RS_DISMISS_PARTS_SEPARATOR}${lastTransition}`;
};

const isDismissed = (rs: ResourceSync) => {
  const dismissedValue = localStorage.getItem(RS_DISMISS_STORAGE_KEY);
  if (!dismissedValue) {
    return false;
  }
  const rsDismissKey = getRsDismissKey(rs);
  const dismissedEntries = dismissedValue.split(',');
  return dismissedEntries.includes(rsDismissKey);
};

const hasError = (rs: ResourceSync) => {
  const rsStatus = getRepositorySyncStatus(rs, (msg: string) => msg);
  return ['Not parsed', 'Not synced', 'Not accessible'].includes(rsStatus.status);
};

const isPending = (rs: ResourceSync) => {
  const rsStatus = getRepositorySyncStatus(rs, (msg: string) => msg);
  return rsStatus?.status !== ConditionType.ResourceSyncSynced;
};

const ResourceSyncInfoAlert = ({ rs }: { rs: ResourceSync }) => {
  const { t } = useTranslation();
  const name = rs.metadata.name as string;

  return (
    <Alert
      variant="info"
      title={
        <Trans t={t}>
          Importing fleets from <Link to={{ route: ROUTE.RESOURCE_SYNC_DETAILS, postfix: name }}>{name}</Link>. This
          might take a few minutes to complete.
        </Trans>
      }
      isInline
    />
  );
};

const ResourceSyncErrorAlert = ({ rs, refetch }: { rs: ResourceSync; refetch: VoidFunction }) => {
  const { t } = useTranslation();
  const name = rs.metadata.name as string;

  const dismissAlert = () => {
    const dismissedValue = localStorage.getItem(RS_DISMISS_STORAGE_KEY);
    const newDismissKey = getRsDismissKey(rs);
    if (dismissedValue) {
      const dismissedEntries = dismissedValue.split(',');
      let isNewEntry = true;
      const updatedEntries = dismissedEntries.map((entry) => {
        const entryParts = entry.split(RS_DISMISS_PARTS_SEPARATOR);
        const entryRsName = entryParts[0];
        if (entryRsName === name) {
          isNewEntry = false;
          // The old timestamp is now stale, we can replace the entry with the new timestamp
          return newDismissKey;
        } else {
          // Entries for other resource syncs are kept untouched
          return entry;
        }
      });
      if (isNewEntry) {
        updatedEntries.push(newDismissKey);
      }
      localStorage.setItem(RS_DISMISS_STORAGE_KEY, updatedEntries.join(','));
    } else {
      localStorage.setItem(RS_DISMISS_STORAGE_KEY, newDismissKey);
    }
    refetch();
  };
  return (
    <Alert
      variant="danger"
      title={t('Fleets import failed')}
      isInline
      actionClose={<AlertActionCloseButton onClose={dismissAlert} />}
    >
      <Trans t={t}>
        Importing fleets from <Link to={{ route: ROUTE.RESOURCE_SYNC_DETAILS, postfix: name }}>{name}</Link> failed.
        Check the resource sync for more details.
      </Trans>
    </Alert>
  );
};

const getVisibleResourceSyncs = (rsList: ResourceSync[]) => {
  const pendingRs: ResourceSync[] = [];
  const errorRs: ResourceSync[] = [];

  rsList.forEach((rs) => {
    if (isDismissed(rs)) {
      return;
    }
    if (hasError(rs)) {
      errorRs.push(rs);
    } else if (isPending(rs)) {
      pendingRs.push(rs);
    }
  });
  return { pendingRs, errorRs };
};

const FleetResourceSyncs = () => {
  const [rsList, , , rsRefetch] = useFetchPeriodically<ResourceSyncList>({
    endpoint: 'resourcesyncs',
  });

  // TODO Remove the client-side filtering once the API filter is available
  const { pendingRs, errorRs } = React.useMemo(() => getVisibleResourceSyncs(rsList?.items || []), [rsList]);

  if (pendingRs.length === 0 && errorRs.length === 0) {
    return null;
  }
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        {errorRs.map((rs) => {
          return (
            <StackItem key={rs.metadata.name as string}>
              <ResourceSyncInfoAlert rs={rs} />
            </StackItem>
          );
        })}
        {pendingRs.map((rs) => {
          return (
            <StackItem key={rs.metadata.name as string}>
              <ResourceSyncErrorAlert rs={rs} refetch={rsRefetch} />
            </StackItem>
          );
        })}
      </Stack>
    </PageSection>
  );
};

export default FleetResourceSyncs;
