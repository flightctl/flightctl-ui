import { RepositoryFormValues } from '../../Repository/CreateRepository/types';

export type ImportFleetFormValues = RepositoryFormValues & {
  useExistingRepo: boolean;
  existingRepo: string;
};
