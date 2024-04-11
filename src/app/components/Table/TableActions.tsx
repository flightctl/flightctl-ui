import { MenuToggle, Select } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type TableActionsProps = {
  children: React.ReactNode;
};

const TableActions: React.FC<TableActionsProps> = ({ children }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const onToggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <Select
      isOpen={isOpen}
      onSelect={onToggle}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <MenuToggle ref={toggleRef} onClick={onToggle} id="actions" isExpanded={isOpen}>
          {t('Actions')}
        </MenuToggle>
      )}
    >
      {children}
    </Select>
  );
};

export default TableActions;
