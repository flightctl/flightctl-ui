import { RepositoryFormValues } from '../../Repository/CreateRepository/types';

export type ImportFleetRSFormValue = {
  exists: boolean;
  name: string;
  targetRevision: string;
  path: string;
};

export type ImportFleetFormValues = RepositoryFormValues & {
  useExistingRepo: boolean;
  existingRepo: string;
};
