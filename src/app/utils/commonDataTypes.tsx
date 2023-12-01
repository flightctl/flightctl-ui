//I want to export these types to other files, but I'm not sure how to do that.

export type enrollmentrequest = {
    metadata: {
      name: string;
      creationTimestamp: string | null;
      deletionTimestamp: string | null;
      labels: {
        [key: string]: string;
      }
    };
    spec: {
      deviceStatus: {
        systemInfo: {
          architecture: string | null;
          bootID: string | null;
          machineID: string | null;
          operatingSystem: string | null;
        };
      };
    };
    status: {
      conditions: [
        {
          lastTransitionTime: string | null;
          message: string | null;
          reason: string | null;
          status: string | null;
          type: string | null;
        }
      ]
    };
  };
export type enrollmentrequestList = {
    items: enrollmentrequest[];

};
