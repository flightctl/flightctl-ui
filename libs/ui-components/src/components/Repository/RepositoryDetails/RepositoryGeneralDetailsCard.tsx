import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { LockOpenIcon } from '@patternfly/react-icons/dist/js/icons/lock-open-icon';

import { Repository } from '@flightctl/types';

import { getLastTransitionTimeText, getRepositorySyncStatus } from '../../../utils/status/repository';
import { useTranslation } from '../../../hooks/useTranslation';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import RepositoryStatus from '../../Status/RepositoryStatus';
import { getRepoUrlOrRegistry, isHttpRepoSpec, isOciRepoSpec, isSshRepoSpec } from '../CreateRepository/utils';
import { GitRepositoryLink, HttpRepositoryUrl } from './RepositorySource';

const RepoPrivacy = ({ repo }: { repo: Repository }) => {
  const { t } = useTranslation();
  let isPrivate = false;
  if (isHttpRepoSpec(repo.spec)) {
    if (repo.spec.httpConfig.password || repo.spec.httpConfig['tls.crt'] || repo.spec.httpConfig['tls.key']) {
      isPrivate = true;
    }
  } else if (isSshRepoSpec(repo.spec)) {
    if (repo.spec.sshConfig.sshPrivateKey) {
      isPrivate = true;
    }
  } else if (isOciRepoSpec(repo.spec)) {
    if (repo.spec.ociAuth) {
      isPrivate = true;
    }
  }

  return isPrivate ? (
    <>
      <Icon>
        <LockIcon />
      </Icon>{' '}
      {t('Private repository')}
    </>
  ) : (
    <>
      <Icon>
        <LockOpenIcon />
      </Icon>{' '}
      {t('Public repository')}
    </>
  );
};

const RegistryOrUrl = ({ repo }: { repo: Repository }) => {
  const urlOrRegistry = getRepoUrlOrRegistry(repo.spec);
  if (isOciRepoSpec(repo.spec)) {
    return <div>{urlOrRegistry}</div>;
  }
  if (isHttpRepoSpec(repo.spec)) {
    return <HttpRepositoryUrl url={urlOrRegistry} />;
  }
  return <GitRepositoryLink url={urlOrRegistry} />;
};

const DetailsTab = ({ repoDetails }: { repoDetails: Repository }) => {
  const { t } = useTranslation();

  let repoLabel = '';
  if (isOciRepoSpec(repoDetails.spec)) {
    repoLabel = t('OCI registry');
  } else if (isHttpRepoSpec(repoDetails.spec)) {
    repoLabel = t('HTTP service');
  } else {
    repoLabel = t('Git repository');
  }

  return (
    <Card>
      <CardTitle>{t('Details')}</CardTitle>
      <CardBody>
        <FlightControlDescriptionList columnModifier={{ lg: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{isOciRepoSpec(repoDetails.spec) ? t('Registry') : t('URL')}</DescriptionListTerm>
            <DescriptionListDescription>
              <RegistryOrUrl repo={repoDetails} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
            <DescriptionListDescription>{repoLabel}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup />
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
            <DescriptionListDescription>
              {' '}
              {repoDetails ? <RepositoryStatus statusInfo={getRepositorySyncStatus(repoDetails)} /> : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Privacy')}</DescriptionListTerm>
            <DescriptionListDescription>
              <RepoPrivacy repo={repoDetails} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Last transition')}</DescriptionListTerm>
            <DescriptionListDescription>
              {repoDetails ? getLastTransitionTimeText(repoDetails, t).text : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </FlightControlDescriptionList>
      </CardBody>
    </Card>
  );
};

export default DetailsTab;
