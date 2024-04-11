import * as React from 'react';
import { Card, CardBody, CardTitle, GridItem } from '@patternfly/react-core';

import WithHelperText from '@app/components/common/WithHelperText';
import RepositoryResourceSyncList from '@app/components/ResourceSync/RepositoryResourceSyncList';
import { useTranslation } from 'react-i18next';

const ResourceSyncsTab = ({ repositoryId }: { repositoryId: string }) => {
  const { t } = useTranslation();
  return (
    <GridItem>
      <Card>
        <CardTitle>
          <WithHelperText
            showLabel
            ariaLabel={t('Resource syncs')}
            content={t(
              'Flight control will monitor the specified paths, import the defined fleets and synchronise devices',
            )}
          />
        </CardTitle>
        <CardBody>
          <RepositoryResourceSyncList repositoryId={repositoryId} />
        </CardBody>
      </Card>
    </GridItem>
  );
};

export default ResourceSyncsTab;
