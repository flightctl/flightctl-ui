import * as React from 'react';
import { fetchData, tableCellData, deleteObject, approveEnrollmentRequest } from '@app/utils/commonFunctions'; 
import { useAuth } from 'react-oidc-context';
import { enrollmentrequestList } from '@app/utils/commonDataTypes';
import {
  PageSection,
  Pagination,
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
  ThProps,
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
let totalEnrollmentRequests = 0;


const EnrollmentRequests: React.FunctionComponent = () => {
  const auth = useAuth();
  let loading;
  const [isLoading, setIsLoading] = React.useState(false);
  const [enrollmentRequestsData, setEnrollmentRequestsData] = React.useState<enrollmentrequestList>({ items: [] });
  const [enrollmentRequestsPageData, setEnrollmentRequestsPageData] = React.useState<enrollmentrequestList>({ items: [] });
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | null>(null);
  // set columns sorteable
    // add function to sort columns
  const onSort = (_event, index: number, direction: 'asc' | 'desc' | null) => {
    setActiveSortIndex(index);
    setActiveSortDirection(direction);
  };
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex ?? 1,
      direction: activeSortDirection ?? 'asc',
      defaultDirection: 'asc' // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex
  });
  getSortParams(1);


  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);

  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };
  // use onSort function to sort columns from enrollmentRequestsData
  React.useEffect(() => {
    if (activeSortIndex !== null && activeSortDirection !== null) {
      let sortedPageItems;
      const sortedItems = [...enrollmentRequestsData.items].sort((a, b) => {
        const aValue = tableCellData(columns[activeSortIndex], a);
        const bValue = tableCellData(columns[activeSortIndex], b);
        if (aValue === bValue) {
          return 0;
        }
        if (activeSortDirection === 'asc') {
          return aValue < bValue ? -1 : 1;
        }
        return aValue > bValue ? -1 : 1;
      });
      setEnrollmentRequestsData({ items: sortedItems });
      const start = (page - 1) * perPage;
      const end = start + perPage;
      sortedPageItems = sortedItems.slice(start, end);
      setEnrollmentRequestsPageData({ items: sortedPageItems });
    }
  }, [activeSortIndex, activeSortDirection]);

 
  function getEvents() {
    setIsLoading(true);
    loading = true;
    setEnrollmentRequestsPageData({ items: [] });
    fetchData('enrollmentrequests', auth.user?.access_token ?? '').then((data) => {
      if (loading) {
        let sortedPageItems;
        totalEnrollmentRequests = data.items.length;
        //setEnrollmentRequestsData() with the current page data
        setEnrollmentRequestsData(data);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        sortedPageItems = data.items.slice(start, end);
        setEnrollmentRequestsPageData({ items: sortedPageItems });
        setIsLoading(false);
        loading = false;
      }
    });
  }

  React.useEffect(() => {
    getEvents();

    const interval = setInterval(() => {
      getEvents();
    }, 10000);
    return clearInterval(interval);
  },[auth, page, perPage]);



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
    if (enrollmentrequest.status?.conditions) {
      enrollmentrequest.status.conditions.forEach((condition) => {
        if ((condition.status === "False") && (condition.type === "Approved")) {
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
      <Pagination
        itemCount={totalEnrollmentRequests}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        widgetId="top-pagination"
        onPerPageSelect={onPerPageSelect}
        ouiaId="PaginationTop"
      />
      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th sort={getSortParams(columns.indexOf(column))} key={column.key}>{column.label}</Th>
            ))}
            <Td></Td>
          </Tr>
        </Thead>

        {enrollmentRequestsPageData.items.length > 0 && (
          <Tbody>
            {enrollmentRequestsPageData.items.map((enrollmentrequest) => (
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
