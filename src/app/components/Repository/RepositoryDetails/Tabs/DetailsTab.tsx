import * as React from 'react';
import {
  Button,
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
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import StatusInfo from '@app/components/common/StatusInfo';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '@app/utils/status/repository';
import { Repository } from '@types';
import { useTranslation } from 'react-i18next';

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
                  <Button
                    component="a"
                    variant="link"
                    isInline
                    href={repoDetails?.spec.repo}
                    target="_blank"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                  >
                    {repoDetails?.spec.repo}
                  </Button>
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
                  {repoDetails ? getRepositoryLastTransitionTime(repoDetails).text : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Username')}</DescriptionListTerm>
                <DescriptionListDescription>{repoDetails?.spec.username || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Password')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {repoDetails?.spec.password ? (
                    <>
                      <Icon status="success">
                        <CheckCircleIcon />
                      </Icon>{' '}
                      {t('Password is set')}
                    </>
                  ) : (
                    <>
                      <Icon status="info">
                        <InfoCircleIcon />
                      </Icon>{' '}
                      {t('Password not set')}
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
