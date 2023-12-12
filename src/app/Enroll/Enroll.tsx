import * as React from 'react';
import { fetchDataObj, approveEnrollmentRequest, rejectEnrollmentRequest } from '@app/utils/commonFunctions'; 
import { enrollmentrequest } from '@app/utils/commonDataTypes';
import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  AlertGroup,
  Button,
  ButtonVariant,
  Divider,
  Dropdown,
  DropdownList,
  DropdownItem,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuFooter,
  MenuSearch,
  MenuSearchInput,
  PageSection,
  SearchInput,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Title,
  Wizard,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

const dateFormatter = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  let dateObj;
  const epoch = Number(date);
  if (epoch) {
    dateObj = new Date(epoch * 1000);
  } else {
    dateObj = new Date(date);
  }

  return `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
};
const windowPath = window.location.pathname.split("enroll/");
const enrollID = windowPath[1];
var enrollmentrequest;
if (enrollID != null) {
    fetchDataObj("enrollmentrequests", enrollID).then((data) => {
        enrollmentrequest = data;
    });
}


const Enroll: React.FunctionComponent = () => {
    const [showAlert, setShowAlert] = React.useState(false);

    React.useEffect(() => {
        const pageSidebar = document.getElementById("page-sidebar");
        if (pageSidebar) {
          pageSidebar.style.display = "none";
        }
    
        return () => {
          if (pageSidebar) {
            pageSidebar.style.display = "";
          }
        };
    }, []); 

    const handleReject = () => {
        setShowAlert(true);
    };

    const handleCancel = () => {
        setShowAlert(false);
    };

    const handleConfirmReject = () => {
        setShowAlert(false);
        rejectEnrollmentRequest(enrollmentrequest.metadata.name);
    };

    interface ItemData {
        text: string;
        href?: string;
        isDisabled?: boolean | undefined;
    }
    type ItemArrayType = (ItemData | string)[];
    const fleets: ItemArrayType = [
        'none for now',
        'default'
      ];
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [selected, setSelected] = React.useState(typeof fleets[0] === 'string' ? fleets[0] : fleets[0].text);
    const [filteredItems, setFilteredItems] = React.useState<ItemArrayType>(fleets);
    const [searchInputValue, setSearchInputValue] = React.useState<string>('');
    const menuRef = React.useRef<HTMLDivElement>(null);
    const menuFooterBtnRef = React.useRef<HTMLButtonElement>(null);
    const onToggleClick = () => {
        setIsOpen(!isOpen);
      };
        
    const onSelect = (ev: React.MouseEvent<Element, MouseEvent> | undefined, itemId: string | number | undefined) => {
        if (typeof itemId === 'number' || typeof itemId === 'undefined') {
        return;
        }
        setSelected(itemId.toString());
        setIsOpen(!isOpen);
    };

    const onSearchInputChange = (value: string) => {
        setSearchInputValue(value);
    };

    const onSearchButtonClick = () => {
        const filtered =
        searchInputValue === ''
            ? fleets
            : fleets.filter((item) => {
                const str = typeof item === 'string' ? item : item.text;
                return str.toLowerCase().indexOf(searchInputValue.toLowerCase()) !== -1;
            });

        setFilteredItems(filtered || []);
        setIsOpen(true); // Keep menu open after search executed
    };

    const onEnterPressed = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
        onSearchButtonClick();
        }
    };

    return (
        <PageSection style={{ textAlign: 'center' }}>
            <Title headingLevel="h1" size="lg">Enrollment Request</Title>
            <TextContent>
                <textarea name="enrollmentrequest" rows={3} cols={35} value={enrollmentrequest.metadata.name.toString()} readOnly></textarea>
            </TextContent>
            <div> Fleet to attach:
            <Dropdown
                isOpen={isOpen}
                onOpenChange={(isOpen) => setIsOpen(isOpen)}
                onOpenChangeKeys={['Escape']}
                toggle={(toggleRef) => (
                    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
                      {selected}
                    </MenuToggle>
                  )}
                ref={menuRef}
                id="context-selector"
                onSelect={onSelect}
                isScrollable
                >

                <Divider />
                <DropdownList>
                    {filteredItems.map((item, index) => {
                    const [itemText, isDisabled, href] =
                        typeof item === 'string' ? [item, null, null] : [item.text, item.isDisabled || null, item.href || null];
                    return (
                        <DropdownItem
                        itemId={itemText}
                        key={index}
                        isDisabled={isDisabled as boolean | undefined}
                        to={href as string | undefined}
                        >
                        {itemText}
                        </DropdownItem>
                    );
                    })}
                </DropdownList>
            </Dropdown>
            </div>
            <div style={ { marginBottom: '20px', marginTop: '20px' }}>
                <Button variant="primary" style={{ fontSize: '30px', padding: '20px 20px' }} onClick={() => approveEnrollmentRequest(enrollmentrequest.metadata.name)}>Approve</Button>
            </div>
            <div>
                <Button variant="danger" onClick={handleReject}>Reject</Button>
            </div>
            {showAlert && (
                <AlertGroup isToast isLiveRegion>
                <Alert 
                    variant="danger"
                    title="Confirm Reject"
                    actionLinks={
                        <React.Fragment>
                          <AlertActionLink onClick={() => {rejectEnrollmentRequest(enrollmentrequest.metadata.name); handleCancel()}}>Reject enrollment</AlertActionLink>
                          <AlertActionLink onClick={(handleCancel)}>Cancel</AlertActionLink>
                        </React.Fragment>
                      }
                >
                    Are you sure you want to reject this enrollment request?
                </Alert>
                </AlertGroup>
            )}
        </PageSection>
    );
};

export { Enroll };
