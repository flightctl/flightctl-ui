#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const YAML = require('js-yaml');

const CONDITION_TYPE_PATH = path.resolve(__dirname, '../models/ConditionType.ts');
const DEFAULT_DESCRIPTION = 'Type of condition in CamelCase.';
const TS_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function validateMemberName(name, index) {
  if (typeof name !== 'string' || !TS_IDENTIFIER.test(name)) {
    throw new Error(`Invalid x-enum-varnames entry at index ${index}: ${JSON.stringify(name)}`);
  }
}

function validateUniqueMemberNames(names) {
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) {
      throw new Error(`Duplicate x-enum-varnames entry: ${name}`);
    }
    seen.add(name);
  }
}

function validateEnumValue(value, index) {
  if (typeof value !== 'string') {
    throw new Error(`Invalid enum value at index ${index}: expected string, got ${typeof value}`);
  }
}

function sanitizeDescription(description) {
  if (typeof description !== 'string' || description.trim() === '') {
    return DEFAULT_DESCRIPTION;
  }

  return description
    .replace(/\*\//g, '* /')
    .replace(/\/\*/g, '/ *')
    .replace(/\r\n|\r|\n/g, ' ');
}

function buildConditionTypeSource({ description, varnames, enumValues }) {
  if (varnames.length !== enumValues.length) {
    throw new Error(
      `ConditionType x-enum-varnames (${varnames.length}) and enum (${enumValues.length}) lengths differ`,
    );
  }

  varnames.forEach(validateMemberName);
  validateUniqueMemberNames(varnames);
  enumValues.forEach(validateEnumValue);

  const members = varnames
    .map((name, index) => `  ${name} = ${JSON.stringify(enumValues[index])},`)
    .join('\n');

  return `/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ${sanitizeDescription(description)}
 */
export enum ConditionType {
${members}
}
`;
}

function extractConditionType(openApiDocument) {
  const schema = openApiDocument?.components?.schemas?.ConditionType;
  if (!schema) {
    throw new Error('ConditionType schema not found in OpenAPI document');
  }

  const varnames = schema['x-enum-varnames'];
  const enumValues = schema.enum;

  if (!Array.isArray(varnames) || varnames.length === 0) {
    throw new Error('ConditionType is missing x-enum-varnames');
  }
  if (!Array.isArray(enumValues) || enumValues.length === 0) {
    throw new Error('ConditionType is missing enum values');
  }

  return {
    description: schema.description || DEFAULT_DESCRIPTION,
    varnames,
    enumValues,
  };
}

function parseOpenApiInput(input) {
  if (typeof input === 'string') {
    return YAML.load(input);
  }
  return input;
}

async function fixConditionType(input, outputPath = CONDITION_TYPE_PATH) {
  const conditionType = extractConditionType(parseOpenApiInput(input));
  const source = buildConditionTypeSource(conditionType);
  await fs.writeFile(outputPath, source, 'utf8');
  return conditionType;
}

module.exports = {
  buildConditionTypeSource,
  extractConditionType,
  fixConditionType,
};

if (require.main === module) {
  const fsSync = require('fs');

  async function main() {
    const inputPath = process.argv[2];
    const outputPath = process.argv[3] || CONDITION_TYPE_PATH;

    if (!inputPath) {
      console.error('Usage: node fix-condition-type.js <openapi.yaml> [output.ts]');
      process.exit(1);
    }

    const input = fsSync.readFileSync(inputPath, 'utf8');
    const conditionType = await fixConditionType(input, outputPath);
    console.log(`✅ Wrote ${conditionType.varnames.length} ConditionType entries to ${outputPath}`);
  }

  main().catch((error) => {
    console.error('❌ Error fixing ConditionType:', error.message);
    process.exit(1);
  });
}
