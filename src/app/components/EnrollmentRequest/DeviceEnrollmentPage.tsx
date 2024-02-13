import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { EnrollmentRequest } from '@types';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeviceEnrollmentModal from './DeviceEnrollmentModal/DeviceEnrollmentModal';
import { Alert, Bullseye, Button, Modal, Spinner } from '@patternfly/react-core';
import { getErrorMessage } from '@app/utils/error';

const DeviceEnrollmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [er, loading, error] = useFetchPeriodically<EnrollmentRequest>({ endpoint: `enrollmentrequests/${id}` });
  const navigateToList = () => navigate('/devicemanagement/enrollmentrequests');
  if (error) {
    return (
      <Modal
        title="Device enrollment request"
        isOpen
        onClose={navigateToList}
        variant="small"
        actions={[
          <Button key="cancel" variant="secondary" onClick={navigateToList}>
            Close
          </Button>,
        ]}
      >
        <Alert title="An error occured" isInline variant="danger">
          {getErrorMessage(error)}
        </Alert>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return er && <DeviceEnrollmentModal enrollmentRequest={er} onClose={navigateToList} />;
};

export default DeviceEnrollmentPage;
