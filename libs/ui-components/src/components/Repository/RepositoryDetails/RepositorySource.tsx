import React from 'react';
import { Button, Icon, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import {
  type ConfigSourceProvider,
  getConfigFullRepoUrl,
  getRepoName,
  isGitProviderSpec,
  isHttpProviderSpec,
} from '../../../types/deviceSpec';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RepositoryDetails } from '../../../hooks/useRepositoryDetailsMap';
import CopyButton from '../../common/CopyButton';

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

const RepositorySource = ({
  config,
  repoDetails,
}: {
  config: ConfigSourceProvider;
  repoDetails?: RepositoryDetails;
}) => {
  const { t } = useTranslation();

  const isGitConfig = isGitProviderSpec(config);
  const isHttpConfig = isHttpProviderSpec(config);
  if (!repoDetails || !(isGitConfig || isHttpConfig)) {
    return <>{config.name}</>;
  }

  if (repoDetails.errorMsg) {
    const fullError = `${t('The repository "{{name}}" defined for this source failed to load.', {
      name: getRepoName(config),
    })} ${repoDetails.errorMsg}`;
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

  const url = getConfigFullRepoUrl(config, repoDetails.url || '');
  if (isHttpProviderSpec(config)) {
    return <HttpRepositoryUrl name={config.name} url={url} />;
  }
  return <GitRepositoryLink name={config.name} url={url} />;
};

export default RepositorySource;
