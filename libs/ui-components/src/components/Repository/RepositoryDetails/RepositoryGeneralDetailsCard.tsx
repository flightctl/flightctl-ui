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
import { LockIcon } from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { LockOpenIcon } from '@patternfly/react-icons/dist/js/icons/lock-open-icon';

import { getLastTransitionTimeText, getRepositorySyncStatus } from '../../../utils/status/repository';
import { RepoSpecType, Repository } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import RepositoryStatus from '../../Status/RepositoryStatus';
import { isHttpRepoSpec, isSshRepoSpec } from '../CreateRepository/utils';
import { RepositoryLink } from './RepositorySource';

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

const DetailsTab = ({ repoDetails }: { repoDetails: Repository }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardTitle>{t('Details')}</CardTitle>
      <CardBody>
        <DescriptionList columnModifier={{ lg: '3Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Url')}</DescriptionListTerm>
            <DescriptionListDescription>
              <RepositoryLink url={repoDetails.spec.url} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
            <DescriptionListDescription>
              {repoDetails?.spec.type === RepoSpecType.HTTP ? t('HTTP service') : t('Git repository')}
            </DescriptionListDescription>
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
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default DetailsTab;
