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

import { getLastTransitionTimeText } from '../../../utils/status/repository';
import { useTranslation } from '../../../hooks/useTranslation';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import RepositoryStatus from '../../Status/RepositoryStatus';
import {
  getRepoTypeLabel,
  getRepoUrlOrRegistry,
  hasCredentialsSettings,
  isHttpRepoSpec,
  isOciRepoSpec,
} from '../CreateRepository/utils';
import { GitRepositoryLink, HttpRepositoryUrl } from './RepositorySource';

const RepoPrivacy = ({ repo }: { repo: Repository }) => {
  const { t } = useTranslation();

  const isPrivate = hasCredentialsSettings(repo.spec);

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

  const repoLabel = getRepoTypeLabel(t, repoDetails.spec.type);

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
              {repoDetails ? <RepositoryStatus repository={repoDetails} /> : '-'}
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
