import { IAction } from '@patternfly/react-table';

export type DeleteListActionResult = {
  deleteAction: (params: { resourceId: string; resourceName?: string; disabledReason?: string }) => IAction;
  deleteModal: React.ReactNode;
};

export type DeleteListActionProps = {
  onDelete: (resourceId: string) => Promise<unknown>;
  resourceType: string;
};

export type DeleteListActionHook = (args: DeleteListActionProps) => DeleteListActionResult;
