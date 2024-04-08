import ConditionsTable from '@app/components/DetailsPage/Tables/ConditionsTable';
import ContainersTable from '@app/components/DetailsPage/Tables/ContainersTable';
import DetailsPage from '@app/components/DetailsPage/DetailsPage';
import IntegrityTable from '@app/components/DetailsPage/Tables/IntegrityTable';
import SystemdTable from '@app/components/DetailsPage/Tables/SystemdTable';
import LabelsView from '@app/components/common/LabelsView';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getDateDisplay } from '@app/utils/dates';
import { ApprovalStatus, getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  TextArea,
} from '@patternfly/react-core';
import { EnrollmentRequest } from '@types';
import * as React from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import { useFetch } from '@app/hooks/useFetch';
import DeviceEnrollmentModal from '../DeviceEnrollmentModal/DeviceEnrollmentModal';
import DetailsPageCard, { DetailsPageCardBody } from '@app/components/DetailsPage/DetailsPageCard';
import DetailsPageActions, { useDeleteAction } from '@app/components/DetailsPage/DetailsPageActions';
import EnrollmentRequestStatus from '@app/components/EnrollmentRequest/EnrollmentRequestStatus';
import WithHelperText from '@app/components/common/WithHelperText';

import './EnrollmentRequestDetails.css';

const EnrollmentRequestDetails = () => {
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  const [er, loading, error, refetch] = useFetchPeriodically<EnrollmentRequest>({
    endpoint: `enrollmentrequests/${enrollmentRequestId}`,
  });
  const { remove } = useFetch();
  const navigate = useNavigate();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);

  const { deleteAction, deleteModal } = useDeleteAction({
    resourceName: enrollmentRequestId,
    resourceType: 'Enrollment request',
    onDelete: async () => {
      await remove('enrollmentrequests', enrollmentRequestId);
      navigate('/devicemanagement/enrollmentrequests');
    },
  });

  const approvalStatus = er ? getApprovalStatus(er) : '-';

  return (
    <DetailsPage
      loading={loading}
      error={error}
      id={er?.metadata.name as string}
      resourceLink="/devicemanagement/devices"
      resourceType="Devices"
      actions={
        <DetailsPageActions>
          <DropdownList>
            <DropdownItem
              onClick={() => setIsApprovalModalOpen(true)}
              isDisabled={approvalStatus !== ApprovalStatus.Pending}
            >
              Approve
            </DropdownItem>
            {deleteAction}
          </DropdownList>
        </DetailsPageActions>
      }
    >
      <Grid hasGutter>
        <GridItem md={12}>
          <Card>
            <CardTitle>Details</CardTitle>
            <CardBody>
              <DescriptionList columnModifier={{ lg: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>Name</DescriptionListTerm>
                  <DescriptionListDescription>{er?.metadata.name || '-'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Created</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getDateDisplay(er?.metadata.creationTimestamp)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>OS</DescriptionListTerm>
                  <DescriptionListDescription>
                    {er?.spec?.deviceStatus?.systemInfo?.operatingSystem || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Architecture</DescriptionListTerm>
                  <DescriptionListDescription>
                    {er?.spec?.deviceStatus?.systemInfo?.architecture || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Labels</DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelsView prefix="er" labels={er?.metadata.labels} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Status</DescriptionListTerm>
                  <DescriptionListDescription>
                    <EnrollmentRequestStatus er={er} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>
              <WithHelperText
                showLabel
                ariaLabel="Certificate signing request"
                content="A PEM-encoded PKCS#10 certificate signing request."
              />
            </CardTitle>
            <DetailsPageCardBody>
              {er?.spec.csr ? (
                <TextArea
                  aria-label="CSR"
                  value={er.spec.csr}
                  readOnlyVariant="plain"
                  autoResize
                  className="fctl-enrollment-details__text-area"
                />
              ) : (
                <Bullseye>Not available</Bullseye>
              )}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>
              <WithHelperText showLabel ariaLabel="Certificate" content="A PEM-encoded signed certificate." />
            </CardTitle>
            <DetailsPageCardBody>
              {er?.status?.certificate ? (
                <TextArea
                  aria-label="Certificate"
                  value={er.status.certificate}
                  readOnlyVariant="plain"
                  autoResize
                  className="fctl-enrollment-details__text-area"
                />
              ) : (
                <Bullseye>Not available</Bullseye>
              )}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Conditions</CardTitle>
            <DetailsPageCardBody>
              {er && <ConditionsTable type="Enrollment request" conditions={er.status?.conditions} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Device conditions</CardTitle>
            <DetailsPageCardBody>
              {er && <ConditionsTable type="Device" conditions={er.spec.deviceStatus?.conditions} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Systemd units</CardTitle>
            <DetailsPageCardBody>
              {er && <SystemdTable systemdUnits={er?.spec.deviceStatus?.systemdUnits} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>Containers</CardTitle>
            <DetailsPageCardBody>
              {er && <ContainersTable containers={er.spec.deviceStatus?.containers} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>System integrity measurements</CardTitle>
            <DetailsPageCardBody>
              {er && <IntegrityTable measurements={er.spec.deviceStatus?.systemInfo?.measurements} />}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
      </Grid>
      {er && isApprovalModalOpen && (
        <DeviceEnrollmentModal
          enrollmentRequest={er}
          onClose={(updateList) => {
            setIsApprovalModalOpen(false);
            updateList && refetch();
          }}
        />
      )}
      {deleteModal}
    </DetailsPage>
  );
};

export default EnrollmentRequestDetails;
