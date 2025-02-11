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
