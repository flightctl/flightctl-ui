import React from 'react';
import { Button, Icon, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import {
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
} from '@flightctl/types';
import {
  ConfigSourceProvider,
  ConfigType,
  RepoConfig,
  getConfigFullRepoUrl,
  getRepoName,
  isHttpProviderSpec,
} from '../../../types/deviceSpec';
import CopyButton from '../../common/CopyButton';
import { useTranslation } from '../../../hooks/useTranslation';
import { getConfigType } from '../../Device/EditDeviceWizard/deviceSpecUtils';

type ExtraArgs = Record<string, string>;

export const DefaultConfigDetails = ({
  config,
}: {
  config: InlineConfigProviderSpec | KubernetesSecretProviderSpec;
}) => {
  return <>{config.name}</>;
};

export const HttpRepositoryUrl = ({ name, url }: { name?: string; url: string }) => {
  const { t } = useTranslation();
  return (
    <>
      {name || url}
      <CopyButton text={url} ariaLabel={t('Copy Url')} />
    </>
  );
};

export const GitRepositoryLink = ({ name, url }: { name?: string; url: string }) => (
  <Button
    component="a"
    variant="link"
    isInline
    href={url}
    target="_blank"
    icon={<ExternalLinkAltIcon />}
    iconPosition="end"
  >
    {name || url}
  </Button>
);

export const RepositoryConfigDetails = ({ config, extraArgs }: { config: RepoConfig; extraArgs: ExtraArgs }) => {
  const { t } = useTranslation();
  if (extraArgs.errorMsg) {
    const fullError = `${t('The repository "{{name}}" defined for this source failed to load.', {
      name: getRepoName(config),
    })} ${extraArgs.errorMsg}`;
    return (
      <>
        {config.name}{' '}
        <Tooltip content={fullError}>
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
        </Tooltip>
      </>
    );
  }

  const url = getConfigFullRepoUrl(config, extraArgs.url);
  if (isHttpProviderSpec(config)) {
    return <HttpRepositoryUrl name={config.name} url={url} />;
  }
  return <GitRepositoryLink name={config.name} url={url} />;
};

export const getConfigDetails = (config: ConfigSourceProvider, extraArgs: ExtraArgs) => {
  switch (getConfigType(config)) {
    case ConfigType.GIT:
    case ConfigType.HTTP:
      return (
        <RepositoryConfigDetails
          config={config as GitConfigProviderSpec | HttpConfigProviderSpec}
          extraArgs={extraArgs}
        />
      );
    default:
      return <DefaultConfigDetails config={config as KubernetesSecretProviderSpec | InlineConfigProviderSpec} />;
  }
};
