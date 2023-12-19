export type enrollmentrequest = {
  metadata: {
    name: string;
    creationTimestamp: string | null;
    deletionTimestamp: string | null;
    labels:{ 
      [key: string]: string | null; 
    }
  };
  spec: {};
  status: {
    conditions: {};
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
      [key: string]: string | null;
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