/*
  The @hey-api/openapi-ts generator produces the following type for DeviceSystemInfo:

  export type DeviceSystemInfo = {
    architecture: string;
    bootID: string;
    // ... other properties
    customInfo?: CustomDeviceInfo;
    [key: string]: string | CustomDeviceInfo | undefined;
  };

  This module fixes the schema by modifying the additionalProperties to be a Record<string, string>.

  export type DeviceSystemInfo = {
    [key: string]: string;
} & {
    // ... all named properties
    customInfo?: CustomDeviceInfo;
  };
*/
const fixDeviceSystemInfo = (json) => {
  const systemInfo = json.components.schemas.DeviceSystemInfo;
  if (!systemInfo) {
    throw new Error('DeviceSystemInfo schema not found, current transformation may no longer be needed');
  }

  const hasExpectedStructure =
    systemInfo.additionalProperties &&
    systemInfo.additionalProperties.type === 'string' &&
    systemInfo.properties &&
    systemInfo.properties.customInfo &&
    systemInfo.properties.customInfo.$ref === '#/components/schemas/CustomDeviceInfo';
  if (!hasExpectedStructure) {
    throw new Error('DeviceSystemInfo structure has changed, transformation logic needs to be reviewed.');
  }

  const originalProperties = systemInfo.properties;
  const originalRequired = systemInfo.required;
  const originalAdditionalProperties = systemInfo.additionalProperties;

  systemInfo.allOf = [
    {
      // Make the additionalProperties a Record<string, string> (not allowing them having CustomDeviceInfo values)
      type: 'object',
      additionalProperties: {
        type: 'string',
        description: originalAdditionalProperties.description,
      },
    },
    {
      // Add the original named properties
      type: 'object',
      properties: originalProperties,
      required: originalRequired,
      additionalProperties: false,
    },
  ];

  // Remove the original structure since we're using allOf
  delete systemInfo.properties;
  delete systemInfo.required;
  delete systemInfo.additionalProperties;

  console.log('✅ Fixing DeviceSystemInfo: prevent additionalProperties of type CustomDeviceInfo');
};

export default fixDeviceSystemInfo;
