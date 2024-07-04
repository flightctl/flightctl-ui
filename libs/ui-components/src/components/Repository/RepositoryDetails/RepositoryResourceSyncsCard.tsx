import * as React from 'react';
import { Card, CardBody, CardTitle, GridItem } from '@patternfly/react-core';

import WithHelperText from '../../common/WithHelperText';
import RepositoryResourceSyncList from '../../ResourceSync/RepositoryResourceSyncList';
import { useTranslation } from '../../../hooks/useTranslation';

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
