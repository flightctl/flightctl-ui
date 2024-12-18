import * as React from 'react';
import { Dropdown, DropdownItem, MenuToggle } from '@patternfly/react-core';

import { DeviceDecommission } from '@flightctl/types';

import { getDisabledTooltipProps } from '../../utils/tooltip';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import { useTranslation } from '../../hooks/useTranslation';
import DecommissionModal from '../modals/DecommissionModal/DecommissionModal';

type DeleteActionProps = {
  onDelete: () => Promise<unknown>;
  resourceType: string;
  resourceName: string;
  disabledReason?: string;
};

type DecommissionActionProps = {
  onConfirm: (target: DeviceDecommission.decommissionTarget) => Promise<unknown>;
  disabledReason?: string;
};

export const useDecommissionAction = ({ onConfirm, disabledReason }: DecommissionActionProps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const decommissionProps = getDisabledTooltipProps(disabledReason);
  const decommissionAction = (
    <DropdownItem onClick={() => setIsModalOpen(true)} {...decommissionProps}>
      {t('Decommission device')}
    </DropdownItem>
  );
  const decommissionModal = isModalOpen && (
    <DecommissionModal onClose={() => setIsModalOpen(false)} onDecommission={onConfirm} />
  );

  return { decommissionAction, decommissionModal };
};

export const useDeleteAction = ({ resourceType, resourceName, onDelete, disabledReason }: DeleteActionProps) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const deleteProps = getDisabledTooltipProps(disabledReason);
  const deleteAction = (
    <DropdownItem onClick={() => setIsDeleteModalOpen(true)} {...deleteProps}>
      {t('Delete {{ resourceType }}', { resourceType })}
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

type DetailsPageActionsProps = {
  children: React.ReactNode;
};

const DetailsPageActions: React.FC<DetailsPageActionsProps> = ({ children }) => {
  const { t } = useTranslation();
  const [actionsOpen, setActionsOpen] = React.useState(false);
  return (
    <Dropdown
      isOpen={actionsOpen}
      onSelect={() => setActionsOpen(false)}
      popperProps={{ position: 'left', preventOverflow: true }}
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
