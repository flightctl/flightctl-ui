import * as React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

import { OsModeType } from '@flightctl/types';

import { useTranslation } from '../../../../../hooks/useTranslation';
import ResourceLink from '../../../../common/ResourceLink';
import OsModeContent from '../../../../common/OsModeContent';
import { HealthyStatusPreview, SeeHowItLooksPreview } from '../../../guide/SeeHowItLooksPreview';
import { ListPreviewTable } from '../../../guide/ListPreviewTable';
import type { ApiTableColumn } from '../../../../Table/Table';

const deviceId = 'fqq3u5mirgt1t25bb554vqeom4i10p149auphrk6o76sl59k4eeg';

const EnrolledDeviceListPreviewRow = ({ columns }: { columns: ApiTableColumn[] }) => {
  const { t } = useTranslation();

  return (
    <Tr data-testid="example-enrolled-device-row">
      <Td dataLabel={columns[0].name}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem>
            <OsModeContent osMode={OsModeType.OsModeImage} />
          </FlexItem>
          <FlexItem>
            <Button variant="link" onClick={() => {}} isInline>
              {t('Example device')}
            </Button>
          </FlexItem>
        </Flex>
      </Td>
      <Td dataLabel={columns[1].name}>
        <ResourceLink id={deviceId} />
      </Td>
      <Td dataLabel={columns[2].name}>{t('test-fleet')}</Td>
      <Td dataLabel={columns[3].name}>
        <HealthyStatusPreview label={t('Healthy')} />
      </Td>
      <Td dataLabel={columns[4].name}>
        <HealthyStatusPreview label={t('Online')} />
      </Td>
      <Td dataLabel={columns[5].name}>
        <HealthyStatusPreview label={t('Up to date')} />
      </Td>
    </Tr>
  );
};

const EnrolledDeviceListPreview = () => {
  const { t } = useTranslation();

  const columns = React.useMemo(
    () => [
      { name: t('Alias') },
      { name: t('Name') },
      { name: t('Fleet') },
      { name: t('Application status') },
      { name: t('Device status') },
      { name: t('Update status') },
    ],
    [t],
  );

  return (
    <SeeHowItLooksPreview title={t('Devices')}>
      <ListPreviewTable columns={columns}>
        <EnrolledDeviceListPreviewRow columns={columns} />
      </ListPreviewTable>
    </SeeHowItLooksPreview>
  );
};

export default EnrolledDeviceListPreview;
