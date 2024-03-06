import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DropdownList,
  Grid,
  GridItem,
  Icon,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExternalLinkAltIcon, InfoCircleIcon, QuestionCircleIcon } from '@patternfly/react-icons';

import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Repository } from '@types';

import StatusInfo from '@app/components/common/StatusInfo';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '@app/utils/status/repository';
import RepositoryResourceSyncList from '@app/components/ResourceSync/RepositoryResourceSyncList';
import DetailsPage from '../DetailsPage/DetailsPage';
import DetailsPageActions, { useDeleteAction } from '../DetailsPage/DetailsPageActions';
import { useFetch } from '@app/hooks/useFetch';

const RepositoryDetails = () => {
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });

  const { remove } = useFetch();
  const navigate = useNavigate();
  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`repositories/${repositoryId}`);
      navigate('/administration/repositories');
    },
    resourceName: repositoryId,
    resourceType: 'Repository',
  });

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      title={repoDetails?.metadata.name}
      resourceLink="/administration/repositories"
      resourceName="Repositories"
    >
      <Stack hasGutter>
        <StackItem>
          <DetailsPageActions>
            <DropdownList>{deleteAction}</DropdownList>
          </DetailsPageActions>
        </StackItem>
        <StackItem>
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
            <GridItem>
              <Card>
                <CardTitle>
                  Resource syncs{' '}
                  <Tooltip
                    content={
                      <div>
                        Flight control will monitor the specified paths, import the defined fleets and synchronise
                        devices
                      </div>
                    }
                  >
                    <Icon status="info">
                      <QuestionCircleIcon />
                    </Icon>
                  </Tooltip>
                </CardTitle>
                <CardBody>
                  <RepositoryResourceSyncList repositoryId={repositoryId} />
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </StackItem>
      </Stack>
      {deleteModal}
    </DetailsPage>
  );
};

export default RepositoryDetails;
