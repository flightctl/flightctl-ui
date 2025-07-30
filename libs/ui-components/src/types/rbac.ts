export enum VERB {
  CREATE = 'create',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  PATCH = 'patch',
  POST = 'post',
  UPDATE = 'update',
}

export enum RESOURCE {
  FLEET = 'fleets',
  DEVICE = 'devices',
  DEVICE_CONSOLE = 'devices/console',
  DEVICE_DECOMMISSION = 'devices/decommission',
  REPOSITORY = 'repositories',
  RESOURCE_SYNC = 'resourcesyncs',
  ENROLLMENT_REQUEST = 'enrollmentrequests',
  ENROLLMENT_REQUEST_APPROVAL = 'enrollmentrequests/approval',
  ALERTS = 'alerts',
}
