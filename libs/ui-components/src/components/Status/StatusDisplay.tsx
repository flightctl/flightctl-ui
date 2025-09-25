import * as React from 'react';

import { Button, Flex, FlexItem, Icon, Popover } from '@patternfly/react-core';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

import { StatusLevel, getDefaultStatusColor, getDefaultStatusIcon } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';

import './StatusDisplay.css';

type StatusLabelProps = {
  label: React.ReactNode;
  message?: React.ReactNode;
  messageTitle?: string;
  level: StatusLevel;
  customIcon?: React.ComponentClass<SVGIconProps>;
  customColor?: string;
};

export const StatusDisplayContent = ({
  label,
  messageTitle,
  message,
  level,
  customIcon,
  customColor,
}: StatusLabelProps) => {
  const overrideStatus = level === 'unknown' || (level === 'custom' && customColor);
  const IconComponent = customIcon || getDefaultStatusIcon(level);
  const iconColor = customColor || getDefaultStatusColor(level);

  const icon = (
    <Icon
      status={overrideStatus ? undefined : level}
      style={{ '--pf-v5-c-icon__content--Color': iconColor } as React.CSSProperties}
    >
      <IconComponent />
    </Icon>
  );

  if (message) {
    return (
      <Popover
        aria-label="status popover"
        headerContent={messageTitle || label}
        bodyContent={message}
        className="fctl-status-display-content__popover"
        hasAutoWidth={false}
      >
        <Button variant="link" isInline icon={icon}>
          {label}
        </Button>
      </Popover>
    );
  }

  return (
    <Flex className="ftcl_status-label">
      <FlexItem>{icon}</FlexItem>
      <FlexItem>{label}</FlexItem>
    </Flex>
  );
};

type StatusDisplayProps = {
  item?: {
    label: string;
    level: StatusLevel;
    customIcon?: React.ComponentClass<SVGIconProps>;
    customColor?: string;
  };
  message?: React.ReactNode;
};

const StatusDisplay = ({ item, message }: StatusDisplayProps) => {
  const { t } = useTranslation();
  if (!item) {
    return <StatusDisplayContent level="unknown" label={t('Unknown')} />;
  }

  return (
    <StatusDisplayContent
      level={item.level}
      customIcon={item.customIcon}
      customColor={item.customColor}
      label={item.label}
      message={message}
    />
  );
};

export default StatusDisplay;
