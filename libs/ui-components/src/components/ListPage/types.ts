import * as React from 'react';
import { IAction } from '@patternfly/react-table';

export type ListAction = (params: { resourceId: string; resourceName?: string; disabledReason?: string }) => IAction;

export type ListActionResult = {
  action: ListAction;
  modal: React.ReactNode;
};

export type ListActionProps<T extends string, P> = {
  onConfirm: (resourceId: string, params?: P) => Promise<unknown>;
  resourceType: T;
};
