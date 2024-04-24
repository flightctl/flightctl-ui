import React from 'react';
import { Button, Icon, StackItem, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { LockIcon } from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { CodeBranchIcon } from '@patternfly/react-icons/dist/js/icons/code-branch-icon';
import { CodeIcon } from '@patternfly/react-icons/dist/js/icons/code-icon';

export type RepositorySourceDetails = {
  name?: string;
  url?: string;
  errorMessage?: string;
  type: 'git' | 'inline' | 'secret';
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

  // Git configs
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
      href={sourceDetails.url}
      target="_blank"
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
    >
      <CodeBranchIcon /> {sourceDetails.name || sourceDetails.url}
    </Button>
  );
};

export default RepositorySource;
