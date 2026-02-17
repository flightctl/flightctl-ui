import * as React from 'react';
import { TFunction } from 'react-i18next';
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
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
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
import { useTranslation } from '../../hooks/useTranslation';
import ConfirmImageExportActionModal, {
  ConfirmImageExportAction,
} from './ConfirmImageExportModal/ConfirmImageExportModal';
import { ImageExportStatusDisplay } from './ImageBuildAndExportStatus';

import './ImageExportCards.css';

export type ImageExportAction = 'cancel' | 'delete' | 'viewLogs' | 'download' | 'retry' | 'rebuild' | 'createExport';

const getActionsForStatus = (
  exportReason: ImageExportConditionReason | undefined,
  actionPermissions: ImageExportAction[],
): ImageExportAction[] => {
  const actions: ImageExportAction[] = [];
  switch (exportReason) {
    case ImageExportConditionReason.ImageExportConditionReasonPending:
      actions.push('cancel', 'delete');
      break;
    case ImageExportConditionReason.ImageExportConditionReasonConverting:
    case ImageExportConditionReason.ImageExportConditionReasonPushing:
      actions.push('cancel', 'viewLogs');
      break;
    case ImageExportConditionReason.ImageExportConditionReasonCompleted:
      actions.push('download', 'viewLogs', 'delete', 'rebuild');
      break;
    case ImageExportConditionReason.ImageExportConditionReasonFailed:
    case ImageExportConditionReason.ImageExportConditionReasonCanceled:
      actions.push('retry', 'viewLogs', 'delete');
      break;
    case ImageExportConditionReason.ImageExportConditionReasonCanceling:
      actions.push('viewLogs');
      break;
    default:
      actions.push('createExport');
      break;
  }
  return actions.filter((action) => actionPermissions.includes(action));
};

const getErrorTitle = (t: TFunction, action: ImageExportAction) => {
  switch (action) {
    case 'createExport':
      return t("We couldn't export your image");
    case 'download':
      return t("We couldn't download your image");
    case 'cancel':
      return t("We couldn't cancel your image export");
    case 'delete':
      return t("We couldn't delete your image export");
    default:
      return t("We couldn't perform the action you requested");
  }
};

const getActionTitle = (t: TFunction, action: ImageExportAction, inProgress: boolean) => {
  switch (action) {
    case 'cancel':
      return inProgress ? t('Canceling...') : t('Cancel');
    case 'delete':
      return inProgress ? t('Deleting...') : t('Delete');
    case 'viewLogs':
      return t('View logs');
    case 'download':
      return inProgress ? t('Downloading...') : t('Download');
    case 'retry':
      return inProgress ? t('Retrying...') : t('Retry');
    case 'rebuild':
      return inProgress ? t('Rebuilding...') : t('Rebuild');
    case 'createExport':
      return inProgress ? t('Exporting...') : t('Export image');
    default:
      return t('Actions');
  }
};
const iconMap: Record<ExportFormatType, React.ReactElement> = {
  [ExportFormatType.ExportFormatTypeVMDK]: <VirtualMachineIcon />,
  [ExportFormatType.ExportFormatTypeQCOW2]: <CloudSecurityIcon />,
  [ExportFormatType.ExportFormatTypeQCOW2DiskContainer]: <BuilderImageIcon />,
  [ExportFormatType.ExportFormatTypeISO]: <ServerGroupIcon />,
};

export type ImageExportFormatCardProps = {
  imageReference: string | undefined;
  format: ExportFormatType;
  imageExport?: ImageExport;
  actionPermissions: ImageExportAction[];
  activeAction: ImageExportAction | undefined;
  onCardAction: ({ format, action }: { format: ExportFormatType; action: ImageExportAction }) => void;
  error?: { message: string; action: ImageExportAction } | null;
  onDismissError: VoidFunction;
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
  format,
  imageExport,
  imageReference,
  actionPermissions,
  onCardAction,
  activeAction,
  error,
  onDismissError,
}: ImageExportFormatCardProps) => {
  const { t } = useTranslation();
  const [actionsDropdownOpen, setActionsDropdownOpen] = React.useState(false);
  const [pendingConfirmAction, setPendingConfirmAction] = React.useState<ConfirmImageExportAction>();
  const exists = !!imageExport;
  const exportReason = exists ? getImageExportStatusReason(imageExport) : undefined;

  const handleCardAction = (action: ImageExportAction) => {
    if (
      action === 'cancel' ||
      action === 'delete' ||
      (action === 'rebuild' && exportReason === ImageExportConditionReason.ImageExportConditionReasonCompleted)
    ) {
      setPendingConfirmAction(action);
    } else {
      onCardAction({ format, action });
    }
  };

  const handleConfirmAction = (isConfirmed: boolean) => {
    if (pendingConfirmAction && isConfirmed) {
      onCardAction({ format, action: pendingConfirmAction });
    }
    setPendingConfirmAction(undefined);
  };

  const { primaryAction, remainingActions } = React.useMemo(() => {
    const allActions = getActionsForStatus(exportReason, actionPermissions);
    const primaryAction = allActions.length > 0 ? allActions[0] : undefined;
    const remainingActions = allActions.length > 1 ? allActions.slice(1) : [];
    return { primaryAction, remainingActions };
  }, [exportReason, actionPermissions]);

  const renderActionButton = (exportAction: ImageExportAction, variant: 'primary' | 'secondary' = 'secondary') => {
    const isDisabled = activeAction !== undefined;
    const isLoading = exportAction === activeAction;

    return (
      <Button
        variant={variant}
        onClick={() => handleCardAction(exportAction)}
        isDisabled={isDisabled}
        isLoading={isLoading}
      >
        {getActionTitle(t, exportAction, isLoading)}
      </Button>
    );
  };

  const renderDropdownItem = (exportAction: ImageExportAction) => {
    const isDisabled = activeAction !== undefined;
    const isLoading = exportAction === activeAction;

    return (
      <DropdownItem
        key={exportAction}
        onClick={() => {
          setActionsDropdownOpen(false);
          handleCardAction(exportAction);
        }}
        isDisabled={isDisabled}
        isLoading={isLoading}
      >
        {getActionTitle(t, exportAction, false)}
      </DropdownItem>
    );
  };

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
            {primaryAction && (
              <Flex>
                <FlexItem>{renderActionButton(primaryAction)}</FlexItem>
                {remainingActions.length === 1 && <FlexItem>{renderActionButton(remainingActions[0])}</FlexItem>}
                {remainingActions.length > 1 && (
                  <FlexItem>
                    <Dropdown
                      isOpen={actionsDropdownOpen}
                      onSelect={() => setActionsDropdownOpen(false)}
                      onOpenChange={(isOpen: boolean) => setActionsDropdownOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          isExpanded={actionsDropdownOpen}
                          onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                          variant="secondary"
                          isDisabled={activeAction !== undefined}
                        >
                          {t('Actions')}
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>{remainingActions.map((actionKey) => renderDropdownItem(actionKey))}</DropdownList>
                    </Dropdown>
                  </FlexItem>
                )}
              </Flex>
            )}
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
                title={getErrorTitle(t, error.action)}
                actionClose={<AlertActionCloseButton onClose={onDismissError} />}
              >
                {t('Something went wrong on our end. Please review the error details and try again.')}
                <details>{error.message}</details>
              </Alert>
            </AlertGroup>
          )}
        </Stack>
      </CardFooter>
      {pendingConfirmAction && (
        <ConfirmImageExportActionModal action={pendingConfirmAction} onClose={handleConfirmAction} />
      )}
    </Card>
  );
};
