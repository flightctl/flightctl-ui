import * as React from 'react';
import { Dropdown, DropdownItem, MenuToggle } from '@patternfly/react-core';

import DeleteModal from '../modals/DeleteModal/DeleteModal';
import { useTranslation } from 'react-i18next';

type DeleteActionProps = {
  onDelete: () => Promise<unknown>;
  resourceType: string;
  resourceName: string;
  disabledReason?: string | boolean;
};

export const useDeleteAction = ({ resourceType, resourceName, onDelete, disabledReason }: DeleteActionProps) => {
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
      {t('Delete')}
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
