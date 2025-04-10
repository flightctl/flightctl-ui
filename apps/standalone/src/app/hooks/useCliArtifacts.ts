import * as React from 'react';
import { fetchCliArtifacts } from '../utils/apiCalls';

export const useCliArtifacts = () => {
  const getCliArtifacts = React.useCallback(
    async <R>(abortSignal?: AbortSignal): Promise<R> => fetchCliArtifacts<R>(abortSignal),
    [],
  );

  return getCliArtifacts;
};
