import * as React from 'react';
import { Button, Gallery, Stack, StackItem, Title } from '@patternfly/react-core';
import { ExpandableRowContent, Td, Tr } from '@patternfly/react-table';

import {
  ApiVersion,
  ExportFormatType,
  type ImageExport,
  ImageExportConditionReason,
  ImageExportConditionType,
} from '@flightctl/types/imagebuilder';
import { ConditionStatus } from '@flightctl/types';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { getAllExportFormats } from '../../../../../utils/imageBuilds';
import { getDateDisplay } from '../../../../../utils/dates';
import { type ImageExportAction, ViewImageBuildExportCard } from '../../../../ImageBuilds/ImageExportCards';
import { HealthyStatusPreview, SeeHowItLooksPreview } from '../../../guide/SeeHowItLooksPreview';
import { ListPreviewTable } from '../../../guide/ListPreviewTable';
import type { ApiTableColumn } from '../../../../Table/Table';

const fakeCreationDate = '2026-03-22T00:00:00Z';
const permissions: ImageExportAction[] = ['download', 'createExport'];

const exampleQcow2Export: ImageExport = {
  apiVersion: ApiVersion.ApiVersionV1alpha1,
  kind: 'ImageExport',
  metadata: {
    name: 'example-image-build-qcow2-export',
    creationTimestamp: fakeCreationDate,
  },
  spec: {
    format: ExportFormatType.ExportFormatTypeQCOW2,
    source: {
      type: 'imageBuild',
      imageBuildRef: 'example-image-build',
    },
  },
  status: {
    conditions: [
      {
        type: ImageExportConditionType.ImageExportConditionTypeReady,
        reason: ImageExportConditionReason.ImageExportConditionReasonCompleted,
        status: ConditionStatus.ConditionStatusTrue,
        lastTransitionTime: '',
        message: '',
      },
    ],
  },
};

const ImageBuildExportsPreview = () => (
  <Gallery hasGutter minWidths={{ default: '350px' }}>
    {getAllExportFormats().map((format) => {
      return (
        <ViewImageBuildExportCard
          key={format}
          format={format}
          imageExport={format === ExportFormatType.ExportFormatTypeQCOW2 ? exampleQcow2Export : undefined}
          imageReference={undefined}
          actionPermissions={permissions}
          activeAction={undefined}
          onCardAction={() => {}}
          onDismissError={() => {}}
        />
      );
    })}
  </Gallery>
);

const ImageBuildListPreviewRow = ({ columns }: { columns: ApiTableColumn[] }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const rowIndex = 0;

  return (
    <>
      <Tr data-testid="example-image-build-row" isContentExpanded={isExpanded}>
        <Td
          expand={{
            rowIndex,
            isExpanded,
            onToggle: () => setIsExpanded(!isExpanded),
          }}
        />
        <Td dataLabel={columns[0].name}>
          <Button variant="link" onClick={() => {}} isInline>
            {t('Example image build')}
          </Button>
        </Td>
        <Td dataLabel={columns[1].name}>registry.example.com/rhel-bootc:9.4</Td>
        <Td dataLabel={columns[2].name}>registry.example.com/org/edge-image:1.0.0</Td>
        <Td dataLabel={columns[3].name}>
          <HealthyStatusPreview label={t('Complete')} />
        </Td>
        <Td dataLabel={columns[4].name}>-</Td>
        <Td dataLabel={columns[5].name}>{getDateDisplay(fakeCreationDate)}</Td>
        <Td isActionCell />
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={8}>
          <ExpandableRowContent>
            <Stack hasGutter>
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 0 }}>
                      {t('Build information')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    <Button variant="link" isInline onClick={() => {}} isDisabled>
                      {t('View more')}
                    </Button>
                  </StackItem>
                </Stack>
              </StackItem>
              <StackItem>
                <ImageBuildExportsPreview />
              </StackItem>
            </Stack>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </>
  );
};

const ImageBuildListPreview = () => {
  const { t } = useTranslation();

  const columns = React.useMemo(
    () => [
      { name: t('Name') },
      { name: t('Base image') },
      { name: t('Image output') },
      { name: t('Build status') },
      { name: t('Promotion status') },
      { name: t('Date') },
    ],
    [t],
  );

  return (
    <SeeHowItLooksPreview title={t('Image builds')}>
      <ListPreviewTable columns={columns} isExpandable>
        <ImageBuildListPreviewRow columns={columns} />
      </ListPreviewTable>
    </SeeHowItLooksPreview>
  );
};

export default ImageBuildListPreview;
