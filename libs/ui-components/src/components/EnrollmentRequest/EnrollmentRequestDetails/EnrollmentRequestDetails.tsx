import * as React from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  TextArea,
} from '@patternfly/react-core';
import { EnrollmentRequest } from '@flightctl/types';

import ConditionsTable from '../../DetailsPage/Tables/ConditionsTable';
import DetailsPage from '../../DetailsPage/DetailsPage';
import LabelsView from '../../common/LabelsView';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { timeSinceText } from '../../../utils/dates';
import {
  EnrollmentRequestStatus as EnrollmentRequestStatusType,
  getApprovalStatus,
} from '../../../utils/status/enrollmentRequest';
import { useFetch } from '../../../hooks/useFetch';
import ApproveDeviceModal from '../../modals/ApproveDeviceModal/ApproveDeviceModal';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import EnrollmentRequestStatus from '../../Status/EnrollmentRequestStatus';
import LabelWithHelperText from '../../common/WithHelperText';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useDeviceSpecSystemInfo } from '../../../hooks/useDeviceSpecSystemInfo';
import { useAppContext } from '../../../hooks/useAppContext';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';

import './EnrollmentRequestDetails.css';

const enrollmentRequestDetailsPermissions = [
  { kind: RESOURCE.ENROLLMENT_REQUEST_APPROVAL, verb: VERB.UPDATE },
  { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.DELETE },
];

const EnrollmentRequestDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  const [er, loading, error] = useFetchPeriodically<EnrollmentRequest>({
    endpoint: `enrollmentrequests/${enrollmentRequestId}`,
  });
  const { remove } = useFetch();
  const navigate = useNavigate();
  const { checkPermissions } = usePermissionsContext();
  const [canApprove, canDelete] = checkPermissions(enrollmentRequestDetailsPermissions);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);
  const erSystemInfo = useDeviceSpecSystemInfo(er?.spec.deviceStatus?.systemInfo, t);
  const hasDefaultLabels = Object.keys(er?.spec.labels || {}).length > 0;
  const deviceId = er?.metadata.name as string;

  const { deleteAction, deleteModal } = useDeleteAction({
    resourceName: enrollmentRequestId,
    resourceType: 'Enrollment request',
    onDelete: async () => {
      await remove(`enrollmentrequests/${enrollmentRequestId}`);
      navigate(ROUTE.DEVICES);
    },
  });

  const approvalStatus = er ? getApprovalStatus(er) : '-';
  const isPendingApproval = approvalStatus === EnrollmentRequestStatusType.Pending;
  return (
    <DetailsPage
      loading={loading}
      error={error}
      id={deviceId}
      resourceLink={ROUTE.DEVICES}
      resourceType="Devices"
      resourceTypeLabel={t('Devices')}
      actions={
        (canApprove || canDelete) && (
          <DetailsPageActions>
            <DropdownList>
              {canApprove && (
                <DropdownItem onClick={() => setIsApprovalModalOpen(true)} isDisabled={!isPendingApproval}>
                  {t('Approve')}
                </DropdownItem>
              )}
              {canDelete && deleteAction}
            </DropdownList>
          </DetailsPageActions>
        )
      }
    >
      <Grid hasGutter>
        <GridItem md={12}>
          <Card>
            <CardTitle>{t('Details')}</CardTitle>
            <CardBody>
              <FlightControlDescriptionList columnModifier={{ lg: '3Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                  <DescriptionListDescription>{deviceId}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {timeSinceText(t, er?.metadata.creationTimestamp)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {hasDefaultLabels && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Labels')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <LabelsView prefix="er" labels={er?.spec.labels} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <EnrollmentRequestStatus er={er} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {erSystemInfo.baseInfo.map((systemInfo) => (
                  <DescriptionListGroup key={systemInfo.title}>
                    <DescriptionListTerm>{systemInfo.title}</DescriptionListTerm>
                    <DescriptionListDescription>{systemInfo.value}</DescriptionListDescription>
                  </DescriptionListGroup>
                ))}
              </FlightControlDescriptionList>
            </CardBody>
          </Card>
        </GridItem>
        {erSystemInfo.customInfo.length > 0 && (
          <GridItem md={6}>
            <DetailsPageCard>
              <CardTitle>{t('Custom data')}</CardTitle>
              <CardBody>
                <FlightControlDescriptionList columnModifier={{ lg: '3Col' }}>
                  {erSystemInfo.customInfo.map((systemInfo) => (
                    <DescriptionListGroup key={systemInfo.title}>
                      <DescriptionListTerm>{systemInfo.title}</DescriptionListTerm>
                      <DescriptionListDescription>{systemInfo.value}</DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </FlightControlDescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
        )}
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>
              <LabelWithHelperText
                label={t('Certificate signing request')}
                content={t('A PEM-encoded PKCS#10 certificate signing request.')}
              />
            </CardTitle>
            <CardBody>
              {er?.spec.csr ? (
                <TextArea
                  aria-label={t('Certificate Signing Request')}
                  value={er.spec.csr}
                  readOnlyVariant="plain"
                  autoResize
                  className="fctl-enrollment-details__text-area"
                />
              ) : (
                <Bullseye>{t('Not available')}</Bullseye>
              )}
            </CardBody>
          </DetailsPageCard>
        </GridItem>
        {er?.status?.certificate && (
          <GridItem md={6}>
            <DetailsPageCard>
              <CardTitle>
                <LabelWithHelperText label={t('Certificate')} content={t('A PEM-encoded signed certificate.')} />
              </CardTitle>
              <CardBody>
                <TextArea
                  aria-label={t('Certificate')}
                  value={er.status.certificate}
                  readOnlyVariant="plain"
                  autoResize
                  className="fctl-enrollment-details__text-area"
                />
              </CardBody>
            </DetailsPageCard>
          </GridItem>
        )}

        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('Conditions')}</CardTitle>
            <CardBody>
              {er && (
                <ConditionsTable
                  ariaLabel={t('Enrollment request conditions table')}
                  conditions={er.status?.conditions}
                />
              )}
            </CardBody>
          </DetailsPageCard>
        </GridItem>
      </Grid>
      {er && isApprovalModalOpen && (
        <ApproveDeviceModal
          enrollmentRequest={er}
          onClose={(isApproved) => {
            setIsApprovalModalOpen(false);
            isApproved && navigate({ route: ROUTE.DEVICE_DETAILS, postfix: deviceId });
          }}
        />
      )}
      {deleteModal}
    </DetailsPage>
  );
};

const EnrollmentRequestDetailsWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.GET }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <EnrollmentRequestDetails />
    </PageWithPermissions>
  );
};

export default EnrollmentRequestDetailsWithPermissions;
