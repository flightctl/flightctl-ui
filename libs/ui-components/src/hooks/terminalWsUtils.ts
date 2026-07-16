/** Prefix WebSocket payload with a k8s-style channel byte (0x00 stdin, 0x04 resize). */
export const msgToBytes = (msg: string, resize?: boolean) => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(msg);
  const result = new Uint8Array(encodedData.length + 1);
  result[0] = resize ? 0x4 : 0x00;
  result.set(encodedData, 1);
  return result;
};
