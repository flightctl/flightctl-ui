import * as React from 'react';
import { Button, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import './WithHelperText.css';

type WithHelperTextProps = {
  ariaLabel: string;
  showLabel?: boolean;
  triggerAction?: 'click' | 'hover';
  content: React.ReactNode;
  className?: string;
};

const WithHelperText = ({ ariaLabel, showLabel, content, triggerAction, className }: WithHelperTextProps) => (
  <>
    {showLabel && ariaLabel}
    <Popover aria-label={ariaLabel} bodyContent={content} withFocusTrap triggerAction={triggerAction}>
      <Button
        className={className}
        isInline
        variant="plain"
        aria-label={`${ariaLabel} help text`}
        icon={<OutlinedQuestionCircleIcon />}
      />
    </Popover>
  </>
);

export default WithHelperText;
