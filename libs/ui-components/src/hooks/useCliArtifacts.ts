import * as React from 'react';

import { useAppContext } from './useAppContext';
import { getErrorMessage } from '../utils/error';
import { getArtifactTool, sortCliArtifacts } from '../utils/cliArtifacts';
import { CliArtifact, CliArtifactTool, CliArtifactsResponse } from '../types/extraTypes';

export type CliArtifactsDisplayResponse = {
  baseUrl: string;
  totalCount: number;
  artifactsByTool: Record<CliArtifactTool, CliArtifact[]>;
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
        const artifactsByTool = sortCliArtifacts(apiResponse.artifacts).reduce(
          (acc, artifact) => {
            const tool = getArtifactTool(artifact);
            let list = acc[tool];
            if (!list) {
              list = [];
              acc[tool] = list;
            }
            list.push(artifact);
            return acc;
          },
          {} as Record<CliArtifactTool, CliArtifact[]>,
        );

        setArtifactsResponse({
          baseUrl: apiResponse.baseUrl,
          totalCount: apiResponse.artifacts.length,
          artifactsByTool,
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
