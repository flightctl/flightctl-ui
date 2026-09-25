#!/usr/bin/env node
/**
 * openapi-typescript-codegen collapses DeviceSystemInfo (named properties +
 * additionalProperties) into Record<string, string>, dropping typed fields.
 *
 * After codegen, rewrite DeviceSystemInfo.ts from the OpenAPI schema:
 * named properties keep their types, and additional keys are string | undefined.
 *
 * Fails if additionalProperties is missing or is no longer `{ type: string }`,
 * so schema drift is not silently ignored.
 *
 * The type is modeled as `Named & { [key: string]: string | undefined }` so
 * extra keys are strings. (TypeScript cannot put a string-only index signature
 * on the same object type as boolean / $ref named fields; intersection keeps
 * accurate read types for both named and additional keys.)
 */
const fs = require('fs/promises');
const path = require('path');
const YAML = require('js-yaml');

const DEVICE_SYSTEM_INFO_PATH = path.resolve(__dirname, '../models/DeviceSystemInfo.ts');
const SCHEMA_NAME = 'DeviceSystemInfo';
const TS_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function sanitizeDescription(description) {
  if (typeof description !== 'string' || description.trim() === '') {
    return undefined;
  }
  return description
    .replace(/\*\//g, '* /')
    .replace(/\/\*/g, '/ *')
    .replace(/\r\n|\r|\n/g, ' ');
}

function refToTypeName(ref) {
  if (typeof ref !== 'string') {
    throw new Error(`Invalid $ref: ${JSON.stringify(ref)}`);
  }
  const name = ref.split('/').pop();
  if (!name || !TS_IDENTIFIER.test(name)) {
    throw new Error(`Unsupported $ref for DeviceSystemInfo property: ${ref}`);
  }
  return name;
}

function openApiPropToTsType(propSchema) {
  if (!propSchema || typeof propSchema !== 'object') {
    throw new Error(`Invalid property schema: ${JSON.stringify(propSchema)}`);
  }
  if (propSchema.$ref) {
    return { tsType: refToTypeName(propSchema.$ref), importName: refToTypeName(propSchema.$ref) };
  }
  switch (propSchema.type) {
    case 'string':
      return { tsType: 'string' };
    case 'boolean':
      return { tsType: 'boolean' };
    case 'integer':
    case 'number':
      return { tsType: 'number' };
    default:
      throw new Error(
        `Unsupported DeviceSystemInfo property type ${JSON.stringify(propSchema.type)}; update fix-device-system-info.js`,
      );
  }
}

/**
 * additionalProperties must remain string-valued map entries.
 * Description / other metadata may change; type must stay "string".
 */
function assertStringAdditionalProperties(additionalProperties) {
  if (additionalProperties === undefined) {
    throw new Error(
      'DeviceSystemInfo.additionalProperties is missing; expected { type: "string" }. Update fix-device-system-info.js if the schema intentionally changed.',
    );
  }
  if (additionalProperties === true || additionalProperties === false) {
    throw new Error(
      `DeviceSystemInfo.additionalProperties is ${additionalProperties}; expected { type: "string" }. Update fix-device-system-info.js if the schema intentionally changed.`,
    );
  }
  if (typeof additionalProperties !== 'object' || Array.isArray(additionalProperties)) {
    throw new Error(
      `DeviceSystemInfo.additionalProperties has unexpected shape ${JSON.stringify(additionalProperties)}; expected { type: "string" }.`,
    );
  }
  if (additionalProperties.$ref) {
    throw new Error(
      `DeviceSystemInfo.additionalProperties uses $ref (${additionalProperties.$ref}); expected { type: "string" }. Update fix-device-system-info.js if the schema intentionally changed.`,
    );
  }
  if (additionalProperties.type !== 'string') {
    throw new Error(
      `DeviceSystemInfo.additionalProperties.type is ${JSON.stringify(additionalProperties.type)}; expected "string". Update fix-device-system-info.js if the schema intentionally changed.`,
    );
  }
}

function extractDeviceSystemInfo(openApiDocument) {
  const schema = openApiDocument?.components?.schemas?.[SCHEMA_NAME];
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

  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  const properties = [];
  const imports = new Set();

  for (const [name, propSchema] of Object.entries(schema.properties)) {
    if (!TS_IDENTIFIER.test(name)) {
      throw new Error(`Invalid DeviceSystemInfo property name: ${JSON.stringify(name)}`);
    }
    const { tsType, importName } = openApiPropToTsType(propSchema);
    if (importName) {
      imports.add(importName);
    }
    properties.push({
      name,
      tsType,
      required: required.has(name),
      description: sanitizeDescription(propSchema.description),
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
