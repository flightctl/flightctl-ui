import * as React from 'react';
import { Button, Content, Flex, FlexItem, Icon, Stack, StackItem, Title } from '@patternfly/react-core';
import { ActionsColumn, ExpandableRowContent, IAction, OnSelect, Tbody, Td, Tr } from '@patternfly/react-table';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { ImageBuild, ImageBuildConditionReason } from '@flightctl/types/imagebuilder';
import { ImageBuildWithExports } from '../../types/extraTypes';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { getImageBuildImage, getImageBuildStatusReason } from '../../utils/imageBuilds';
import { getDateDisplay } from '../../utils/dates';
import ResourceLink from '../common/ResourceLink';
import ImageBuildExportsGallery from './ImageBuildDetails/ImageBuildExportsGallery';
import { ImageBuildStatusDisplay } from './ImageBuildAndExportStatus';

type ImageBuildRowProps = {
  imageBuild: ImageBuildWithExports;
  rowIndex: number;
  onRowSelect: (imageBuild: ImageBuild) => OnSelect;
  isRowSelected: (imageBuild: ImageBuild) => boolean;
  canCreate: boolean;
  canDelete: boolean;
  onDeleteClick: VoidFunction;
  refetch: VoidFunction;
};

const ImageBuildRow = ({
  imageBuild,
  rowIndex,
  onRowSelect,
  isRowSelected,
  onDeleteClick,
  canCreate,
  canDelete,
  refetch,
}: ImageBuildRowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const imageBuildName = imageBuild.metadata.name || '';
  const buildReason = getImageBuildStatusReason(imageBuild);

  const actions: IAction[] = [
    {
      title: t('View details'),
      onClick: () => {
        navigate({ route: ROUTE.IMAGE_BUILD_DETAILS, postfix: imageBuildName });
      },
    },
  ];

  if (canCreate) {
    actions.push({
      title: buildReason === ImageBuildConditionReason.ImageBuildConditionReasonFailed ? t('Retry') : t('Duplicate'),
      onClick: () => {
        navigate({ route: ROUTE.IMAGE_BUILD_EDIT, postfix: imageBuildName });
      },
    });
  }

  if (canDelete) {
    actions.push({
      title: t('Delete image build'),
      onClick: onDeleteClick,
    });
  }

  const sourceImage = getImageBuildImage(imageBuild.spec.source);
  const destinationImage = getImageBuildImage(imageBuild.spec.destination);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr isContentExpanded={isExpanded}>
        <Td
          select={{
            rowIndex,
            onSelect: onRowSelect(imageBuild),
            isSelected: isRowSelected(imageBuild),
          }}
        />
        <Td
          expand={{
            rowIndex,
            isExpanded,
            onToggle: () => setIsExpanded(!isExpanded),
          }}
        />
        <Td dataLabel={t('Name')}>
          <ResourceLink id={imageBuildName} routeLink={ROUTE.IMAGE_BUILD_DETAILS} />
        </Td>
        <Td dataLabel={t('Base image')}>{sourceImage}</Td>
        <Td dataLabel={t('Image output')}>{destinationImage}</Td>
        <Td dataLabel={t('Status')}>
          <ImageBuildStatusDisplay buildStatus={imageBuild.status} />
        </Td>
        <Td dataLabel={t('Export images')}>{`${imageBuild.exportsCount || 0}`}</Td>
        <Td dataLabel={t('Date')}>{getDateDisplay(imageBuild.metadata.creationTimestamp)}</Td>
        <Td isActionCell>
          <ActionsColumn items={actions} />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={9}>
          <ExpandableRowContent>
            <Stack hasGutter>
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 0 }}>
                      {t('Build information')}
                    </Title>
                  </StackItem>
                  {buildReason === ImageBuildConditionReason.ImageBuildConditionReasonFailed && (
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <Icon status="danger">
                          <ExclamationCircleIcon />
                        </Icon>
                      </FlexItem>
                      {canCreate ? (
                        <>
                          <FlexItem>
                            <Content>{t('Build failed. Please retry.')}</Content>
                          </FlexItem>
                          <FlexItem>
                            <Button
                              variant="link"
                              onClick={() => navigate({ route: ROUTE.IMAGE_BUILD_EDIT, postfix: imageBuildName })}
                            >
                              {t('Retry')}
                            </Button>
                          </FlexItem>
                        </>
                      ) : (
                        <FlexItem>
                          <Content>{t('Build failed.')}</Content>
                        </FlexItem>
                      )}
                    </Flex>
                  )}
                  <StackItem>
                    <Button
                      variant="link"
                      onClick={() => navigate({ route: ROUTE.IMAGE_BUILD_DETAILS, postfix: imageBuildName })}
                    >
                      {t('View more')}
                    </Button>
                  </StackItem>
                </Stack>
              </StackItem>
              <StackItem>
                <ImageBuildExportsGallery imageBuild={imageBuild} refetch={refetch} />
              </StackItem>
            </Stack>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default ImageBuildRow;
