/** EDM-4074: default max length before middle-ellipsis shortening applies. */
export const defaultMaxDisplayLength = 50;

export const getDisplayText = (text: string | undefined, maxLength = defaultMaxDisplayLength, leadingChars = 6) => {
  if (!text) {
    return '-';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, leadingChars)}...${text.substring(text.length - 7)}`;
};
