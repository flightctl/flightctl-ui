export const getErrorMsgFromApiResponse = async (response: Response): Promise<string> => {
  let errorText = '';
  try {
    const msg = await response.text();
    try {
      const json = JSON.parse(msg) as { message: string };
      errorText = json.message;
    } catch (e) {
      errorText = msg;
    }
  } catch (e) {
    //ignore
  }
  return `Error ${response.status}: ${response.statusText}${errorText ? `: ${errorText}` : ''}`;
};

export const getErrorMsgFromAlertsApiResponse = async (response: Response): Promise<string> => {
  let errorText = '';
  try {
    const msg = await response.text();
    try {
      errorText = JSON.parse(msg) as string;
    } catch (e) {
      errorText = msg;
    }
  } catch (e) {
    //ignore
  }
  return `Error ${response.status}: ${response.statusText}${errorText ? `: ${errorText}` : ''}`;
};
