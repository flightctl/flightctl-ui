export type RepositoryFormValues = {
  name: string;
  url: string;
  credentials: {
    isPublic: boolean;
    username?: string;
    password?: string;
  };
};
