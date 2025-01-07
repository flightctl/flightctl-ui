export enum VERB {
  CREATE = 'create',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  PATCH = 'patch',
  POST = 'post',
}

export enum RESOURCE {
  FLEET = 'fleets',
  DEVICE = 'devices',
  DEVICE_CONSOLE = 'devices/console',
  REPOSITORY = 'repositories',
  RESOURCE_SYNC = 'resourcesyncs',
  ENROLLMENT_REQUEST = 'enrollmentrequests',
  ENROLLMENT_REQUEST_APPROVAL = 'enrollmentrequests/approval',
}
