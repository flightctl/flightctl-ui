import * as React from 'react';
import {
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';
import { CliArtifactsDisplayResponse, useCliArtifacts } from '../../hooks/useCliArtifacts';
import { CliArtifact } from '../../types/extraTypes';
import { getArtifactDownloadLabel, getArtifactUrl } from '../../utils/cliArtifacts';

type CommandLineToolsContentProps = {
  productName: string;
  loading: boolean;
  loadError?: string;
  artifactsResponse?: CliArtifactsDisplayResponse;
};

const ArtifactDownloadList = ({ baseUrl, items }: { baseUrl: string; items: CliArtifact[] }) => {
  const { t } = useTranslation();
  return (
    <List>
      {items.map((cliArtifact) => {
        const linkText = getArtifactDownloadLabel(cliArtifact, t);
        return (
          <ListItem key={cliArtifact.filename}>
            <Button
              component="a"
              variant="link"
              isInline
              href={getArtifactUrl(baseUrl, cliArtifact)}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
              aria-label={linkText}
            >
              {linkText}
            </Button>
          </ListItem>
        );
      })}
    </List>
  );
};

const CommandLineToolsContent = ({
  productName,
  loading,
  loadError,
  artifactsResponse,
}: CommandLineToolsContentProps) => {
  const { t } = useTranslation();

  if (loading || !artifactsResponse) {
    return <Spinner size="sm" />;
  }

  let errorMessage = loadError;

  if (artifactsResponse.totalCount === 0) {
    errorMessage = t('No {{ productName }} command line tools were found for this deployment at this time.', {
      productName,
    });
  }

  if (errorMessage) {
    return (
      <Alert
        isInline
        variant="danger"
        title={t('Could not list the {{ productName }} command line tools', { productName })}
      >
        {errorMessage}
      </Alert>
    );
  }

  const { baseUrl, flightctlArtifacts, restoreArtifacts } = artifactsResponse;

  return (
    <Stack hasGutter>
      {flightctlArtifacts.length > 0 ? (
        <>
          <StackItem>
            <Title headingLevel="h2">{t('flightctl Command Line Interface (CLI)')}</Title>
          </StackItem>
          <StackItem>
            {t(
              'flightctl is the command-line interface for managing {{ productName }} fleets, devices, and workloads.',
              { productName },
            )}
          </StackItem>
          <StackItem>
            <ArtifactDownloadList baseUrl={baseUrl} items={flightctlArtifacts} />
          </StackItem>
        </>
      ) : null}
      {restoreArtifacts.length > 0 ? (
        <>
          <StackItem>
            <Title headingLevel="h2">{t('flightctl-restore Command Line Interface (CLI)')}</Title>
          </StackItem>
          <StackItem>
            {t(
              'flightctl-restore prepares devices after database restoration. Use when restoring {{ productName }} from backup.',
              { productName },
            )}
          </StackItem>
          <StackItem>
            <ArtifactDownloadList baseUrl={baseUrl} items={restoreArtifacts} />
          </StackItem>
        </>
      ) : null}
    </Stack>
  );
};

const CommandLineToolsPage = () => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const { loading, loadError, hasArtifactsEnabled, artifactsResponse } = useCliArtifacts();

  const productName = settings.isRHEM ? t('Red Hat Edge Manager') : t('Flight Control');

  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1">{t('Command Line Tools')}</Title>
        </StackItem>
        <Divider />
        {hasArtifactsEnabled ? (
          <StackItem>
            <CommandLineToolsContent
              productName={productName}
              loading={loading}
              loadError={loadError}
              artifactsResponse={artifactsResponse}
            />
          </StackItem>
        ) : (
          <StackItem>
            {t('Command line tools are not available for download in this {{ productName }} installation.', {
              productName,
            })}
          </StackItem>
        )}
      </Stack>
    </PageSection>
  );
};

export default CommandLineToolsPage;
