import * as React from 'react';
import { fetchData, tableCellData, deleteObject, approveEnrollmentRequest } from '@app/utils/commonFunctions'; 
import { useAuth } from 'react-oidc-context';
import { enrollmentrequestList } from '@app/utils/commonDataTypes';
import {
  PageSection,
  Spinner,
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

interface EnrollmentRequest {
  metadata: {
    name: string
  }
}

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
  { key: 'metadata.name', label: 'Fingerprint' },
  { key: 'metadata.creationTimestamp', label: 'Enrollment Request Time' },
  { key: 'spec.deviceStatus.systemInfo.operatingSystem', label: 'Hardware' },
  { key: 'status.conditions[0].reason', label: 'Approver' },
  { key: 'status.conditions[0].status', label: 'Approval Status' },
  { key: 'status.conditions[0].type', label: 'Enrollment Status' },
];



const EnrollmentRequests: React.FunctionComponent = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [enrollmentRequestsData, setEnrollmentRequestsData] = React.useState<enrollmentrequestList>({ items: [] });
  function getEvents() {
    fetchData('enrollmentrequests', auth.user?.access_token ?? '').then((data) => {

      setEnrollmentRequestsData(data);
      setIsLoading(false);
    });
  }

  React.useEffect(() => {
    setIsLoading(true);
    getEvents();
    const interval = setInterval(() => {
      getEvents();
    }, 10000);
    return clearInterval(interval);
  },[auth]);



  const generateActions = (enrollmentrequest) => {
    const actions = [
      {
        title: 'Reboot',
        onClick: () => alert(`Reboot`),
      },
      {
        title: 'Delete',
        onClick: () => {
          setIsLoading(true);
          deleteObject('enrollmentrequests', enrollmentrequest.metadata.name, auth.user?.access_token ?? '');
          getEvents();
        },
      },
    ];
    if (enrollmentrequest.status > 0) {
      enrollmentrequest.status.forEach((status) => {
        if ((status.condition.status === "False") && (status.condition.type === "Approved")) {
          actions.push({
            title: 'Approve',
            onClick: () => {
              setIsLoading(true);
              approveEnrollmentRequest(enrollmentrequest.metadata.name, auth.user?.access_token ?? '');
              getEvents();
            },
          });
          return;
        }
      });
    } else {
      actions.push({
        title: 'Approve',
        onClick: () => {
          setIsLoading(true);
          approveEnrollmentRequest(enrollmentrequest.metadata.name, auth.user?.access_token ?? '');
          getEvents();
        },
      });
    }
    return actions;
  };

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

        {enrollmentRequestsData.items.length > 0 && (
          <Tbody>
            {enrollmentRequestsData.items.map((enrollmentrequest) => (
              <Tr key={enrollmentrequest.metadata.name}>
                {columns.map((column) => (
                  <Td dataLabel={column.label} key={`${column.label}${enrollmentrequest.metadata.name}`}>
                    {tableCellData(column, enrollmentrequest)}
                  </Td>
                ))}
                <Td isActionCell>
                  <ActionsColumn
                    items={generateActions(enrollmentrequest as EnrollmentRequest)}
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
