import React from 'react';
import { Button, Icon, StackItem, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { LockIcon } from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { CodeBranchIcon } from '@patternfly/react-icons/dist/js/icons/code-branch-icon';
import { CodeIcon } from '@patternfly/react-icons/dist/js/icons/code-icon';
import { ServerIcon } from '@patternfly/react-icons/dist/js/icons/server-icon';

import { ConfigTemplate } from '../../../types/deviceSpec';

export type RepositorySourceDetails = {
  name?: string;
  details?: string;
  errorMessage?: string;
  type: ConfigTemplate['type'];
};

const RepositorySource = ({ sourceDetails }: { sourceDetails: RepositorySourceDetails }) => {
  if (sourceDetails.type === 'secret') {
    return (
      <StackItem>
        <LockIcon /> {sourceDetails.name}
      </StackItem>
    );
  }

  if (sourceDetails.type === 'inline') {
    return (
      <StackItem>
        <CodeIcon /> {sourceDetails.name}
      </StackItem>
    );
  }

  // Git configs and Http configs (both use repositories with an URL)
  return sourceDetails.errorMessage ? (
    <>
      <CodeBranchIcon /> {sourceDetails.name}{' '}
      <Tooltip content={sourceDetails.errorMessage}>
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      </Tooltip>
    </>
  ) : (
    <Button
      component="a"
      variant="link"
      isInline
      href={sourceDetails.details}
      target="_blank"
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
    >
      {sourceDetails.type === 'git' ? <CodeBranchIcon /> : <ServerIcon />} {sourceDetails.name || sourceDetails.details}
    </Button>
  );
};

export default RepositorySource;
