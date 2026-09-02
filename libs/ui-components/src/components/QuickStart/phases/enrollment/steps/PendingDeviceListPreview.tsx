import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

import { useTranslation } from '../../../../../hooks/useTranslation';
import ResourceLink from '../../../../common/ResourceLink';
import { SeeHowItLooksPreview } from '../../../guide/SeeHowItLooksPreview';
import { ListPreviewTable } from '../../../guide/ListPreviewTable';
import type { ApiTableColumn } from '../../../../Table/Table';

const enrollmentRequestId = 'mul6f5j1qiak0nsm9bl4n3f32bo4eub6oemntql56daoupdli2n0';

const PendingDeviceListPreviewRow = ({ columns }: { columns: ApiTableColumn[] }) => {
  const { t } = useTranslation();

  return (
    <Tr data-testid="example-enrollment-request-row">
      <Td dataLabel={columns[0].name}>
        <Button variant="link" onClick={() => {}} isInline>
          {t('Device pending approval')}
        </Button>
      </Td>
      <Td dataLabel={columns[1].name}>
        <ResourceLink id={enrollmentRequestId} />
      </Td>
      <Td dataLabel={columns[2].name}>{t('2 hours ago')}</Td>
      <Td dataLabel={t('Approve')}>
        <Button variant="link" isInline onClick={() => {}} data-testid="enrollment-request-approve-button">
          {t('Approve')}
        </Button>
      </Td>
    </Tr>
  );
};

const PendingDeviceListPreview = () => {
  const { t } = useTranslation();

  const columns = React.useMemo(() => [{ name: t('Alias') }, { name: t('Name') }, { name: t('Created') }], [t]);

  return (
    <SeeHowItLooksPreview title={t('Devices pending approval')}>
      <ListPreviewTable columns={columns}>
        <PendingDeviceListPreviewRow columns={columns} />
      </ListPreviewTable>
    </SeeHowItLooksPreview>
  );
};

export default PendingDeviceListPreview;
