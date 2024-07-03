import * as React from 'react';

import { Button, Flex, FlexItem, Icon, Popover } from '@patternfly/react-core';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

import { StatusItem, StatusItemType, StatusLevel, getDefaultStatusIcon } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';

import './StatusDisplay.css';

const colorClass: Partial<Record<StatusLevel, string>> = {
  unknown: '--pf-v5-global--Color--100',
};

type StatusLabelProps = {
  label: string;
  message?: React.ReactNode;
  messageTitle?: string;
  level: StatusLevel;
  customIcon?: React.ComponentClass<SVGIconProps>;
};

export const StatusDisplayContent = ({ label, messageTitle, message, level, customIcon }: StatusLabelProps) => {
  const iconLevel = level === 'unknown' ? undefined : level;
  const statusColor = colorClass[level];
  const IconComponent = customIcon || getDefaultStatusIcon(level);

  const style = statusColor ? ({ '--pf-v5-c-icon__content--Color': statusColor } as React.CSSProperties) : undefined;
  if (message) {
    return (
      <Popover aria-label="status popover" headerContent={messageTitle || label} bodyContent={message}>
        <Button
          variant="link"
          isInline
          icon={
            <Icon status={iconLevel} style={style}>
              <IconComponent />
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
          <IconComponent />
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
    return <StatusDisplayContent level="unknown" label={t('Unknown')} />;
  }

  return <StatusDisplayContent level={item.level} customIcon={item.customIcon} label={item.label} message={message} />;
};

export default StatusDisplay;
