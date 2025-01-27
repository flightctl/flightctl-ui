export const getDisabledTooltipProps = (disabledReason: string | undefined) => {
  return disabledReason ? { isAriaDisabled: true, tooltipProps: { content: disabledReason } } : undefined;
};
