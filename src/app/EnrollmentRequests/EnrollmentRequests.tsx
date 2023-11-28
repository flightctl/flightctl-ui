import * as React from 'react';
import { fetchData, tableCellData, deleteObject } from '@app/utils/commonFunctions'; 

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

//type enrollmentrequest = {
//  fingerprint: string | null;
//  hardware: string | null;
//  request_time: string | null;
//  target_fleet: string | null;
//  target_labels: string | null;
//  approver: string | null;
//  approval_status: string | null;
//  measurements: string;
//  enrollment_status: string;
//};
type enrollmentrequest = {
  metadata: {
    name: string;
    creationTimestamp: string | null;
    deletionTimestamp: string | null;
    labels: {
      [key: string]: string;
    }
  };
  spec: {
    deviceStatus: {
      systemInfo: {
        architecture: string | null;
        bootID: string | null;
        machineID: string | null;
        operatingSystem: string | null;
      };
    };
  };
  status: {
    conditions: [
      {
        lastTransitionTime: string | null;
        message: string | null;
        reason: string | null;
        status: string | null;
        type: string | null;
      }
    ]
  };
};
type itemsList = {
  items: enrollmentrequest[];

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
  { key: 'metadata.name', label: 'Fingerprint' },
  { key: 'metadata.creationTimestamp', label: 'Enrollment Request Time' },
  { key: 'spec.deviceStatus.systemInfo.operatingSystem', label: 'Hardware' },
  { key: 'status.conditions[0].reason', label: 'Approver' },
  { key: 'status.conditions[0].status', label: 'Approval Status' },
  { key: 'status.conditions[0].type', label: 'Enrollment Status' },
];

const EnrollmentRequests: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [enrollmentRequestData, setEnrollmentRequestData] = React.useState<itemsList>({ items: [] });
  function getEvents() {
    fetchData('enrollmentrequests').then((data) => {

      setEnrollmentRequestData(data);
      setIsLoading(false);
    });
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

        {enrollmentRequestData.items.length > 0 && (
          <Tbody>
            {enrollmentRequestData.items.map((enrollmentrequest) => (
              <Tr key={enrollmentrequest.metadata.name}>
                {columns.map((column) => (
                  <Td dataLabel={column.label} key={`${column.label}${enrollmentrequest.metadata.name}`}>
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
                        onClick: () => {setIsLoading(true); deleteObject('enrollmentrequests', enrollmentrequest.metadata.name); getEvents();},
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
