import * as React from 'react';
import EnrollmentRequestDetails from '@flightctl/ui-components/src/components/EnrollmentRequest/EnrollmentRequestDetails/EnrollmentRequestDetails';
import WithPageLayout from '../common/WithPageLayout';

const EnrollmentRequestDetailsPage = () => {
  return (
    <WithPageLayout>
      <EnrollmentRequestDetails />
    </WithPageLayout>
  );
};

export default EnrollmentRequestDetailsPage;
