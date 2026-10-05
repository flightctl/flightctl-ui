import * as React from 'react';
import {
  CardBody,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Icon,
  Spinner,
} from '@patternfly/react-core';
import IdBadgeIcon from '@patternfly/react-icons/dist/js/icons/id-badge-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import type { Device } from '@flightctl/types';
import useDeviceLabelProvenance from '../../../hooks/useDeviceLabelProvenance';
import { useTranslation } from '../../../hooks/useTranslation';
import ResourceLink from '../../common/ResourceLink';
import WithTooltip from '../../common/WithTooltip';
import LabelWithHelperText from '../../common/WithHelperText';
import DetailsPageCard, { DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';
import EditLabelsForm, { ViewLabels } from '../../modals/EditLabelsModal/EditLabelsForm';
import DeviceFleet from './DeviceFleet';
import DeviceManagedLabels from './DeviceManagedLabels';
import SidebarDescriptionList from './SidebarDescriptionList';

import './DeviceDetailsTab.css';

type DeviceIdentityCardProps = {
  device: Required<Device>;
  refetch: VoidFunction;
  canEdit: boolean;
};

const DeviceLabelsSection = ({
  device,
  canEdit,
  refetch,
}: {
  device: Required<Device>;
  canEdit: boolean;
  refetch: VoidFunction;
}) => {
  const { t } = useTranslation();
  const { managedLabels, isLoading, error } = useDeviceLabelProvenance(device);

  if (isLoading || error) {
    return (
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Labels')}</DescriptionListTerm>
        <DescriptionListDescription>
          {error ? (
            <>
              <WithTooltip
                showTooltip
                content={t('Labels are read-only because some of them could be managed by the system.')}
              >
                <>
                  <Icon status="danger">
                    <ExclamationCircleIcon />
                  </Icon>{' '}
                  {t('Labels are read-only')}
                </>
              </WithTooltip>
              <ViewLabels device={device} managedLabels={[]} />
            </>
          ) : (
            <Spinner />
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    );
  }

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Labels')}</DescriptionListTerm>
        <DescriptionListDescription>
          {canEdit ? (
            <EditLabelsForm device={device} managedLabels={managedLabels.items} onDeviceUpdate={refetch} />
          ) : (
            <ViewLabels device={device} managedLabels={managedLabels.items} />
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {managedLabels.totalCount > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            <LabelWithHelperText
              label={t('Device-reported labels')}
              content={t(
                'Values promoted from device status by organization label sync mappings. They influence device selection and mapping, and cannot be edited on the device.',
              )}
            />
          </DescriptionListTerm>
          <DescriptionListDescription>
            <DeviceManagedLabels managedLabels={managedLabels} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </>
  );
};

const DeviceIdentityCard = ({
  device,
  refetch,
  canEdit,
  children,
}: React.PropsWithChildren<DeviceIdentityCardProps>) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <DetailsPageCardTitle title={t('Device identity')} icon={<IdBadgeIcon />} />
      <CardBody>
        <SidebarDescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>
              <ResourceLink id={device.metadata.name || '-'} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Fleet')}</DescriptionListTerm>
            <DescriptionListDescription>
              <DeviceFleet device={device} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DeviceLabelsSection device={device} canEdit={canEdit} refetch={refetch} />
          {children}
        </SidebarDescriptionList>
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceIdentityCard;
