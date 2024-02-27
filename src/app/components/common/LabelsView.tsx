import * as React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

const LabelsView = ({ labels }: { labels: Record<string, string> | undefined }) => {
  const labelItems = Object.entries(labels || {});
  if (labelItems.length === 0) {
    return '-';
  }
  return (
    <LabelGroup numLabels={5}>
      {labelItems.map(([key, value], index: number) => (
        <Label key={index} id={`${index}`} color="blue">
          {value ? `${key}=${value}` : key}
        </Label>
      ))}
    </LabelGroup>
  );
};

export default LabelsView;
