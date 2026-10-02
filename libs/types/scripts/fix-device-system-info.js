#!/usr/bin/env node
/**
 * openapi-typescript-codegen collapses DeviceSystemInfo (named properties +
 * additionalProperties) into Record<string, string>, dropping typed fields.
 *
 * After codegen, DeviceSystemInfo.ts is rewritten to match the current schema:
 * named properties keep their types, and additional keys are string | undefined.
 *
 * If the schema changes, the script will fail to prevent types drifting from the schema.
 */
const fs = require('fs/promises');
const path = require('path');
const YAML = require('js-yaml');

const DEVICE_SYSTEM_INFO_PATH = path.resolve(__dirname, '../models/DeviceSystemInfo.ts');
const SCHEMA_NAME = 'DeviceSystemInfo';
const TS_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const LOCAL_SCHEMA_REF = /^#\/components\/schemas\/([A-Za-z_$][A-Za-z0-9_$]*)$/;

function sanitizeDescription(description) {
  if (typeof description !== 'string' || description.trim() === '') {
    return undefined;
  }
  return description
    .replace(/\*\//g, '* /')
    .replace(/\/\*/g, '/ *')
    .replace(/\r\n|\r|\n/g, ' ');
}

function refToTypeName(ref, localSchemas) {
  if (typeof ref !== 'string') {
    throw new Error(`Invalid $ref: ${JSON.stringify(ref)}`);
  }
  const match = LOCAL_SCHEMA_REF.exec(ref);
  if (!match) {
    throw new Error(
      `Unsupported $ref for DeviceSystemInfo property: ${ref}. Only local #/components/schemas/<Name> references are supported.`,
    );
  }
  const name = match[1];
  if (!(name in localSchemas)) {
    throw new Error(
      `$ref ${ref} does not resolve to a local schema in components.schemas; cannot generate import from './${name}'.`,
    );
  }
  return name;
}

const UNSUPPORTED_PROP_KEYWORDS = ['nullable', 'enum'];
const UNSUPPORTED_ADDITIONAL_PROP_KEYWORDS = UNSUPPORTED_PROP_KEYWORDS.concat(['$ref']);

function assertNoUnsupportedValueConstraints(propertiesSchema) {
  for (const keyword of UNSUPPORTED_PROP_KEYWORDS) {
    if (propertiesSchema[keyword] !== undefined) {
      throw new Error(
        `DeviceSystemInfo property uses unsupported keyword "${keyword}" (${JSON.stringify(propertiesSchema[keyword])}). Update fix-device-system-info.js if the schema intentionally changed.`,
      );
    }
  }
}

function openApiPropertyToTsType(propertySchema, localSchemas) {
  if (!propertySchema || typeof propertySchema !== 'object') {
    throw new Error(`Invalid property schema: ${JSON.stringify(propertySchema)}`);
  }
  assertNoUnsupportedValueConstraints(propertySchema);

  if (propertySchema.$ref) {
    const importName = refToTypeName(propertySchema.$ref, localSchemas);
    return { tsType: importName, importName };
  }

  switch (propertySchema.type) {
    case 'string':
      return { tsType: 'string' };
    case 'boolean':
      return { tsType: 'boolean' };
    case 'integer':
    case 'number':
      return { tsType: 'number' };
    default:
      throw new Error(
        `Unsupported DeviceSystemInfo property type ${JSON.stringify(propertySchema.type)}; update fix-device-system-info.js`,
      );
  }
}

/**
 * Ensure the received schema for "additionalProperties"  is as expected by the generator.
 * - must be an object with a "type" property of "string"
 * - must not use any keywords that would change the emitted index-signature type
 * - description / other metadata may change
 */
function assertStringAdditionalProperties(additionalProperties) {
  if (
    additionalProperties === undefined ||
    typeof additionalProperties === 'boolean' ||
    typeof additionalProperties !== 'object' ||
    Array.isArray(additionalProperties)
  ) {
    throw new Error(
      `DeviceSystemInfo.additionalProperties has unexpected shape ${JSON.stringify(additionalProperties)}; expected { type: "string" }.`,
    );
  }

  for (const keyword of UNSUPPORTED_ADDITIONAL_PROP_KEYWORDS) {
    if (additionalProperties[keyword] !== undefined) {
      throw new Error(
        `DeviceSystemInfo.additionalProperties uses unsupported keyword "${keyword}" (${JSON.stringify(additionalProperties[keyword])}). Update fix-device-system-info.js if the schema intentionally changed'`,
      );
    }
  }

  if (additionalProperties.type !== 'string') {
    throw new Error(
      `DeviceSystemInfo.additionalProperties.type is ${JSON.stringify(additionalProperties.type)}; expected "string". Update fix-device-system-info.js if the schema intentionally changed.`,
    );
  }
}

function extractDeviceSystemInfo(openApiDocument) {
  const localSchemas = openApiDocument?.components?.schemas;
  if (!localSchemas || typeof localSchemas !== 'object' || Array.isArray(localSchemas)) {
    throw new Error('OpenAPI document is missing components.schemas');
  }
  const schema = localSchemas[SCHEMA_NAME];
  if (!schema) {
    throw new Error('DeviceSystemInfo schema not found in OpenAPI document');
  }
  if (schema.type !== 'object') {
    throw new Error(`DeviceSystemInfo.type is ${JSON.stringify(schema.type)}; expected "object"`);
  }
  if (!schema.properties || typeof schema.properties !== 'object') {
    throw new Error('DeviceSystemInfo.properties is missing or invalid');
  }

  assertStringAdditionalProperties(schema.additionalProperties);

  if (schema.required !== undefined && !Array.isArray(schema.required)) {
    throw new Error(
      `DeviceSystemInfo.required has unexpected shape ${JSON.stringify(schema.required)}; expected an array of property names.`,
    );
  }
  const requiredNames = schema.required ?? [];
  for (const name of requiredNames) {
    if (typeof name !== 'string' || !(name in schema.properties)) {
      throw new Error(
        `DeviceSystemInfo.required includes ${JSON.stringify(name)}, which is not a named property; it would only appear via the index signature.`,
      );
    }
  }
  const required = new Set(requiredNames);
  const properties = [];
  const imports = new Set();

  for (const [name, propertySchema] of Object.entries(schema.properties)) {
    if (!TS_IDENTIFIER.test(name)) {
      throw new Error(`Invalid DeviceSystemInfo property name: ${JSON.stringify(name)}`);
    }
    const { tsType, importName } = openApiPropertyToTsType(propertySchema, localSchemas);
    if (importName) {
      imports.add(importName);
    }
    properties.push({
      name,
      tsType,
      required: required.has(name),
      description: sanitizeDescription(propertySchema.description),
    });
  }

  return {
    description: sanitizeDescription(schema.description) || 'System information collected from the device.',
    properties,
    imports: [...imports].sort(),
  };
}

function buildDeviceSystemInfoSource({ description, properties, imports }) {
  const importBlock =
    imports.length === 0 ? '' : `${imports.map((name) => `import type { ${name} } from './${name}';`).join('\n')}\n`;

  const namedProps = properties
    .map((prop) => {
      const lines = [];
      if (prop.description) {
        lines.push(`  /**`);
        lines.push(`   * ${prop.description}`);
        lines.push(`   */`);
      }
      lines.push(`  ${prop.name}${prop.required ? '' : '?'}: ${prop.tsType};`);
      return lines.join('\n');
    })
    .join('\n');

  return `/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
${importBlock}/**
 * ${description}
 */
export type DeviceSystemInfo = {
${namedProps}
} & {
  /**
   * Corrected by fix-device-system-info.js:
   * Keep named properties with their defined schema types, and define additional properties as strings.
   */
  [key: string]: string | undefined;
};
`;
}

function parseOpenApiInput(input) {
  if (typeof input === 'string') {
    return YAML.load(input, { schema: YAML.JSON_SCHEMA });
  }
  return input;
}

async function fixDeviceSystemInfo(input, outputPath = DEVICE_SYSTEM_INFO_PATH) {
  const extracted = extractDeviceSystemInfo(parseOpenApiInput(input));
  const source = buildDeviceSystemInfoSource(extracted);
  await fs.writeFile(outputPath, source, 'utf8');
  return extracted;
}

module.exports = {
  assertStringAdditionalProperties,
  buildDeviceSystemInfoSource,
  extractDeviceSystemInfo,
  fixDeviceSystemInfo,
};

if (require.main === module) {
  const fsSync = require('fs');

  async function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3] || DEVICE_SYSTEM_INFO_PATH;

    if (!inputPath) {
      console.error('Usage: node fix-device-system-info.js <openapi.yaml> [output.ts]');
      process.exit(1);
    }

    const input = fsSync.readFileSync(inputPath, 'utf8');
    const extracted = await fixDeviceSystemInfo(input, outputPath);
    console.log(
      `✅ Wrote DeviceSystemInfo (${extracted.properties.length} named properties + string additionalProperties) to ${outputPath}`,
    );
  }

  main().catch((error) => {
    console.error('❌ Error fixing DeviceSystemInfo:', error.message);
    process.exit(1);
  });
}
