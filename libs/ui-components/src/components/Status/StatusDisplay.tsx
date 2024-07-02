import * as React from 'react';

import { Button, Flex, FlexItem, Icon, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import { StatusItem, StatusItemType, StatusLevel, getDefaultStatusIcon } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';

import './StatusDisplay.css';

const colorClass: Partial<Record<StatusLevel, string>> = {
  unknown: '--pf-v5-global--Color--100',
};

type StatusLabelProps = { label: string; message?: string; level: StatusLevel; icon: React.ReactNode };

export const StatusDisplayContent = ({ label, message, level, icon }: StatusLabelProps) => {
  const iconLevel = level === 'unknown' ? undefined : level;
  const statusColor = colorClass[level];

  const style = statusColor ? ({ '--pf-v5-c-icon__content--Color': statusColor } as React.CSSProperties) : undefined;
  if (message) {
    return (
      <Popover aria-label="status popover" headerContent={label} bodyContent={message}>
        <Button
          variant="link"
          isInline
          icon={
            <Icon status={iconLevel} style={style}>
              {icon}
            </Icon>
          }
        >
          {label}
        </Button>
      </Popover>
    );
  }

  return (
    <Flex className="ftcl_status-label">
      <FlexItem>
        <Icon status={iconLevel} style={style}>
          {icon}
        </Icon>
      </FlexItem>
      <FlexItem>{label}</FlexItem>
    </Flex>
  );
};

type StatusDisplayProps<T extends StatusItemType> = {
  item?: StatusItem<T>;
  message?: string;
};

const StatusDisplay = <T extends StatusItemType>({ item, message }: StatusDisplayProps<T>) => {
  const { t } = useTranslation();
  if (!item) {
    return <StatusDisplayContent level="unknown" icon={<OutlinedQuestionCircleIcon />} label={t('Unknown')} />;
  }

  const IconComponent = item.customIcon || getDefaultStatusIcon(item.level);
  return <StatusDisplayContent level={item.level} icon={<IconComponent />} label={item.label} message={message} />;
};

export default StatusDisplay;
