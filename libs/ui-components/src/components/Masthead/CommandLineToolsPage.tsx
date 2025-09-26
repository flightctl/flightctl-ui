import * as React from 'react';
import {
  Alert,
  Button,
  Divider,
  Flex,
  FlexItem,
  List,
  ListItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import TechPreviewBadge from '../common/TechPreviewBadge';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';
import { CliArtifactsResponse } from '../../types/extraTypes';
import { getBrandName } from '../../utils/brand';

type CommandLineToolsContentProps = {
  brandName: string;
  loading: boolean;
  loadError?: string;
  artifactsResponse?: CliArtifactsResponse;
};

type CommandLineArtifact = CliArtifactsResponse['artifacts'][0];

const getArtifactUrl = (baseUrl: string, artifact: CommandLineArtifact) => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${artifact.arch}/${artifact.os}/${artifact.filename}`;
};

const CommandLineToolsContent = ({
  brandName,
  loading,
  loadError,
  artifactsResponse,
}: CommandLineToolsContentProps) => {
  const { t } = useTranslation();

  if (loading) {
    return <Spinner size="sm" />;
  }

  let errorMessage = loadError;

  const cliArtifacts = artifactsResponse?.artifacts || [];
  if (cliArtifacts.length === 0) {
    errorMessage = t('No {{ brandName }} command line tools were found for this deployment at this time.', {
      brandName,
    });
  }

  if (errorMessage) {
    return (
      <Alert
        isInline
        variant="danger"
        title={t('Could not list the {{ brandName }} command line tools', { brandName })}
      >
        {errorMessage}
      </Alert>
    );
  }

  return (
    <List>
      {cliArtifacts.map((cliArtifact) => {
        const linkText = t('Download flightctl CLI for {{ os }} for {{ arch }}', {
          os: cliArtifact.os,
          arch: cliArtifact.arch,
        });
        return (
          <ListItem key={cliArtifact.filename}>
            <Button
              component="a"
              variant="link"
              isInline
              href={getArtifactUrl(artifactsResponse?.baseUrl || '', cliArtifact)}
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

const CommandLineToolsPage = () => {
  const { t } = useTranslation();
  const { fetch, settings } = useAppContext();
  const proxyFetch = fetch.proxyFetch;

  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadError, setLoadError] = React.useState<string>();
  const [artifactsResponse, setCliArtifactsResponse] = React.useState<CliArtifactsResponse>();
  const [hasArtifactsEnabled, setArtifactsEnabled] = React.useState<boolean>(true);

  React.useEffect(() => {
    const getLinks = async () => {
      try {
        const response = await proxyFetch('cli-artifacts', {
          method: 'GET',
        });
        if (!response.ok) {
          if (response.status === 501) {
            // Response that indicatest that the feature is disabled
            setArtifactsEnabled(false);
          } else {
            setLoadError(getErrorMessage(response.statusText));
          }
          return;
        }
        const apiResponse = (await response.json()) as CliArtifactsResponse;
        setCliArtifactsResponse(apiResponse);
      } catch (e) {
        setArtifactsEnabled(false);
      } finally {
        setLoading(false);
      }
    };
    void getLinks();
  }, [proxyFetch]);

  const brandName = getBrandName(settings);

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Flex>
            <FlexItem>
              <Title headingLevel="h1">{t('Command Line Tools')}</Title>
            </FlexItem>
            <FlexItem>
              <TechPreviewBadge />
            </FlexItem>
          </Flex>
        </StackItem>
        <Divider className="pf-v5-u-my-lg" />
        <StackItem>
          {t(
            'With the {{ brandName }} command line interface, you can manage your fleets, devices and repositories from a terminal.',
            {
              brandName,
            },
          )}
        </StackItem>
        {hasArtifactsEnabled ? (
          <StackItem>
            <CommandLineToolsContent
              brandName={brandName}
              loading={loading}
              loadError={loadError}
              artifactsResponse={artifactsResponse}
            />
          </StackItem>
        ) : (
          <StackItem>
            {t('Command line tools are not available for download in this {{ brandName }} installation.', {
              brandName,
            })}
          </StackItem>
        )}
      </Stack>
    </PageSection>
  );
};

export default CommandLineToolsPage;
