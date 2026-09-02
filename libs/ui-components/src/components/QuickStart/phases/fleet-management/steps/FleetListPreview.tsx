import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { HealthyStatusPreview, SeeHowItLooksPreview } from '../../../guide/SeeHowItLooksPreview';
import { ListPreviewTable } from '../../../guide/ListPreviewTable';
import type { ApiTableColumn } from '../../../../Table/Table';

const FleetListPreviewRow = ({ columns }: { columns: ApiTableColumn[] }) => {
  const { t } = useTranslation();

  return (
    <Tr data-testid="example-fleet-row">
      <Td dataLabel={columns[0].name}>
        <Button variant="link" onClick={() => {}} isInline>
          {t('Example fleet')}
        </Button>
      </Td>
      <Td dataLabel={columns[1].name}>registry/organization/edge-image:1.0.0</Td>
      <Td dataLabel={columns[2].name} style={{ minWidth: '11.5rem', whiteSpace: 'nowrap' }}>
        80/93
      </Td>
      <Td dataLabel={columns[3].name}>
        <HealthyStatusPreview label={t('Valid')} />
      </Td>
    </Tr>
  );
};

const FleetListPreview = () => {
  const { t } = useTranslation();

  const columns = React.useMemo(
    () => [{ name: t('Name') }, { name: t('System image') }, { name: t('Up-to-date/devices') }, { name: t('Status') }],
    [t],
  );
  return (
    <SeeHowItLooksPreview title={t('Fleets')}>
      <ListPreviewTable columns={columns}>
        <FleetListPreviewRow columns={columns} />
      </ListPreviewTable>
    </SeeHowItLooksPreview>
  );
};

export default FleetListPreview;
