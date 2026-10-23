import * as React from 'react';

import CopyButton from './CopyButton';
import { defaultMaxDisplayLength, getDisplayText } from '../../utils/displayText';

import './TruncatedText.css';

type TruncatedTextProps = {
  text: string;
  showCopy?: boolean;
  maxChars?: number;
  leadingChars?: number;
  children?: (textContent: string) => React.ReactNode;
  className?: string;
};

const TruncatedText = ({
  text,
  showCopy,
  leadingChars,
  maxChars = defaultMaxDisplayLength,
  children,
  className,
}: TruncatedTextProps) => {
  const displayText = getDisplayText(text, maxChars, leadingChars);
  const shouldShowCopy = showCopy ?? text !== displayText;

  return (
    <span className={`fctl-truncated-text ${className ?? ''}`}>
      <span className="fctl-truncated-text__copy">{children ? children(displayText) : displayText}</span>
      {shouldShowCopy && <CopyButton text={text} />}
    </span>
  );
};

export default TruncatedText;
