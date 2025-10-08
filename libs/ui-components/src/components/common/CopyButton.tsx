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

  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
  };

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <Tooltip content={copied ? t('Copied!') : ariaLabel || t('Copy text')}>
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
