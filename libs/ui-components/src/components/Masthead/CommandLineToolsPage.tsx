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
import { CliArtifact, CliArtifactTool } from '../../types/extraTypes';
import { getArtifactDownloadLabel, getArtifactUrl } from '../../utils/cliArtifacts';

const ToolArtifactsSection = ({
  tool,
  baseUrl,
  artifacts,
  description,
}: {
  tool: string;
  baseUrl: string;
  artifacts?: CliArtifact[];
  description: string;
}) => {
  const { t } = useTranslation();
  if (!artifacts || artifacts.length === 0) {
    return null;
  }
  return (
    <>
      <StackItem>
        <Title headingLevel="h2">{t('{{ tool }} Command Line Interface (CLI)', { tool })}</Title>
      </StackItem>
      <StackItem>{description}</StackItem>
      <StackItem>
        <List>
          {artifacts.map((cliArtifact) => {
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
      </StackItem>
    </>
  );
};

type CommandLineToolsContentProps = {
  productName: string;
  loading: boolean;
  loadError?: string;
  artifactsResponse?: CliArtifactsDisplayResponse;
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

  const { baseUrl, artifactsByTool } = artifactsResponse;

  return (
    <Stack hasGutter>
      <ToolArtifactsSection
        tool={CliArtifactTool.Flightctl}
        artifacts={artifactsByTool[CliArtifactTool.Flightctl]}
        baseUrl={baseUrl}
        description={t(
          'flightctl is the command-line interface for managing {{ productName }} fleets, devices, and workloads.',
          { productName },
        )}
      />
      <ToolArtifactsSection
        tool={CliArtifactTool.FlightctlBackup}
        artifacts={artifactsByTool[CliArtifactTool.FlightctlBackup]}
        baseUrl={baseUrl}
        description={t('flightctl-backup is a utility for creating backups of the {{ productName }} database.', {
          productName,
        })}
      />
      <ToolArtifactsSection
        tool={CliArtifactTool.FlightctlRestore}
        artifacts={artifactsByTool[CliArtifactTool.FlightctlRestore]}
        baseUrl={baseUrl}
        description={t(
          'flightctl-restore prepares devices after database restoration. Use when restoring {{ productName }} from backup.',
          {
            productName,
          },
        )}
      />
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
