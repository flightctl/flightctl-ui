import * as React from 'react';
import { Button, FormGroup, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import './WithHelperText.css';

type HelperTextPopoverProps = {
  label: string;
  isInline?: boolean;
  hasNoPadding?: boolean;
  triggerAction?: 'click' | 'hover';
  content: React.ReactNode;
};

type FormGroupWithHelperTextProps = HelperTextPopoverProps & {
  isRequired?: boolean;
};

const HelperTextPopover = ({
  ariaLabel,
  content,
  triggerAction,
  hasNoPadding,
}: Omit<HelperTextPopoverProps, 'label'> & { ariaLabel: string }) => (
  <Popover aria-label={ariaLabel} bodyContent={content} withFocusTrap triggerAction={triggerAction}>
    <Button
      icon={<OutlinedQuestionCircleIcon />}
      component="a"
      isInline
      variant="plain"
      hasNoPadding={hasNoPadding}
      onClick={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      }}
      aria-label={`${ariaLabel} help text`}
    />
  </Popover>
);

const LabelWithHelperText = ({
  label,
  hideLabel,
  isInline,
  content,
  triggerAction,
  hasNoPadding,
}: HelperTextPopoverProps & { hideLabel?: boolean }) => (
  <span className={`fctl-label-withhelpertext${isInline ? ' fctl-label-withhelpertext--inline' : ''}`}>
    {!hideLabel && label}
    <HelperTextPopover ariaLabel={label} content={content} triggerAction={triggerAction} hasNoPadding={hasNoPadding} />
  </span>
);

export const FormGroupWithHelperText = ({
  label,
  isRequired,
  content,
  hasNoPadding,
  children,
}: React.PropsWithChildren<FormGroupWithHelperTextProps>) => (
  <FormGroup
    label={label}
    labelHelp={
      content ? <HelperTextPopover ariaLabel={label} content={content} hasNoPadding={hasNoPadding} /> : undefined
    }
    isRequired={isRequired}
  >
    {children}
  </FormGroup>
);

export default LabelWithHelperText;
