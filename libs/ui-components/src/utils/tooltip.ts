export const getDisabledTooltipProps = (disabledReason: string | undefined) =>
  disabledReason ? { isAriaDisabled: true, tooltipProps: { content: disabledReason } } : undefined;
