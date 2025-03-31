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

type CommandLineTool = {
  os: string;
  arch: string;
  filename: string;
  sha256: string;
};
type CommandLineToolResponse = {
  baseUrl: string;
  artifacts: CommandLineTool[];
};

const waitForResult = async <T,>(time: number, result: T): Promise<T> => {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, time);
  });
};

const getCommandLineToolsResponse = async (): Promise<CommandLineToolResponse> => {
  // TODO change for the real call to fetch the deployment links
  return waitForResult(2000, {
    baseUrl: 'http://example.com',
    artifacts: [
      {
        os: 'linux',
        arch: 'amd64',
        filename: 'flightctl-linux-amd64.tar.gz',
        sha256: '886bc29bd272aff6375001eca2ced917fc4c57fc1e5d7d401987887391d7fe37',
      },
      {
        os: 'windows',
        arch: 'amd64',
        filename: 'flightctl-windows-amd64.zip',
        sha256: '27caedd083727ff78f1b5ed2fd680993468131a00a1979f88b780741968be926',
      },
      {
        os: 'mac',
        arch: 'amd64',
        filename: 'flightctl-darwin-amd64.zip',
        sha256: '22df84460dc719a7a812a952698c5188f2cb8c1b4e6dfa8ed077a624b52d2d00',
      },
      {
        os: 'windows',
        arch: 'arm64',
        filename: 'flightctl-windows-arm64.zip',
        sha256: 'a22f27b8ab3c9eec78ec4122416f47ef4255d38eba7c5c177131bcc322f77267',
      },
      {
        os: 'linux',
        arch: 'arm64',
        filename: 'flightctl-linux-arm64.tar.gz',
        sha256: '142de4c8558edc89e4d5a57a006d062bab6b7120b2f9da2d006066b4e2f28462',
      },
      {
        os: 'mac',
        arch: 'arm64',
        filename: 'flightctl-darwin-arm64.zip',
        sha256: 'f9da63b888d996b84d96c9fe99be793313fe7dcadfa5575386ac830516fedbf7',
      },
    ],
  } as CommandLineToolResponse);
};

type CommandLineToolsContentProps = {
  productName: string;
  loading: boolean;
  loadError?: string;
  cliToolsResponse?: CommandLineToolResponse;
};

const CommandLineToolsContent = ({
  productName,
  loading,
  loadError,
  cliToolsResponse,
}: CommandLineToolsContentProps) => {
  const { t } = useTranslation();

  if (loading) {
    return <Spinner size="sm" />;
  }

  const cliTools = cliToolsResponse?.artifacts || [];

  let errorMessage = loadError;
  if (cliTools.length === 0) {
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
      {cliTools.map((cliTool) => {
        return (
          <ListItem key={cliTool.sha256}>
            <Button
              component="a"
              variant="link"
              isInline
              href={`${cliToolsResponse?.baseUrl || ''}/${cliTool.filename}`}
              target="_blank"
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
            >
              {t('Download flightctl CLI for {{ os }} for {{ arch }}', { os: cliTool.os, arch: cliTool.arch })}
            </Button>
          </ListItem>
        );
      })}
    </List>
  );
};

const CommandLineToolsPage = () => {
  const { t } = useTranslation();
  const { settings } = useAppContext();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadError, setLoadError] = React.useState<string>();
  const [cliToolsResponse, setCliToolsResponse] = React.useState<CommandLineToolResponse>();

  React.useEffect(() => {
    const getLinks = async () => {
      try {
        const toolsResponse = await getCommandLineToolsResponse();
        setCliToolsResponse(toolsResponse);
      } catch (e) {
        setLoadError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    void getLinks();
  }, []);

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
        <StackItem>
          <CommandLineToolsContent
            productName={productName}
            loading={loading}
            loadError={loadError}
            cliToolsResponse={cliToolsResponse}
          />
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default CommandLineToolsPage;
