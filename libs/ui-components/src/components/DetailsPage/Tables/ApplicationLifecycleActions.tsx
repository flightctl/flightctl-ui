import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { TerminalIcon } from '@patternfly/react-icons/dist/js/icons/terminal-icon';
import { useApplicationLifecycle } from '../../../hooks/useApplicationLifecycle';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import {
  type ApplicationLifecycleAction,
  hasAplicationStatusMismatch,
  startableStatuses,
  transitionalStatuses,
} from '../../../utils/applicationLifecycle';
import {
  AppType,
  ApplicationDesiredState,
  ApplicationStatusType,
  type DeviceApplicationStatus,
} from '@flightctl/types';
import { getApplicationStatusItems } from '../../../utils/status/applications';

const ApplicationReconcileInProgressAlert = ({ isStopping }: { isStopping: boolean }) => {
  const { t } = useTranslation();
  let title: string;
  let msg: string;

  if (isStopping) {
    title = t('Application is stopping');
    msg = t('The agent is stopping this application. Actions are disabled until the transition completes.');
  } else {
    title = t('Application is starting');
    msg = t('The agent is starting this application. Actions are disabled until the transition completes.');
  }
  return (
    <Alert variant="info" title={title}>
      {msg}
    </Alert>
  );
};

const ApplicationStatusMismatchAlert = ({
  statusLabel,
  desiredStateIsStopped,
}: {
  statusLabel: string;
  desiredStateIsStopped: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Alert variant="warning" title={t('Application status mismatch')}>
      {t(
        'Desired state is "{{ desiredState }}" but the reported status is "{{ reportedStatus }}". The agent has not yet picked up the change. Actions are disabled until the status is reconciled.',
        {
          desiredState: desiredStateIsStopped ? t('Stopped') : t('Running'),
          reportedStatus: statusLabel,
        },
      )}
    </Alert>
  );
};

type ApplicationLifecycleActionsProps = {
  deviceName: string;
  refetch: VoidFunction;
  lifecycleDisabledReason?: string;
  desiredState?: ApplicationDesiredState;
  appStatus: DeviceApplicationStatus;
  canManageLifecycle: boolean;
  onOpenConsole?: (name: string) => void;
};

const ApplicationLifecycleActions = ({
  deviceName,
  refetch,
  lifecycleDisabledReason,
  desiredState,
  appStatus: appStatusObj,
  canManageLifecycle,
  onOpenConsole,
}: ApplicationLifecycleActionsProps) => {
  const { t } = useTranslation();
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const appStatus = appStatusObj.status;
  const isVm = appStatusObj.appType === AppType.AppTypeVm;

  const { start, stop, restart, isSubmitting, pendingAction, error, clearError } = useApplicationLifecycle({
    deviceName,
    appName: appStatusObj.name,
    appStatus,
    appRestarts: appStatusObj.restarts,
    refetch,
  });

  const isAppRunning = appStatus === ApplicationStatusType.ApplicationStatusRunning;
  const desiredStateIsStopped = desiredState === ApplicationDesiredState.ApplicationDesiredStateStopped;
  const canStart = startableStatuses.includes(appStatus);
  const isTransitioning = transitionalStatuses.includes(appStatus);
  const hasStatusMismatch = hasAplicationStatusMismatch(appStatus, desiredState);
  const isUserInitiatedTransition = pendingAction != null;
  const isExternallyTransitioning = isTransitioning && !isUserInitiatedTransition && !hasStatusMismatch;
  const isActionsDisabled =
    !!lifecycleDisabledReason ||
    isSubmitting ||
    isUserInitiatedTransition ||
    hasStatusMismatch ||
    isExternallyTransitioning;
  const toggleDisabledProps = getDisabledTooltipProps(lifecycleDisabledReason);

  const handleAction = (action: ApplicationLifecycleAction) => {
    setActionsOpen(false);
    if (action === 'start') {
      void start();
    } else if (action === 'stop') {
      void stop();
    } else {
      void restart();
    }
  };

  const showLifecycleActions = canManageLifecycle;
  const showConsole = isVm && !!onOpenConsole;

  if (!showLifecycleActions && !showConsole) {
    return null;
  }

  const statusLabel = getApplicationStatusItems(t).find((item) => item.id === appStatus)?.label ?? appStatus;
  const actionsDropdown = showLifecycleActions ? (
    <Dropdown
      isOpen={actionsOpen}
      onOpenChange={setActionsOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="secondary"
          size="sm"
          onClick={() => setActionsOpen(!actionsOpen)}
          isExpanded={actionsOpen}
          isDisabled={isActionsDisabled}
          {...toggleDisabledProps}
        >
          {isUserInitiatedTransition && isTransitioning ? `${statusLabel}…` : t('Actions')}
        </MenuToggle>
      )}
    >
      <DropdownList>
        {canStart && (
          <DropdownItem component="button" onClick={() => handleAction('start')}>
            {t('Start')}
          </DropdownItem>
        )}
        {isAppRunning && (
          <DropdownItem component="button" onClick={() => handleAction('stop')}>
            {t('Stop')}
          </DropdownItem>
        )}
        {isAppRunning && (
          <DropdownItem component="button" onClick={() => handleAction('restart')}>
            {t('Restart')}
          </DropdownItem>
        )}
      </DropdownList>
    </Dropdown>
  ) : null;

  const hasActionBar = showLifecycleActions || showConsole;

  return (
    <Stack hasGutter>
      {hasActionBar && (
        <StackItem>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            {actionsDropdown && <FlexItem>{actionsDropdown}</FlexItem>}
            {showConsole && (
              <FlexItem>
                <Button
                  variant={ButtonVariant.link}
                  icon={<TerminalIcon />}
                  isDisabled={!isAppRunning}
                  onClick={() => onOpenConsole?.(appStatusObj.name)}
                >
                  {t('Open console')}
                </Button>
              </FlexItem>
            )}
          </Flex>
        </StackItem>
      )}

      {showLifecycleActions && hasStatusMismatch && (
        <StackItem>
          <ApplicationStatusMismatchAlert statusLabel={statusLabel} desiredStateIsStopped={desiredStateIsStopped} />
        </StackItem>
      )}
      {showLifecycleActions && isExternallyTransitioning && !pendingAction && (
        <StackItem>
          <ApplicationReconcileInProgressAlert isStopping={desiredStateIsStopped} />
        </StackItem>
      )}

      {showLifecycleActions && error && (
        <StackItem>
          <Alert
            isInline
            variant="danger"
            title={t('An error occurred')}
            isPlain
            actionClose={<AlertActionCloseButton onClose={clearError} />}
          >
            {error}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ApplicationLifecycleActions;
