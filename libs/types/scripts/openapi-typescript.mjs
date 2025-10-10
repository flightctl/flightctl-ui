#!/usr/bin/env node
import { createClient } from '@hey-api/openapi-ts';
import YAML from 'js-yaml';
import fixRolloutDeviceSelection from './fix-rollout-selection.mjs';
import fixDeviceSystemInfo from './fix-device-system-info.mjs';

const getConfig = (jsonSchema) => ({
  input: jsonSchema,
  output: {
    path: './tmp-types',
    indexFile: false,
  },
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: {
        mode: 'typescript',
        case: 'PascalCase',
      },
    },
  ],
});

/**
 * In some cases, we need to make adjustments to the OpenAPI schema before generating types.
 * This function transforms the problematic schema to the correct ones.
 */
const fixOpenApiSchema = (json) => {
  fixRolloutDeviceSelection(json);
  fixDeviceSystemInfo(json);
};

async function main() {
  const openApiYaml = await fetch(
    'https://raw.githubusercontent.com/flightctl/flightctl/main/api/v1alpha1/openapi.yaml',
  );
  const yamlString = await openApiYaml.text();

  const jsonSchema = YAML.load(yamlString);
  fixOpenApiSchema(jsonSchema);

  await createClient(getConfig(jsonSchema));
}

main();
