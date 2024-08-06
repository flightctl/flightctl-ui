import * as React from 'react';
import { Button, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import './WithHelperText.css';

type WithHelperTextProps = {
  ariaLabel: string;
  showLabel?: boolean;
  triggerAction?: 'click' | 'hover';
  content: React.ReactNode;
};

const WithHelperText = ({ ariaLabel, showLabel, content, triggerAction }: WithHelperTextProps) => (
  <>
    {showLabel && ariaLabel}
    <Popover aria-label={ariaLabel} bodyContent={content} withFocusTrap triggerAction={triggerAction}>
      <Button
        component="a"
        className="fctl-helper-text__icon"
        isInline
        variant="plain"
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
        }}
        aria-label={`${ariaLabel} help text`}
        icon={<OutlinedQuestionCircleIcon />}
      />
    </Popover>
  </>
);

export default WithHelperText;
