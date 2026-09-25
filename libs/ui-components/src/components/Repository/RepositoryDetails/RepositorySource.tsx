import React from 'react';
import { Button, ClipboardCopy, Icon, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { type RepoConfig, getConfigFullRepoUrl, getRepoName, isHttpProviderSpec } from '../../../types/deviceSpec';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RepositoryDetails } from '../../../hooks/useRepositoryDetailsMap';
import CopyButton from '../../common/CopyButton';

export const HttpRepositoryUrl = ({ name, url }: { name?: string; url: string }) => {
  const { t } = useTranslation();

  if (name) {
    return (
      <>
        <span>{name}</span>
        <CopyButton text={url} ariaLabel={t('Copy Url for http configuration {{name}}', { name })} />
      </>
    );
  }

  return (
    <ClipboardCopy
      variant="inline-compact"
      truncation
      hoverTip={t('Copy Url')}
      clickTip={t('Copied')}
      copyAriaLabel={t('Copy Url')}
    >
      {url}
    </ClipboardCopy>
  );
};

export const GitRepositoryLink = ({ name, url }: { name?: string; url: string }) => {
  const { t } = useTranslation();
  return (
    <Button
      component="a"
      variant="link"
      isInline
      href={url}
      target="_blank"
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
    >
      {name || t('View in repository')}
    </Button>
  );
};

type RepositoryConfigProps = {
  config: RepoConfig;
  repoDetails?: RepositoryDetails;
  showConfigName?: boolean;
};

const RepositoryConfig = ({ config, repoDetails, showConfigName }: RepositoryConfigProps) => {
  const { t } = useTranslation();

  if (!repoDetails) {
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
  const name = showConfigName ? config.name : undefined;
  if (isHttpProviderSpec(config)) {
    return <HttpRepositoryUrl name={name} url={url} />;
  }
  return <GitRepositoryLink name={name} url={url} />;
};

export default RepositoryConfig;
