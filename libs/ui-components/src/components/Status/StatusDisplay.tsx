import * as React from 'react';

import { Flex, FlexItem, Icon } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import { StatusItem, StatusItemType, StatusLevel, getDefaultStatusIcon } from '../../utils/status/common';
import WithTooltip from '../common/WithTooltip';
import { useTranslation } from '../../hooks/useTranslation';

import './StatusDisplay.css';

const colorClass: Partial<Record<StatusLevel, string>> = {
  unknown: '--pf-v5-global--Color--100',
};

type StatusLabelProps = { label: string; tooltip?: string; level: StatusLevel; icon: React.ReactNode };

export const StatusDisplayContent = ({ label, tooltip, level, icon }: StatusLabelProps) => {
  const iconLevel = level === 'unknown' ? undefined : level;
  const statusColor = colorClass[level];

  const style = statusColor ? ({ '--pf-v5-c-icon__content--Color': statusColor } as React.CSSProperties) : undefined;

  return (
    <WithTooltip showTooltip={!!tooltip} content={tooltip}>
      <Flex className="ftcl_status-label">
        <FlexItem>
          <Icon status={iconLevel} style={style}>
            {icon}
          </Icon>
        </FlexItem>
        <FlexItem>{label}</FlexItem>
      </Flex>
    </WithTooltip>
  );
};

function StatusDisplay<T extends StatusItemType>({ item }: { item?: StatusItem<T> }) {
  const { t } = useTranslation();
  if (!item) {
    return <StatusDisplayContent level="unknown" icon={<OutlinedQuestionCircleIcon />} label={t('Unknown')} />;
  }

  const IconComponent = item.customIcon || getDefaultStatusIcon(item.level);
  return <StatusDisplayContent level={item.level} icon={<IconComponent />} label={item.label} />;
}

export default StatusDisplay;
