import * as React from 'react';
import { Divider, DropdownList } from '@patternfly/react-core';
import { IAction } from '@patternfly/react-table';

type ActionsDropdownListItemProps = {
  isDanger?: boolean;
};

const ActionsDropdownListItem = ({ children }: React.PropsWithChildren<ActionsDropdownListItemProps>) => (
  <>{children}</>
);
ActionsDropdownListItem.displayName = 'ActionsDropdownListItem';

const ActionsDropdownList = ({ children }: React.PropsWithChildren) => {
  const actions: React.ReactNode[] = [];
  const dangerActions: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!child) {
      return;
    }
    if (React.isValidElement<ActionsDropdownListItemProps>(child) && child.type === ActionsDropdownListItem) {
      if (child.props.isDanger) {
        dangerActions.push(child);
      } else {
        actions.push(child);
      }
      return;
    }
    actions.push(child);
  });

  const showDivider = actions.length > 0 && dangerActions.length > 0;

  return (
    <DropdownList>
      {actions}
      {showDivider && <Divider component="li" />}
      {dangerActions}
    </DropdownList>
  );
};

ActionsDropdownList.Item = ActionsDropdownListItem;

export const buildAllDropdownActions = (actions: IAction[], dangerActions: IAction[]): IAction[] => {
  if (actions.length === 0) {
    return dangerActions;
  }
  if (dangerActions.length === 0) {
    return actions;
  }
  return [...actions, { isSeparator: true } as IAction, ...dangerActions];
};

export default ActionsDropdownList;
