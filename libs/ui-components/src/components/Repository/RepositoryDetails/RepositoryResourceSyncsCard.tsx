import * as React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import LabelWithHelperText from '../../common/WithHelperText';
import RepositoryResourceSyncList from '../../ResourceSync/RepositoryResourceSyncList';
import { useTranslation } from '../../../hooks/useTranslation';

const ResourceSyncsTab = ({ repositoryId }: { repositoryId: string }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardTitle>
        <LabelWithHelperText
          label={t('Resource syncs')}
          content={t(
            'Edge Manager will monitor the specified paths, import the defined fleets and synchronise devices',
          )}
        />
      </CardTitle>
      <CardBody>
        <RepositoryResourceSyncList repositoryId={repositoryId} />
      </CardBody>
    </Card>
  );
};

export default ResourceSyncsTab;
