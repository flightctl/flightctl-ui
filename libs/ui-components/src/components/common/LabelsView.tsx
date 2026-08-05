import * as React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

interface LabelsViewProps {
  prefix: string;
  labels: Record<string, string | undefined> | undefined;
}

const LabelsView = ({ prefix, labels }: LabelsViewProps) => {
  const { t } = useTranslation();
  const labelItems = Object.entries(labels || {});
  if (labelItems.length === 0) {
    return '-';
  }

  return (
    <LabelGroup numLabels={5} expandedText={t('Show less')} collapsedText={'${remaining} ' + t('more')}>
      {labelItems.map(([key, value], index: number) => (
        <Label key={`${prefix}_${index}`} id={`${prefix}_${index}`}>
          {value ? `${key}=${value}` : key}
        </Label>
      ))}
    </LabelGroup>
  );
};

export default LabelsView;
