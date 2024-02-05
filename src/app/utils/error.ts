export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof String) {
    return error.toString();
  }
  return 'Unexpected error';
};
