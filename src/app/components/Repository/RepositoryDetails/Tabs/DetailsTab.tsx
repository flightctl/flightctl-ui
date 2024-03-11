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
import { CheckCircleIcon, ExternalLinkAltIcon, InfoCircleIcon } from '@patternfly/react-icons';

import StatusInfo from '@app/components/common/StatusInfo';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '@app/utils/status/repository';
import { Repository } from '@types';

const DetailsTab = ({ repoDetails }: { repoDetails: Repository }) => {
  return (
    <Grid hasGutter>
      <GridItem>
        <Card>
          <CardTitle>Details</CardTitle>
          <CardBody>
            <DescriptionList columnModifier={{ lg: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>Url</DescriptionListTerm>
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
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  {' '}
                  {repoDetails ? <StatusInfo statusInfo={getRepositorySyncStatus(repoDetails)} /> : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Last transition</DescriptionListTerm>
                <DescriptionListDescription>
                  {repoDetails ? getRepositoryLastTransitionTime(repoDetails) : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Username</DescriptionListTerm>
                <DescriptionListDescription>{repoDetails?.spec.username || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Password</DescriptionListTerm>
                <DescriptionListDescription>
                  {repoDetails?.spec.password ? (
                    <>
                      <Icon status="success">
                        <CheckCircleIcon />
                      </Icon>{' '}
                      Password is set
                    </>
                  ) : (
                    <>
                      <Icon status="info">
                        <InfoCircleIcon />
                      </Icon>{' '}
                      Password not set
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
