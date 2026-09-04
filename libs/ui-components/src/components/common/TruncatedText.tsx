import * as React from 'react';

import { defaultMaxDisplayLength, getDisplayText } from '../../utils/displayText';
import CopyButton from './CopyButton';

import './TruncatedText.css';

type TruncatedTextProps = {
  text: string;
  showCopy?: boolean;
  maxChars?: number;
  leadingChars?: number;
  children?: (textContent: string) => React.ReactNode;
};

const TruncatedText = ({
  text,
  showCopy,
  leadingChars,
  maxChars = defaultMaxDisplayLength,
  children,
}: TruncatedTextProps) => {
  const displayText = getDisplayText(text, maxChars, leadingChars);
  const shouldShowCopy = showCopy ?? text !== displayText;

  return (
    <span className="fctl-truncated-text">
      <span className="fctl-truncated-text__copy">{children ? children(displayText) : displayText}</span>
      {shouldShowCopy && <CopyButton text={text} />}
    </span>
  );
};

export default TruncatedText;
