import * as React from 'react';
import { TFunction } from 'react-i18next';
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

import { ExportFormatType } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  hasImageBuildFailed,
  isImageBuildComplete,
  isImageExportFailed,
  shouldHaveImageBuildLogs,
  shouldHaveImageExportLogs,
} from '../../../utils/imageBuilds';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { LogResourceType, useImageBuildLogs } from '../useImageBuildLogs';
import { StatusDisplayContent } from '../../Status/StatusDisplay';
import { StatusLevel } from '../../../utils/status/common';

type LogEntity = {
  type: LogResourceType;
  id: string;
  label: string;
  isActive: boolean;
  isFailed: boolean;
};

const getExportFormatText = (t: TFunction, format: ExportFormatType) => {
  switch (format) {
    case ExportFormatType.ExportFormatTypeVMDK:
      return t('Virtualization (VMDK)');
    case ExportFormatType.ExportFormatTypeQCOW2:
      return t('OpenStack/KVM (QCOW2)');
    case ExportFormatType.ExportFormatTypeQCOW2DiskContainer:
      return t('OpenShift Virtualization (QCOW2)');
    case ExportFormatType.ExportFormatTypeISO:
      return t('Metal installer (ISO)');
  }
};

const ImageBuildAndExportLogStatus = ({ isActive, isFailed }: { isActive: boolean; isFailed: boolean }) => {
  const { t } = useTranslation();
  let label: string;
  let level: StatusLevel;
  if (isFailed) {
    level = 'danger';
    label = t('Failed');
  } else if (isActive) {
    level = 'info';
    label = t('In progress');
  } else {
    level = 'success';
    label = t('Completed');
  }
  return <StatusDisplayContent label={label} level={level} />;
};

const ImageBuildLogsTab = ({ imageBuild }: { imageBuild: ImageBuildWithExports }) => {
  const { t } = useTranslation();
  const [isLogSelectOpen, setIsLogSelectOpen] = React.useState(false);
  const logsRef = React.useRef<HTMLTextAreaElement>(null);

  const { selectableEntities, hasExports } = React.useMemo(() => {
    const entities: LogEntity[] = [];
    const buildName = imageBuild.metadata.name as string;
    entities.push({
      type: LogResourceType.BUILD,
      id: buildName,
      label: buildName,
      isActive: shouldHaveImageBuildLogs(imageBuild),
      isFailed: hasImageBuildFailed(imageBuild),
    });

    // ImageExports can only exist once the ImageBuild is complete
    if (!isImageBuildComplete(imageBuild)) {
      return { selectableEntities: entities, availableExportFormats: [] as ExportFormatType[], failedExportsCount: 0 };
    }

    let hasExports = false;
    imageBuild.imageExports.forEach((ie) => {
      const format = ie?.spec.format;
      if (format) {
        const isFailed = isImageExportFailed(ie);
        hasExports = true;
        entities.push({
          type: LogResourceType.EXPORT,
          id: ie.metadata.name as string,
          label: getExportFormatText(t, format),
          isActive: shouldHaveImageExportLogs(ie),
          isFailed,
        });
      }
    });
    return {
      selectableEntities: entities,
      hasExports,
    };
  }, [imageBuild, t]);

  const [selectedEntityId, setSelectedEntityId] = React.useState<string>(imageBuild.metadata.name as string);
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
                            <MenuItem
                              key={entity.id}
                              itemId={entity.id}
                              isSelected={selectedEntityId === entity.id}
                              description={entity.id}
                            >
                              {entity.label}
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
                <ImageBuildAndExportLogStatus isActive={selectedEntity.isActive} isFailed={selectedEntity.isFailed} />
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
