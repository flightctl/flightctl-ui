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

type CommandLineToolsContentProps = {
  productName: string;
  loading: boolean;
  loadError?: string;
  artifactsResponse?: CliArtifactsResponse;
};

type CommandLineArtifact = CliArtifactsResponse['artifacts'][0];

// "Not implemented" response from the UI Proxy when artifact functionality is disabled
const cliArtifactsDisabledError = 'Error 501';

const getArtifactUrl = (baseUrl: string, artifact: CommandLineArtifact) => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${artifact.arch}/${artifact.os}/${artifact.filename}`;
};

const CommandLineToolsContent = ({
  productName,
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
  const { getCliArtifacts, settings } = useAppContext();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadError, setLoadError] = React.useState<string>();
  const [artifactsResponse, setCliArtifactsResponse] = React.useState<CliArtifactsResponse>();
  const [hasArtifactsEnabled, setArtifactsEnabled] = React.useState<boolean>(true);

  React.useEffect(() => {
    const getLinks = async () => {
      try {
        if (getCliArtifacts) {
          const apiResponse = await getCliArtifacts();
          setCliArtifactsResponse(apiResponse);
        }
      } catch (e) {
        const msg = getErrorMessage(e);
        if (msg.includes(cliArtifactsDisabledError)) {
          setArtifactsEnabled(false);
        } else {
          setLoadError(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    void getLinks();
  }, [getCliArtifacts]);

  const productName = settings.isRHEM ? t('Red Hat Edge Manager') : t('Flight Control');

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
            'With the {{ productName }} command line interface, you can manage your fleets, devices and repositories from a terminal.',
            {
              productName,
            },
          )}
        </StackItem>
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
