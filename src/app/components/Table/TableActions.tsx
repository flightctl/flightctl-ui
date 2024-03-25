import { MenuToggle, Select } from '@patternfly/react-core';
import * as React from 'react';

type TableActionsProps = {
  children: React.ReactNode;
};

const TableActions: React.FC<TableActionsProps> = ({ children }) => {
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
          Actions
        </MenuToggle>
      )}
    >
      {children}
    </Select>
  );
};

export default TableActions;
