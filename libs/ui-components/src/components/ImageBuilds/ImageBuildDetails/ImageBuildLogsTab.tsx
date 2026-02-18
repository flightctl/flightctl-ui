import * as React from 'react';
import {
  Alert,
  Bullseye,
  Card,
  CardBody,
  Divider,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuToggle,
  Select,
  Spinner,
  Stack,
  StackItem,
  TextArea,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { ExportFormatType, ImageBuildConditionReason, ImageExportConditionReason } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  getExportFormatLabel,
  getImageBuildStatusReason,
  getImageExportStatusReason,
  isImageBuildActiveReason,
  isImageExportActiveReason,
} from '../../../utils/imageBuilds';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { LogResourceType, useImageBuildLogs } from '../useImageBuildLogs';
import { StatusDisplayContent } from '../../Status/StatusDisplay';
import { StatusLevel } from '../../../utils/status/common';
import { useAppContext } from '../../../hooks/useAppContext';

export const IMAGE_EXPORT_ID_PARAM = 'exportId';

type LogEntity = {
  type: LogResourceType;
  id: string;
  label: string;
  isActive: boolean;
  status: ImageBuildConditionReason | ImageExportConditionReason;
};

const ImageBuildAndExportLogStatus = ({
  status,
}: {
  status: ImageBuildConditionReason | ImageExportConditionReason;
}) => {
  const { t } = useTranslation();
  let label: string;
  let level: StatusLevel;
  if (status === ImageBuildConditionReason.ImageBuildConditionReasonCompleted) {
    level = 'success';
    label = t('Completed');
  } else if (status === ImageBuildConditionReason.ImageBuildConditionReasonFailed) {
    level = 'danger';
    label = t('Failed');
  } else if (
    status === ImageBuildConditionReason.ImageBuildConditionReasonCanceling ||
    status === ImageBuildConditionReason.ImageBuildConditionReasonCanceled
  ) {
    level = 'warning';
    label = t('Canceled');
  } else {
    level = 'info';
    label = t('In progress');
  }
  return <StatusDisplayContent label={label} level={level} />;
};

const ImageBuildLogsTab = ({ imageBuild }: { imageBuild: ImageBuildWithExports }) => {
  const { t } = useTranslation();
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const [isLogSelectOpen, setIsLogSelectOpen] = React.useState(false);
  const logsRef = React.useRef<HTMLTextAreaElement>(null);

  const buildName = imageBuild.metadata.name as string;

  const { selectableEntities, hasExports } = React.useMemo(() => {
    const entities: LogEntity[] = [];

    const buildReason = getImageBuildStatusReason(imageBuild);
    entities.push({
      type: LogResourceType.BUILD,
      id: buildName,
      label: t('Image build'),
      isActive: isImageBuildActiveReason(buildReason),
      status: buildReason,
    });

    // ImageExports can only exist once the ImageBuild is complete
    if (buildReason !== ImageBuildConditionReason.ImageBuildConditionReasonCompleted) {
      return { selectableEntities: entities, availableExportFormats: [] as ExportFormatType[], failedExportsCount: 0 };
    }

    let hasExports = false;
    imageBuild.imageExports.forEach((ie) => {
      const format = ie?.spec.format;
      if (format) {
        const exportReason = getImageExportStatusReason(ie);
        hasExports = true;
        entities.push({
          type: LogResourceType.EXPORT,
          id: ie.metadata.name as string,
          label: getExportFormatLabel(t, format),
          isActive: isImageExportActiveReason(exportReason),
          status: exportReason,
        });
      }
    });
    return {
      selectableEntities: entities,
      hasExports,
    };
  }, [imageBuild, buildName, t]);

  const [selectedEntityId, setSelectedEntityId] = React.useState<string>(() => {
    const selectedId = searchParams.get(IMAGE_EXPORT_ID_PARAM);
    if (selectedId && selectableEntities.some((e) => e.id === selectedId)) {
      return selectedId;
    }
    return buildName;
  });
  const selectedEntity = selectableEntities.find((entity) => entity.id === selectedEntityId) || selectableEntities[0];
  const { logs, isLoading, error, isStreaming } = useImageBuildLogs(
    selectedEntity.id,
    selectedEntity.type,
    selectedEntity.isActive,
  );

  const onLogSourceSelected = React.useCallback(
    (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
      if (value) {
        setSelectedEntityId(value as string);
      }
      setIsLogSelectOpen(false);
    },
    [],
  );

  React.useEffect(() => {
    // For live logs (when they are streaming), we auto-scroll to the bottom.
    // For completed logs, we show the logs with scroll at the top
    if (logsRef.current && logs && isStreaming) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, isStreaming]);

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Bullseye>
            <Spinner size="xl" />
          </Bullseye>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert variant="danger" title={t('Failed to load logs')}>
            {error.message}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" title={t('For built and failed export tasks, only the last 500 lines are available.')} />
      </StackItem>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignStart' }}>
              <ToolbarItem>
                <Select
                  toggle={(toggleRef: React.RefObject<HTMLButtonElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsLogSelectOpen(!isLogSelectOpen)}
                      isExpanded={isLogSelectOpen}
                    >
                      {selectedEntity.label}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                  onSelect={onLogSourceSelected}
                  selected={selectedEntityId}
                  isOpen={isLogSelectOpen}
                  onOpenChange={(isOpen) => setIsLogSelectOpen(isOpen)}
                >
                  <MenuContent>
                    <MenuGroup label={t('Image build')} labelHeadingLevel="h3">
                      <MenuList>
                        {selectableEntities
                          .filter((entity) => entity.type === LogResourceType.BUILD)
                          .map((entity) => (
                            <MenuItem key={entity.id} itemId={entity.id} isSelected={selectedEntityId === entity.id}>
                              {entity.id}
                            </MenuItem>
                          ))}
                      </MenuList>
                    </MenuGroup>
                    <Divider />
                    <MenuGroup label={t('Export image')} labelHeadingLevel="h3">
                      <MenuList>
                        {selectableEntities
                          .filter((entity) => entity.type === LogResourceType.EXPORT)
                          .map((entity) => (
                            <MenuItem
                              key={entity.id}
                              itemId={entity.id}
                              isSelected={selectedEntityId === entity.id}
                              description={entity.id}
                            >
                              {entity.label}
                            </MenuItem>
                          ))}
                        {!hasExports && (
                          <MenuItem key="all" itemId="all" isSelected={selectedEntityId === 'all'} isDisabled>
                            {t('Export tasks logs are only available after the image build is completed')}
                          </MenuItem>
                        )}
                      </MenuList>
                    </MenuGroup>
                  </MenuContent>
                </Select>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                <ImageBuildAndExportLogStatus status={selectedEntity.status} />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </StackItem>

      <StackItem>
        <Divider />
        <TextArea
          aria-label={t('Image build logs')}
          style={{ height: '70vh' }}
          ref={logsRef}
          value={logs || ''}
          readOnly
          resizeOrientation="vertical"
        />
      </StackItem>
    </Stack>
  );
};

export default ImageBuildLogsTab;
