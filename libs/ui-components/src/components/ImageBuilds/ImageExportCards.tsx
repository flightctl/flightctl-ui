import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Icon,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons/dist/js/icons/virtual-machine-icon';
import { CloudSecurityIcon } from '@patternfly/react-icons/dist/js/icons/cloud-security-icon';
import { ServerGroupIcon } from '@patternfly/react-icons/dist/js/icons/server-group-icon';
import { BuilderImageIcon } from '@patternfly/react-icons/dist/js/icons/builder-image-icon';

import { ExportFormatType, ImageExport, ImageExportConditionReason } from '@flightctl/types/imagebuilder';
import { getExportFormatDescription, getExportFormatLabel, getImageExportStatusReason } from '../../utils/imageBuilds';
import { getDateDisplay } from '../../utils/dates';
import { usePermissionsContext } from '../common/PermissionsContext';
import { RESOURCE, VERB } from '../../types/rbac';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';
import { ROUTE } from '../../hooks/useNavigate';
import { ImageExportStatusDisplay } from './ImageBuildAndExportStatus';

import './ImageExportCards.css';

const iconMap: Record<ExportFormatType, React.ReactElement> = {
  [ExportFormatType.ExportFormatTypeVMDK]: <VirtualMachineIcon />,
  [ExportFormatType.ExportFormatTypeQCOW2]: <CloudSecurityIcon />,
  [ExportFormatType.ExportFormatTypeQCOW2DiskContainer]: <BuilderImageIcon />,
  [ExportFormatType.ExportFormatTypeISO]: <ServerGroupIcon />,
};

export type ImageExportFormatCardProps = {
  imageBuildId: string;
  imageReference: string | undefined;
  format: ExportFormatType;
  error?: { message: string; mode: 'export' | 'download' } | null;
  imageExport?: ImageExport;
  onExportImage?: (format: ExportFormatType) => void;
  onDownload?: (format: ExportFormatType) => void;
  onDismissError: VoidFunction;
  isCreating: boolean;
  isDownloading?: boolean;
  isDisabled?: boolean;
};

type SelectImageBuildExportCardProps = {
  format: ExportFormatType;
  isChecked: boolean;
  onToggle: (format: ExportFormatType, isChecked: boolean) => void;
};

export const SelectImageBuildExportCard = ({ format, isChecked, onToggle }: SelectImageBuildExportCardProps) => {
  const { t } = useTranslation();
  const id = `export-format-${format}`;

  return (
    <Card id={id} isSelectable isSelected={isChecked} className="fctl-imageexport-card">
      <CardHeader
        selectableActions={{
          selectableActionId: format,
          selectableActionAriaLabelledby: id,
          name: format,
          onChange: () => onToggle(format, !isChecked),
        }}
      >
        <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem>
            <Icon size="xl">{iconMap[format]}</Icon>
          </FlexItem>
          <FlexItem>
            <Content>
              <Content component={ContentVariants.h2}>{getExportFormatLabel(t, format)}</Content>
            </Content>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>{getExportFormatDescription(t, format)}</CardBody>
    </Card>
  );
};

export const ViewImageBuildExportCard = ({
  imageBuildId,
  format,
  imageExport,
  imageReference,
  onExportImage,
  onDownload,
  onDismissError,
  isCreating = false,
  isDownloading = false,
  isDisabled = false,
  error,
}: ImageExportFormatCardProps) => {
  const { t } = useTranslation();
  const {
    router: { useNavigate: useRouterNavigate, appRoutes },
  } = useAppContext();
  const routerNavigate = useRouterNavigate();
  const exists = !!imageExport;
  const exportReason = exists ? getImageExportStatusReason(imageExport) : undefined;
  const { checkPermissions } = usePermissionsContext();
  const [canViewLogs] = checkPermissions([{ kind: RESOURCE.IMAGE_EXPORT_LOG, verb: VERB.GET }]);

  return (
    <Card isLarge className="fctl-imageexport-card">
      <CardHeader>
        <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem style={{ width: '100%' }}>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Icon size="xl">{iconMap[format]}</Icon>
              </FlexItem>
              {exists && (
                <FlexItem className="fctl-imageexport-card__status">
                  <ImageExportStatusDisplay
                    imageStatus={imageExport.status}
                    imageReference={
                      exportReason === ImageExportConditionReason.ImageExportConditionReasonCompleted
                        ? imageReference
                        : undefined
                    }
                  />
                </FlexItem>
              )}
            </Flex>
          </FlexItem>
          <FlexItem>
            <Content>
              <Content component={ContentVariants.h2}>{getExportFormatLabel(t, format)}</Content>
            </Content>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>{getExportFormatDescription(t, format)}</CardBody>
      <CardFooter>
        <Stack hasGutter>
          <StackItem>
            <Flex>
              {exportReason === ImageExportConditionReason.ImageExportConditionReasonFailed && onExportImage && (
                <FlexItem>
                  <Button
                    variant="primary"
                    onClick={() => onExportImage(format)}
                    isDisabled={isDisabled}
                    isLoading={isCreating}
                  >
                    {t('Retry')}
                  </Button>
                </FlexItem>
              )}
              {exportReason === ImageExportConditionReason.ImageExportConditionReasonCompleted && onDownload && (
                <FlexItem>
                  <Button
                    variant="secondary"
                    onClick={() => onDownload(format)}
                    isDisabled={isDisabled || isDownloading}
                    isLoading={isDownloading}
                  >
                    {isDownloading ? t('Downloading...') : t('Download')}
                  </Button>
                </FlexItem>
              )}
              {exists && canViewLogs && (
                <FlexItem>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const baseRoute = appRoutes[ROUTE.IMAGE_BUILD_DETAILS];
                      routerNavigate(`${baseRoute}/${imageBuildId}/logs`);
                    }}
                  >
                    {t('View logs')}
                  </Button>
                </FlexItem>
              )}
              {!exists && onExportImage && (
                <FlexItem>
                  <Button
                    variant="secondary"
                    onClick={() => onExportImage(format)}
                    isDisabled={isDisabled}
                    isLoading={isCreating}
                  >
                    {t('Export image')}
                  </Button>
                </FlexItem>
              )}
            </Flex>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.small}>
              {t('Created: {{date}}', { date: getDateDisplay(imageExport?.metadata.creationTimestamp) })}
            </Content>
          </StackItem>
          {error && (
            <AlertGroup isToast>
              <Alert
                variant="danger"
                title={
                  error.mode === 'export' ? t("We couldn't export your image") : t("We couldn't download your image")
                }
                actionClose={<AlertActionCloseButton onClose={onDismissError} />}
              >
                {t('Something went wrong on our end. Please review the error details and try again.')}
                <details>{error.message}</details>
              </Alert>
            </AlertGroup>
          )}
        </Stack>
      </CardFooter>
    </Card>
  );
};
