import * as React from 'react';
import { Flex, FlexItem, Icon, Label, LabelGroup, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import type { ManagedLabel } from '../../hooks/useDeviceLabelProvenance';
import { useTranslation } from '../../hooks/useTranslation';

interface LabelsViewProps {
  prefix: string;
  labels: Record<string, string | undefined> | undefined;
}

const ManagedLabelChip = ({ label, withMaxWidth }: { label: ManagedLabel; withMaxWidth?: boolean }) => {
  const { t } = useTranslation();
  const text = label.value ? `${label.key}=${label.value}` : label.key;
  const hasMismatch = label.kind === 'primary-mismatch';

  const maxWidth = withMaxWidth ? (hasMismatch ? '14ch' : '20ch') : undefined;

  const labelContent = (
    <Flex flexWrap={{ default: 'wrap' }} gap={{ default: 'gapNone' }}>
      {hasMismatch && (
        <FlexItem>
          <Tooltip
            content={t(
              'This managed label matches a property reported by the device, but its value differs. The label could be out of sync if its value derives from that property.',
            )}
          >
            <span tabIndex={0} role="img" aria-label={t('Managed label value mismatch')}>
              <Icon status="warning">
                <ExclamationTriangleIcon />
              </Icon>
            </span>
          </Tooltip>
        </FlexItem>
      )}
      <FlexItem>
        <Label color="grey" textMaxWidth={maxWidth}>
          {text}
        </Label>
      </FlexItem>
    </Flex>
  );

  return withMaxWidth ? (
    labelContent
  ) : (
    <Tooltip
      content={t(
        'Promoted from device status by organization mappings. Used for device selection and mapping; cannot be edited on the device.',
      )}
    >
      <span tabIndex={0}>{labelContent}</span>
    </Tooltip>
  );
};

export const ManagedLabelsView = ({
  managedLabels,
  showOnly,
  onlyDerived,
}: {
  managedLabels: ManagedLabel[];
  showOnly?: number;
  onlyDerived?: boolean;
}) => {
  let visibleLabels: ManagedLabel[] = [];
  if (onlyDerived || showOnly) {
    visibleLabels = managedLabels.filter((label, index) => {
      if (onlyDerived && label.kind === 'primary') {
        return false;
      }
      if (showOnly && index >= showOnly) {
        return false;
      }
      return true;
    });
  } else {
    visibleLabels = managedLabels;
  }

  return (
    <LabelGroup numLabels={visibleLabels.length}>
      {visibleLabels.map((label) => (
        <ManagedLabelChip key={label.key} label={label} withMaxWidth={onlyDerived} />
      ))}
    </LabelGroup>
  );
};

const LabelsView = ({ prefix, labels }: LabelsViewProps) => {
  const { t } = useTranslation();
  const labelItems = Object.entries(labels || {});
  if (labelItems.length === 0) {
    return '-';
  }

  return (
    <LabelGroup numLabels={5} expandedText={t('Show less')} collapsedText={'${remaining} ' + t('more')}>
      {labelItems.map(([key, value], index: number) => (
        <Label color="blue" key={`${prefix}_${index}`} id={`${prefix}_${index}`}>
          {value ? `${key}=${value}` : key}
        </Label>
      ))}
    </LabelGroup>
  );
};

export default LabelsView;
