import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Icon,
} from '@patternfly/react-core';
import { LockedIcon } from '@patternfly/react-icons/dist/js/icons/locked-icon';
import { LockOpenIcon } from '@patternfly/react-icons/dist/js/icons/lock-open-icon';

import StatusInfo from '../../../common/StatusInfo';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '../../../../utils/status/repository';
import { Repository } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import RepositorySource from '../RepositorySource';

const DetailsTab = ({ repoDetails }: { repoDetails: Repository }) => {
  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <GridItem>
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
                  {repoDetails ? <StatusInfo statusInfo={getRepositorySyncStatus(repoDetails)} /> : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Last transition')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {repoDetails ? getRepositoryLastTransitionTime(repoDetails, t).text : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Username')}</DescriptionListTerm>
                <DescriptionListDescription>{repoDetails?.spec.username || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Privacy')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {repoDetails?.spec.password ? (
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
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default DetailsTab;
