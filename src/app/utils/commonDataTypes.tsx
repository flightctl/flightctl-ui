export type enrollmentrequest = {
  metadata: {
    name: string;
    creationTimestamp: string | null;
    deletionTimestamp: string | null;
    labels: [
      { [key: string]: string | null; }
    ]
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
export type device = {
  metadata: {
    name: string | null;
    creationTimestamp: string | null;
    deletionTimestamp: string | null;
    labels: {
      [key: string]: string;
    }
  };
  status: {
    conditions: {};
    systemInfo: {
      architecture: string | null;
      bootID: string | null;
      machineID: string | null;
      operatingSystem: string | null;
    };
  };
};
export type deviceList = {
  items: device[];

};