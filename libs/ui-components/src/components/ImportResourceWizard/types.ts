import { ResourceSyncType } from '@flightctl/types';

import { RepositoryFormValues } from '../Repository/CreateRepository/types';
import { Route } from '../../hooks/useNavigate';

export type ImportResourceFormValues = RepositoryFormValues & {
  useExistingRepo: boolean;
  existingRepo: string;
};

export type ImportResourceWizardProps = {
  resourceSyncType: ResourceSyncType;
  successRoute: Route;
  breadcrumb: { label: string; route: Route };
  title: string;
  resourceSyncDescription: string;
  reviewInfoText?: string;
};
