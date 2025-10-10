/*
  The @hey-api/openapi-ts generator produces the following type for RolloutDeviceSelection:

  export type RolloutDeviceSelection = {
    strategy: 'BatchSequence';
} & BatchSequence;
 
  This module fixes the schema by replacing the problematic oneOf with a simple $ref to BatchSequence.
  So effectively the generated type will be:

  export type RolloutDeviceSelection = BatchSequence;
 */
const fixRolloutDeviceSelection = (json) => {
  const rolloutDeviceSelection = json.components.schemas.RolloutDeviceSelection;

  if (!json.components.schemas.RolloutDeviceSelection || !json.components.schemas.BatchSequence) {
    throw new Error(
      'RolloutDeviceSelection or BatchSequence schemas not found, current transformation may no longer be needed',
    );
  }

  const hasExpectedSignature =
    rolloutDeviceSelection.discriminator &&
    rolloutDeviceSelection.discriminator.propertyName === 'strategy' &&
    rolloutDeviceSelection.discriminator.mapping['BatchSequence'] === '#/components/schemas/BatchSequence';
  if (!hasExpectedSignature) {
    throw new Error('RolloutDeviceSelection structure has changed, transformation logic needs to be reviewed.');
  }

  delete json.components.schemas.RolloutDeviceSelection.discriminator;
  console.log('✅ Fixing RolloutDeviceSelection: removed problematic discriminator');
};
export default fixRolloutDeviceSelection;
