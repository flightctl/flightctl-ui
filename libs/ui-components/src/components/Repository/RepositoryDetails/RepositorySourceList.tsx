import React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { type DependencySyncConfigRefStatus, type DependencySyncStatus } from '@flightctl/types';
import {
  type ConfigSourceProvider,
  getRepoName,
  isInlineProviderSpec,
  isK8sSecretProviderSpec,
  isRepoConfig,
} from '../../../types/deviceSpec';
import { useTranslation } from '../../../hooks/useTranslation';
import { type RepositoryDetails, useRepositoryDetailsMap } from '../../../hooks/useRepositoryDetailsMap';
import ConfigSourceSyncDetails from './ConfigSourceSyncDetails';
import RepositoryConfig from './RepositorySource';

const getSyncRef = (
  configProviderName: string,
  dependencyStatus?: DependencySyncStatus,
): DependencySyncConfigRefStatus | null => {
  const syncRef = dependencyStatus?.configRefs?.find((ref) => ref.configProviderName === configProviderName);
  if (syncRef && (syncRef.fingerprint || syncRef.lastUpdatedAt)) {
    return syncRef;
  }
  return null;
};

type RepositorySourceListProps = {
  configs: Array<ConfigSourceProvider>;
  dependencyStatus?: DependencySyncStatus;
  showNames?: boolean;
};

const RepositorySourceItem = ({
  config,
  repoDetails,
}: {
  config: ConfigSourceProvider;
  repoDetails?: RepositoryDetails;
}) => {
  const { t } = useTranslation();
  if (isK8sSecretProviderSpec(config)) {
    return <>{`${config.secretRef.namespace}:${config.secretRef.name}`}</>;
  }
  if (isInlineProviderSpec(config)) {
    return <>{t('{{count}} files', { count: config.inline.length })}</>;
  }

  return <RepositoryConfig config={config} repoDetails={repoDetails} />;
};

export const RepositorySourcePlainList = ({ configs }: { configs: ConfigSourceProvider[] }) => {
  const { repoDetailsMap, isLoading } = useRepositoryDetailsMap(configs);

  if (configs.length === 0) {
    return '-';
  }

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  return (
    <Stack hasGutter>
      {configs.map((config) => {
        const repoName = isRepoConfig(config) ? getRepoName(config) : undefined;
        const repoDetails = repoName ? repoDetailsMap[repoName] : undefined;

        return (
          <StackItem key={config.name}>
            {isRepoConfig(config) ? (
              <RepositoryConfig config={config} repoDetails={repoDetails} showConfigName />
            ) : (
              <>{config.name}</>
            )}
          </StackItem>
        );
      })}
    </Stack>
  );
};

const RepositorySourceDescriptionList = ({
  configs,
  dependencyStatus,
  showNames = true,
}: RepositorySourceListProps) => {
  const repoConfigs = configs.filter(isRepoConfig);
  const { repoDetailsMap, isLoading } = useRepositoryDetailsMap(repoConfigs);

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  if (configs.length === 0) {
    return null;
  }

  const configSyncs = configs.map((config) => getSyncRef(config.name, dependencyStatus));
  const hasSyncDetails = configSyncs.some((sync) => sync !== null);

  return (
    <DescriptionList isHorizontal isCompact horizontalTermWidthModifier={{ default: '12ch' }}>
      {configs.map((config, index) => {
        const addDivider = hasSyncDetails && index !== configs.length - 1;

        let repoDetails: RepositoryDetails | undefined = undefined;
        if (isRepoConfig(config)) {
          const repoName = getRepoName(config);
          repoDetails = repoDetailsMap[repoName] || undefined;
        }

        const syncRef = configSyncs[index];
        return (
          <DescriptionListGroup key={config.name}>
            {showNames && <DescriptionListTerm>{config.name}</DescriptionListTerm>}
            <DescriptionListDescription>
              <Stack hasGutter className="fctl-config-source-description">
                <StackItem>
                  <RepositorySourceItem config={config} repoDetails={repoDetails} />
                </StackItem>
                {syncRef && (
                  <StackItem className="fctl-config-source-description__sync">
                    <ConfigSourceSyncDetails syncRef={syncRef} />
                  </StackItem>
                )}
                {addDivider && (
                  <StackItem className="pf-v6-u-my-sm">
                    <Divider
                      style={
                        {
                          '--pf-v6-c-divider--Color': 'var(--pf-t--global--border--color--50)',
                        } as React.CSSProperties
                      }
                    />
                  </StackItem>
                )}
              </Stack>
            </DescriptionListDescription>
          </DescriptionListGroup>
        );
      })}
    </DescriptionList>
  );
};

export default RepositorySourceDescriptionList;
