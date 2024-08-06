import * as React from 'react';

import { Button, Flex, FlexItem, Icon, Popover } from '@patternfly/react-core';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

import { StatusLevel, getDefaultStatusColor, getDefaultStatusIcon } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';

import './StatusDisplay.css';

type StatusLabelProps = {
  label: string;
  message?: React.ReactNode;
  messageTitle?: string;
  level: StatusLevel;
  customIcon?: React.ComponentClass<SVGIconProps>;
};

export const StatusDisplayContent = ({ label, messageTitle, message, level, customIcon }: StatusLabelProps) => {
  const iconLevel = level === 'unknown' ? undefined : level;
  const IconComponent = customIcon || getDefaultStatusIcon(level);

  if (message) {
    return (
      <Popover
        aria-label="status popover"
        headerContent={messageTitle || label}
        bodyContent={message}
        className="fctl-status-display-content__popover"
        hasAutoWidth={false}
      >
        <Button
          variant="link"
          isInline
          icon={
            <Icon
              status={iconLevel}
              style={{ '--pf-v5-c-icon__content--Color': getDefaultStatusColor(level) } as React.CSSProperties}
            >
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
        <Icon
          status={iconLevel}
          style={{ '--pf-v5-c-icon__content--Color': getDefaultStatusColor(level) } as React.CSSProperties}
        >
          <IconComponent />
        </Icon>
      </FlexItem>
      <FlexItem>{label}</FlexItem>
    </Flex>
  );
};

type StatusDisplayProps = {
  item?: {
    label: string;
    level: StatusLevel;
    customIcon?: React.ComponentClass<SVGIconProps>;
  };
  message?: string;
};

const StatusDisplay = ({ item, message }: StatusDisplayProps) => {
  const { t } = useTranslation();
  if (!item) {
    return <StatusDisplayContent level="unknown" label={t('Unknown')} />;
  }

  return <StatusDisplayContent level={item.level} customIcon={item.customIcon} label={item.label} message={message} />;
};

export default StatusDisplay;
