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
import DetailsPageCard, { DetailsPageCardBody } from '../../DetailsPage/DetailsPageCard';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import EnrollmentRequestStatus from '../../Status/EnrollmentRequestStatus';
import WithHelperText from '../../common/WithHelperText';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';

import './EnrollmentRequestDetails.css';

const EnrollmentRequestDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { enrollmentRequestId } = useParams() as { enrollmentRequestId: string };
  const [er, loading, error, refetch] = useFetchPeriodically<EnrollmentRequest>({
    endpoint: `enrollmentrequests/${enrollmentRequestId}`,
  });
  const { remove } = useFetch();
  const navigate = useNavigate();
  const [canApprove] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST_APPROVAL, VERB.POST);
  const [canDelete] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST, VERB.DELETE);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);

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
      id={er?.metadata.name as string}
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
                  <DescriptionListDescription>{er?.metadata.name || '-'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Last seen')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {timeSinceText(t, er?.metadata.creationTimestamp)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('OS')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {er?.spec?.deviceStatus?.systemInfo?.operatingSystem || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Architecture')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {er?.spec?.deviceStatus?.systemInfo?.architecture || '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Default labels')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelsView prefix="er" labels={er?.spec.labels} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <EnrollmentRequestStatus er={er} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </FlightControlDescriptionList>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>
              <WithHelperText
                showLabel
                ariaLabel={t('Certificate signing request')}
                content={t('A PEM-encoded PKCS#10 certificate signing request.')}
              />
            </CardTitle>
            <DetailsPageCardBody>
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
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>
              <WithHelperText showLabel ariaLabel={t('Certificate')} content={t('A PEM-encoded signed certificate.')} />
            </CardTitle>
            <DetailsPageCardBody>
              {er?.status?.certificate ? (
                <TextArea
                  aria-label={t('Certificate')}
                  value={er.status.certificate}
                  readOnlyVariant="plain"
                  autoResize
                  className="fctl-enrollment-details__text-area"
                />
              ) : (
                <Bullseye>{t('Not available')}</Bullseye>
              )}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
        <GridItem md={6}>
          <DetailsPageCard>
            <CardTitle>{t('Conditions')}</CardTitle>
            <DetailsPageCardBody>
              {er && (
                <ConditionsTable
                  ariaLabel={t('Enrollment request conditions table')}
                  conditions={er.status?.conditions}
                />
              )}
            </DetailsPageCardBody>
          </DetailsPageCard>
        </GridItem>
      </Grid>
      {er && isApprovalModalOpen && (
        <ApproveDeviceModal
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

const EnrollmentRequestDetailsWithPermissions = () => {
  const [allowed, loading] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST, VERB.GET);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <EnrollmentRequestDetails />
    </PageWithPermissions>
  );
};

export default EnrollmentRequestDetailsWithPermissions;
