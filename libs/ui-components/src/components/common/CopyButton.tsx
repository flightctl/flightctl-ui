import * as React from 'react';
import { Button, Icon, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/js/icons/copy-icon';

import { useTranslation } from '../../hooks/useTranslation';

interface CopyButtonProps {
  text: string;
  ariaLabel?: string;
}

const CopyButton = ({ ariaLabel, text }: CopyButtonProps) => {
  const { t } = useTranslation();

  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
  };

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [copied]);

  return (
    <Tooltip content={copied ? t('Copied!') : ariaLabel || t('Copy text')}>
      <Button
        variant="plain"
        isInline
        style={{ paddingBlock: 0 }}
        onClick={onCopy}
        icon={
          <Icon size="sm">
            <CopyIcon />
          </Icon>
        }
        aria-label={ariaLabel || t('Copy text')}
      />
    </Tooltip>
  );
};

export default CopyButton;
