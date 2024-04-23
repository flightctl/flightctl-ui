export function isPromiseFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isPromiseRejected(result: PromiseSettledResult<unknown>): result is PromiseRejectedResult {
  return result.status === 'rejected';
}
