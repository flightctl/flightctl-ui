import * as React from 'react';
import { Dropdown, DropdownItem, MenuToggle } from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { DeviceDecommissionTargetType } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { getDisabledTooltipProps } from '../../utils/tooltip';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import DecommissionModal from '../modals/DecommissionModal/DecommissionModal';
import ResumeDevicesModal from '../modals/ResumeDevicesModal/ResumeDevicesModal';

type DeleteActionProps = {
  onDelete: () => Promise<unknown>;
  resourceType: string;
  resourceName: string;
  buttonLabel?: string;
  disabledReason?: string | boolean;
};

type DecommissionActionProps = {
  onDecommission: (target: DeviceDecommissionTargetType) => Promise<unknown>;
  disabledReason?: string;
};

type ResumeActionProps = {
  deviceId: string;
  alias?: string;
  disabledReason?: string;
  onResumeComplete?: () => void;
};

export const useDeleteAction = ({
  resourceType,
  resourceName,
  buttonLabel,
  onDelete,
  disabledReason,
}: DeleteActionProps) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const deleteAction = (
    <DropdownItem
      onClick={() => setIsDeleteModalOpen(true)}
      {...(disabledReason
        ? {
            isAriaDisabled: true,
            tooltipProps: {
              content: disabledReason,
            },
          }
        : undefined)}
    >
      {buttonLabel || t('Delete {{ resourceType }}', { resourceType })}
    </DropdownItem>
  );
  const deleteModal = isDeleteModalOpen && (
    <DeleteModal
      resourceType={resourceType}
      resourceName={resourceName}
      onClose={() => setIsDeleteModalOpen(false)}
      onDelete={onDelete}
    />
  );

  return { deleteAction, deleteModal };
};

export const useDecommissionAction = ({ onDecommission, disabledReason }: DecommissionActionProps) => {
  const { t } = useTranslation();
  const [isDecommissionModalOpen, setIsDecommissionModalOpen] = React.useState(false);
  const decommissionProps = getDisabledTooltipProps(disabledReason);
  const decommissionAction = (
    <DropdownItem onClick={() => setIsDecommissionModalOpen(true)} {...decommissionProps}>
      {t('Decommission device')}
    </DropdownItem>
  );
  const decommissionModal = isDecommissionModalOpen && (
    <DecommissionModal onClose={() => setIsDecommissionModalOpen(false)} onDecommission={onDecommission} />
  );

  return { decommissionAction, decommissionModal };
};

export const useResumeAction = ({ disabledReason, deviceId, alias, onResumeComplete }: ResumeActionProps) => {
  const { t } = useTranslation();
  const [isResumeModalOpen, setIsResumeModalOpen] = React.useState(false);
  const resumeProps = getDisabledTooltipProps(disabledReason);
  const deviceNameOrAlias = alias || deviceId;
  const resumeAction = (
    <DropdownItem onClick={() => setIsResumeModalOpen(true)} {...resumeProps}>
      {t('Resume device')}
    </DropdownItem>
  );

  const resumeSelector = {
    fieldSelector: `metadata.name=${deviceId}`,
  };
  const resumeModal = isResumeModalOpen && (
    <ResumeDevicesModal
      mode="device"
      title={
        <Trans t={t}>
          You are about to resume device <strong>{deviceNameOrAlias}</strong>
        </Trans>
      }
      selector={resumeSelector}
      expectedCount={1}
      onClose={(hasResumed) => {
        setIsResumeModalOpen(false);
        if (hasResumed) {
          onResumeComplete?.();
        }
      }}
    />
  );

  return { resumeAction, resumeModal };
};

const DetailsPageActions = ({ children }: React.PropsWithChildren) => {
  const { t } = useTranslation();
  const [actionsOpen, setActionsOpen] = React.useState(false);
  return (
    <Dropdown
      isOpen={actionsOpen}
      onSelect={() => setActionsOpen(false)}
      onOpenChange={(isOpen: boolean) => setActionsOpen(isOpen)}
      popperProps={{ position: 'left', preventOverflow: true }}
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          isExpanded={actionsOpen}
          onClick={() => setActionsOpen(!actionsOpen)}
          aria-label={t('Actions dropdown')}
          variant="primary"
        >
          {t('Actions')}
        </MenuToggle>
      )}
    >
      {children}
    </Dropdown>
  );
};

export default DetailsPageActions;
