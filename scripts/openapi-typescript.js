#!/usr/bin/env node
const path = require('path');
const OpenAPI = require('openapi-typescript-codegen');
const YAML = require('js-yaml');

const processJsonAPI = (jsonString) => {
  const json = YAML.load(jsonString);
  if (json.components) {
    Object.keys(json.components.schemas).forEach((key) => {
      const schema = json.components.schemas[key];
      if (schema && typeof schema.type === 'undefined') {
        schema.type = 'object';
      }
    });
  }
  return json;
};

async function main() {
  const swaggerUrl = 'https://raw.githubusercontent.com/flightctl/flightctl/main/api/v1alpha1/openapi.yaml';
  const output = path.resolve(__dirname, '../@types');
  const response = await fetch(swaggerUrl);
  const data = await response.text();

  OpenAPI.generate({
    input: processJsonAPI(data),
    output,
    exportCore: false,
    exportServices: false,
    exportModels: true,
    exportSchemas: false,
    indent: '2',
  });
}

void main();
