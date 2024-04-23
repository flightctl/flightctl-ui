export type ImportFleetRSFormValue = {
  exists: boolean;
  name: string;
  targetRevision: string;
  path: string;
};

export type ImportFleetFormValues = {
  useExistingRepo: boolean;
  existingRepo: string;
  name: string;
  url: string;
  credentials: {
    isPrivate: boolean;
    username?: string;
    password?: string;
  };
  resourceSyncs: ImportFleetRSFormValue[];
};
