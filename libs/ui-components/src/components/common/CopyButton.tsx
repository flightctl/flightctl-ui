import * as React from 'react';
import { CopyIcon } from '@patternfly/react-icons/dist/js/icons/copy-icon';
import { Button, ButtonProps, Icon, Tooltip } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

interface CopyButtonProps {
  text: string;
  variant?: ButtonProps['variant'];
  ariaLabel?: string;
}

const CopyButton = ({ ariaLabel, text, variant }: CopyButtonProps) => {
  const { t } = useTranslation();

  const onCopy = () => {
    void navigator.clipboard.writeText(text);
  };

  return (
    <Tooltip content={ariaLabel || t('Copy text')}>
      <Button
        variant={variant || 'plain'}
        isInline={variant === 'link'}
        icon={
          <Icon size="sm">
            <CopyIcon onClick={onCopy} />
          </Icon>
        }
        aria-label={ariaLabel || t('Copy text')}
      />
    </Tooltip>
  );
};

export default CopyButton;
