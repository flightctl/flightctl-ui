import React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';

import { SystemdUnitFormValue } from '../../../../types/deviceSpec';

export type SystemdUnitsFormValues = {
  systemdUnits: SystemdUnitFormValue[];
};

const ReviewTrackedSystemdServices = ({ systemdUnits }: SystemdUnitsFormValues) => {
  if (systemdUnits.length === 0) {
    return '-';
  }

  return (
    <LabelGroup>
      {systemdUnits.map((systemD, index) => (
        <Label key={`${systemD.pattern}_${index}`}>{systemD.pattern}</Label>
      ))}
    </LabelGroup>
  );
};

export default ReviewTrackedSystemdServices;
