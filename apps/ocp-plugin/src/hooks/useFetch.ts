import * as React from 'react';
import { deleteData, fetchData, postData, putData } from '../utils/apiCalls';

export const useFetch = () => {
  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData(kind, undefined, abortSignal),
    [],
  );

  const post = React.useCallback(async <R>(kind: string, obj: R): Promise<R> => postData(kind, undefined, obj), []);

  const put = React.useCallback(async <R>(kind: string, obj: R): Promise<R> => putData(kind, undefined, obj), []);

  const remove = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => deleteData(kind, undefined, abortSignal),
    [],
  );

  return {
    get,
    post,
    put,
    remove,
  };
};
