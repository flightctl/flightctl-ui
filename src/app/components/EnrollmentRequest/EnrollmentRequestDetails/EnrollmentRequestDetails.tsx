import ConditionsTable from '@app/components/DetailsPage/ConditionsTable';
import ContainersTable from '@app/components/DetailsPage/ContainersTable';
import DetailsPage from '@app/components/DetailsPage/DetailsPage';
import IntegrityTable from '@app/components/DetailsPage/IntegrityTable';
import SystemdTable from '@app/components/DetailsPage/SystemdTable';
import LabelsView from '@app/components/common/LabelsView';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { getDateDisplay } from '@app/utils/dates';
import { getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  MenuToggle,
  Stack,
  StackItem,
  TextArea,
} from '@patternfly/react-core';
import { EnrollmentRequest } from '@types';
import * as React from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

import './EnrollmentRequestDetails.css';
import { useFetch } from '@app/hooks/useFetch';
import DeviceEnrollmentModal from '../DeviceEnrollmentModal/DeviceEnrollmentModal';
import DetailsPageCard, { DetailsPageCardBody } from '@app/components/DetailsPage/DetailsPageCard';

const EnrollmentRequestDetails = () => {
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  const [er, loading, error, refetch] = useFetchPeriodically<EnrollmentRequest>({
    endpoint: `enrollmentrequests/${enrollmentRequestId}`,
  });
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const { remove } = useFetch();
  const navigate = useNavigate();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);

  const approvalStatus = getApprovalStatus(er);

  return (
    <DetailsPage
      loading={loading}
      error={error}
      title={er?.metadata.name}
      resourceLink="/devicemanagement/enrollmentrequests"
      resourceName="Enrollment requests"
    >
      <Stack hasGutter>
        <StackItem>
          <Dropdown
            isOpen={actionsOpen}
            onSelect={() => setActionsOpen(false)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                isExpanded={actionsOpen}
                onClick={() => setActionsOpen(!actionsOpen)}
                aria-label="Actions dropdown"
                variant="primary"
              >
                Actions
              </MenuToggle>
            )}
          >
            <DropdownList>
              <DropdownItem onClick={() => setIsApprovalModalOpen(true)} isDisabled={approvalStatus !== 'Pending'}>
                Approve
              </DropdownItem>
              <DropdownItem
                onClick={async () => {
                  await remove(`enrollmentrequests/${enrollmentRequestId}`);
                  navigate('/devicemanagement/enrollmentrequests');
                }}
              >
                Delete
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </StackItem>
        <StackItem>
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
                        <LabelsView labels={er?.metadata.labels} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Status</DescriptionListTerm>
                      <DescriptionListDescription>{approvalStatus}</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem md={6}>
              <DetailsPageCard>
                <CardTitle>Certificate signing request</CardTitle>
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
                <CardFooter>A PEM-encoded PKCS#10 certificate signing request.</CardFooter>
              </DetailsPageCard>
            </GridItem>
            <GridItem md={6}>
              <DetailsPageCard>
                <CardTitle>Certificate</CardTitle>
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
                <CardFooter>A PEM-encoded signed certificate.</CardFooter>
              </DetailsPageCard>
            </GridItem>
            <GridItem md={6}>
              <DetailsPageCard>
                <CardTitle>Conditions</CardTitle>
                <DetailsPageCardBody>
                  {er && <ConditionsTable conditions={er.status?.conditions} />}
                </DetailsPageCardBody>
              </DetailsPageCard>
            </GridItem>
            <GridItem md={6}>
              <DetailsPageCard>
                <CardTitle>Device conditions</CardTitle>
                <DetailsPageCardBody>
                  {er && <ConditionsTable conditions={er.spec.deviceStatus?.conditions} />}
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
        </StackItem>
      </Stack>
      {er && isApprovalModalOpen && (
        <DeviceEnrollmentModal
          enrollmentRequest={er}
          onClose={(updateList) => {
            setIsApprovalModalOpen(false);
            updateList && refetch();
          }}
        />
      )}
    </DetailsPage>
  );
};

export default EnrollmentRequestDetails;
