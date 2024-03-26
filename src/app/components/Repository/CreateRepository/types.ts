export type ResourceSyncFormValue = {
  name: string;
  targetRevision: string;
  path: string;
  exists?: boolean;
};

export type RepositoryFormValues = {
  name: string;
  url: string;
  credentials: {
    isPrivate: boolean;
    username?: string;
    password?: string;
  };
  useResourceSyncs: boolean;
  resourceSyncs: ResourceSyncFormValue[];
};
