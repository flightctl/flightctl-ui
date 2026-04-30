import * as React from 'react';

import { useAppContext } from './useAppContext';
import { getErrorMessage } from '../utils/error';
import { getArtifactTool, sortCliArtifacts } from '../utils/cliArtifacts';
import { CliArtifact, CliArtifactTool, CliArtifactsResponse } from '../types/extraTypes';

export type CliArtifactsDisplayResponse = {
  baseUrl: string;
  totalCount: number;
  flightctlArtifacts: CliArtifact[];
  restoreArtifacts: CliArtifact[];
};

export const useCliArtifacts = (): {
  loading: boolean;
  loadError?: string;
  hasArtifactsEnabled: boolean;
  artifactsResponse?: CliArtifactsDisplayResponse;
} => {
  const { fetch } = useAppContext();
  const { proxyFetch } = fetch;

  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string>();
  const [artifactsResponse, setArtifactsResponse] = React.useState<CliArtifactsDisplayResponse>();
  const [hasArtifactsEnabled, setArtifactsEnabled] = React.useState(true);

  React.useEffect(() => {
    const getLinks = async () => {
      try {
        const response = await proxyFetch('cli-artifacts', {
          method: 'GET',
        });
        if (!response.ok) {
          if (response.status === 501) {
            setArtifactsEnabled(false);
          } else {
            setLoadError(getErrorMessage(response.statusText));
          }
          return;
        }
        const apiResponse = (await response.json()) as CliArtifactsResponse;
        const artifacts = sortCliArtifacts(apiResponse.artifacts);
        const mainCliArtifacts = artifacts.filter((a) => getArtifactTool(a) === CliArtifactTool.Flightctl);
        const restoreCliArtifacts = artifacts.filter((a) => getArtifactTool(a) === CliArtifactTool.FlightctlRestore);
        setArtifactsResponse({
          baseUrl: apiResponse.baseUrl,
          totalCount: artifacts.length,
          flightctlArtifacts: mainCliArtifacts,
          restoreArtifacts: restoreCliArtifacts,
        });
      } catch {
        setArtifactsEnabled(false);
      } finally {
        setLoading(false);
      }
    };
    void getLinks();
  }, [proxyFetch]);

  return {
    loading,
    loadError,
    hasArtifactsEnabled,
    artifactsResponse,
  };
};
