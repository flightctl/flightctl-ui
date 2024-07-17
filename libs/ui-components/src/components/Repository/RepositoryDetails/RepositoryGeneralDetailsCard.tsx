import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
} from '@patternfly/react-core';
import { LockedIcon } from '@patternfly/react-icons/dist/js/icons/locked-icon';
import { LockOpenIcon } from '@patternfly/react-icons/dist/js/icons/lock-open-icon';

import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '../../../utils/status/repository';
import { Repository } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import RepositorySource from './RepositorySource';
import RepositoryStatus from '../../Status/RepositoryStatus';
import { isHttpRepoSpec, isSshRepoSpec } from '../CreateRepository/utils';

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
  }

  return isPrivate ? (
    <>
      <Icon status="success">
        <LockedIcon />
      </Icon>{' '}
      {t('Repository is private')}
    </>
  ) : (
    <>
      <Icon status="success">
        <LockOpenIcon />
      </Icon>{' '}
      {t('Repository is public')}
    </>
  );
};

const DetailsTab = ({ repoDetails }: { repoDetails: Repository }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardTitle>{t('Details')}</CardTitle>
      <CardBody>
        <DescriptionList columnModifier={{ lg: '2Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Url')}</DescriptionListTerm>
            <DescriptionListDescription>
              <RepositorySource sourceDetails={{ url: repoDetails.spec.repo, type: 'git' }} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
            <DescriptionListDescription>
              {' '}
              {repoDetails ? <RepositoryStatus statusInfo={getRepositorySyncStatus(repoDetails)} /> : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Last transition')}</DescriptionListTerm>
            <DescriptionListDescription>
              {repoDetails ? getRepositoryLastTransitionTime(repoDetails, t).text : '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Privacy')}</DescriptionListTerm>
            <DescriptionListDescription>
              <RepoPrivacy repo={repoDetails} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default DetailsTab;
