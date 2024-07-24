import React from 'react';
import { Button, Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { ConfigTemplate } from '../../../types/deviceSpec';

export type RepositorySourceDetails = {
  name?: string;
  details?: string;
  errorMessage?: string;
  type: ConfigTemplate['type'];
};

const RepositorySource = ({ sourceDetails }: { sourceDetails: RepositorySourceDetails }) => {
  if (sourceDetails.errorMessage) {
    return (
      <>
        {sourceDetails.name}{' '}
        <Tooltip content={sourceDetails.errorMessage}>
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
        </Tooltip>
      </>
    );
  }
  if (['secret', 'inline'].includes(sourceDetails.type)) {
    return <>{sourceDetails.name}</>;
  }
  // Configurations related to a repository whose details could be obtained
  return (
    <Button
      component="a"
      variant="link"
      isInline
      href={sourceDetails.details}
      target="_blank"
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
    >
      {sourceDetails.name || sourceDetails.details}
    </Button>
  );
};

export default RepositorySource;
