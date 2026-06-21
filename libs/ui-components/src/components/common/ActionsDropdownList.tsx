import * as React from 'react';
import { Divider, DropdownList } from '@patternfly/react-core';
import { IAction } from '@patternfly/react-table';

type ActionsDropdownListItemProps = {
  isDanger?: boolean;
};

/**
 * Transparent wrapper whose only purpose is to carry the `isDanger` prop.
 * The prop is never consumed here — `ActionsDropdownList` reads it via
 * `child.props.isDanger` to classify children into regular vs. danger groups.
 */
const ActionsDropdownListItem = ({ children }: React.PropsWithChildren<ActionsDropdownListItemProps>) => (
  <>{children}</>
);
ActionsDropdownListItem.displayName = 'ActionsDropdownListItem';

/**
 * Dropdown list that automatically inserts a divider between regular and danger actions.
 *
 * Children are classified by reference-equality check (`child.type === ActionsDropdownListItem`).
 * Wrap each action in `<ActionsDropdownList.Item>` and set `isDanger` on destructive ones.
 */
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
