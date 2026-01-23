#!/usr/bin/env node
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const OpenAPI = require('openapi-typescript-codegen');
const YAML = require('js-yaml');

const { rimraf, copyDir, fixImagebuilderCoreReferences } = require('./openapi-utils');

const CORE_API = 'core';
const IMAGEBUILDER_API = 'imagebuilder';

const getSwaggerUrl = (api) => `https://raw.githubusercontent.com/flightctl/flightctl/main/api/${api}/v1beta1`;

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

// Generate types from OpenAPI spec
async function generateTypes(mode) {
  const config = {
    [CORE_API]: {
      swaggerUrl: `${getSwaggerUrl(CORE_API)}/openapi.yaml`,
      output: path.resolve(__dirname, '../tmp-types'),
      finalDir: path.resolve(__dirname, '../models'),
    },
    [IMAGEBUILDER_API]: {
      swaggerUrl: `${getSwaggerUrl(IMAGEBUILDER_API)}/openapi.yaml`,
      output: path.resolve(__dirname, '../tmp-imagebuilder-types'),
      finalDir: path.resolve(__dirname, '../imagebuilder/models'),
    },
  };

  if (!config[mode]) {
    throw new Error(`Unknown mode: ${mode}. Use 'core' or 'imagebuilder'`);
  }

  const { swaggerUrl, output, finalDir } = config[mode];

  console.log(`Fetching ${mode} OpenAPI spec from ${swaggerUrl}...`);
  const response = await fetch(swaggerUrl);
  const data = await response.text();

  console.log(`Generating ${mode} types...`);
  await OpenAPI.generate({
    input: processJsonAPI(data),
    output,
    exportCore: false,
    exportServices: false,
    exportModels: true,
    exportSchemas: false,
    indent: '2',
  });

  if (mode === CORE_API) {
    // Copy the flightctl API types to their final location
    await rimraf(finalDir);
    await copyDir(output, path.resolve(__dirname, '..'));
    await rimraf(output);
  } else {
    // Image builder types need to be fixed before they can be moved to their final location
    await rimraf(finalDir);
    const modelsDir = path.join(output, 'models');
    if (fs.existsSync(modelsDir)) {
      await copyDir(modelsDir, finalDir);
    }
    console.log(`Fixing references to core API types...`);
    await fixImagebuilderCoreReferences(finalDir);

    // Copy the generated index.ts to imagebuilder/index.ts
    const indexPath = path.join(output, 'index.ts');
    if (fs.existsSync(indexPath)) {
      const imagebuilderDir = path.resolve(__dirname, '../imagebuilder');
      if (!fs.existsSync(imagebuilderDir)) {
        fs.mkdirSync(imagebuilderDir, { recursive: true });
      }
      await fsPromises.copyFile(indexPath, path.join(imagebuilderDir, 'index.ts'));
    }
    await rimraf(output);
  }
}

async function main() {
  try {
    const rootDir = path.resolve(__dirname, '..');

    // Clean up existing directories
    console.log('Cleaning up existing directories...');
    await Promise.all([
      rimraf(path.join(rootDir, 'models')),
      rimraf(path.join(rootDir, 'imagebuilder')),
      rimraf(path.join(rootDir, 'tmp-types')),
      rimraf(path.join(rootDir, 'tmp-imagebuilder-types')),
    ]);

    console.log('Generating types...');
    await generateTypes(CORE_API);
    await generateTypes(IMAGEBUILDER_API);

    console.log('✅ Type generation complete!');
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

void main();
