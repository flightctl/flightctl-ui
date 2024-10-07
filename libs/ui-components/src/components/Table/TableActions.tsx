import * as React from 'react';
import { MenuToggle, Select } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

type TableActionsProps = {
  isDisabled: boolean;
};

const TableActions = ({ isDisabled, children }: React.PropsWithChildren<TableActionsProps>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const onToggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <Select
      isOpen={isOpen}
      onSelect={onToggle}
      aria-disabled={isDisabled}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <MenuToggle ref={toggleRef} onClick={onToggle} id="actions" isExpanded={isOpen} isDisabled={isDisabled}>
          {t('Actions')}
        </MenuToggle>
      )}
    >
      {children}
    </Select>
  );
};

export default TableActions;
