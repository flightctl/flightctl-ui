import * as React from 'react';
import { Fleet } from '@flightctl/types';

import YamlEditor from '../../common/CodeEditor/YamlEditor';

// In the YAML editor, we must have the raw Fleet object, without extra details that are not part of the PATCH response.
// For that reason, we must remove the extra "devicesSummary" field that was added to the fleet details.
const FleetYaml = ({ fleet, refetch }: { fleet: Fleet; refetch: VoidFunction }) => {
  const fleetWithoutSummary = { ...fleet, status: { ...fleet.status, devicesSummary: undefined } } as Fleet;
  return <YamlEditor apiObj={fleetWithoutSummary} refetch={refetch} />;
};

export default FleetYaml;
