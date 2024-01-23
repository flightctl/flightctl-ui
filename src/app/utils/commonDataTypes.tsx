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
    online: string;
    conditions: {};
    systemInfo: {
      architecture?: string;
      bootID?: string;
      machineID?: string;
      operatingSystem?: string;
    };
  };
};
export type deviceList = {
  items: device[];

};