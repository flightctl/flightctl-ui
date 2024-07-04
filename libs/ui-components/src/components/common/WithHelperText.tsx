import * as React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

type WithHelperTextProps = {
  ariaLabel: string;
  showLabel?: boolean;
  content: React.ReactNode;
};

const WithHelperText = ({ ariaLabel, showLabel, content }: WithHelperTextProps) => (
  <>
    {showLabel && ariaLabel}
    <Tooltip content={content}>
      <Button isInline variant="plain" aria-label={`${ariaLabel} help text`} icon={<OutlinedQuestionCircleIcon />} />
    </Tooltip>
  </>
);

export default WithHelperText;
