import * as React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';

import {
  ActionsColumn,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

// import axios from 'axios';

type enrollmentrequest = {
  fingerprint: string | null;
  hardware: string | null;
  request_time: string | null;
  target_fleet: string | null;
  target_labels: string | null;
  approver: string | null;
  approval_status: string | null;
  measurements: string;
  enrollment_status: string;
};

const dateFormatter = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  let dateObj;
  const epoch = Number(date);
  if (epoch) {
    dateObj = new Date(epoch * 1000);
  } else {
    dateObj = new Date(date);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
};

// SET THE COLUMNS HERE!!!
const columns = [
  { key: 'fingerprint', label: 'Fingerprint' },
  { key: 'request_time', label: 'Enrollment Request Time' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'measurements', label: 'System Measurement' },
  { key: 'approver', label: 'Approver' },
  { key: 'approval_status', label: 'Approval Status' },
  { key: 'target_fleet', label: 'Target Fleet' },
  { key: 'target_labels', label: 'Target Labels' },
  { key: 'enrollment_status', label: 'Enrollment Status' },
];

const tableCellData = (column, enrollmentrequest) => {
  const data = column.formatter ? column.formatter(enrollmentrequest[column.key]) : enrollmentrequest[column.key];
  if (column.key === 'fingerprint') {
    return <a href="#">{data}</a>;
  }
  return data;
};

const EnrollmentRequests: React.FunctionComponent = () => {
  const [enrollmentRequestData, setEnrollmentRequestData] = React.useState<enrollmentrequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  function getEvents() {
    // axios
    //   //.get('http://192.168.0.116/data.json')
    //   .get('/data.json')
    //   .then((response) => response.data)
    //   .then((data) => {
    //     setEnrollmentRequestData(data);
    //     setIsLoading(false);
    //   });
  }
  React.useEffect(() => {
    setIsLoading(true);
    getEvents();
    setInterval(getEvents, 10000);
  }, []);

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Enrollment Requests</Title>
      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.label}</Th>
            ))}
            <Td></Td>
          </Tr>
        </Thead>

        {enrollmentRequestData.length > 0 && (
          <Tbody>
            {enrollmentRequestData.map((enrollmentrequest) => (
              <Tr key={enrollmentrequest.fingerprint}>
                {columns.map((column) => (
                  <Td dataLabel={column.label} key={`${column.label}${enrollmentrequest.fingerprint}`}>
                    {tableCellData(column, enrollmentrequest)}
                  </Td>
                ))}
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Reboot',
                        onClick: () => alert(`Approve`),
                      },
                      {
                        title: 'Delete',
                        onClick: () => alert(`Deny`),
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        )}
      </Table>
      {isLoading ? <Spinner /> : null}
    </PageSection>
  );
};

export { EnrollmentRequests };
