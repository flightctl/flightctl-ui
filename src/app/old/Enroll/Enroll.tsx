import React, { useState, useEffect} from 'react';
import { fetchDataObj, approveEnrollmentRequest, rejectEnrollmentRequest } from '@app/old/utils/commonFunctions'; 
import { enrollmentrequest } from '@app/old/utils/commonDataTypes';
import { useAuth } from 'react-oidc-context';
import { EnrollStatus } from './EnrollStatus';
import {
  Alert,
  AlertActionLink,
  AlertGroup,
  Button,
  ClipboardCopy,
  Divider,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  PageSection,
  TextContent,
  Text,
  Title,
} from '@patternfly/react-core';
import { set } from 'yaml/dist/schema/yaml-1.1/set';

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





const Enroll: React.FunctionComponent = () => {

    const auth = useAuth();
    var bodyApproval = {
      "labels": {
        "fleet": "",
        "company.example.com/building": "",
        "company.example.com/floor": "",
        "company.example.com/room": "",
        "approval-comment": ""
      },
      "region": "us-east-1",
      "approved": true,
      "approvedBy": auth.user?.profile.preferred_username    
    }

    const [showAlert, setShowAlert] = React.useState(false);
    const [enrollmentrequest, setEnrollmentRequest] = useState<enrollmentrequest>();
    const windowPath = window.location.pathname.split("enroll/");
    const enrollID = windowPath[1];
    const [approvalStatus, setApprovalStatus] = React.useState<string | null>(null);

    useEffect(() => {
        fetchDataObj("enrollmentrequests", enrollID, auth.user?.access_token ?? '').then((data) => {
          setEnrollmentRequest(data);
        });
      }, []);

    const handleReject = () => {
        setShowAlert(true);
    };

    const handleCancel = () => {
        setShowAlert(false);
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
        setIsOpen(true);
    };

    const onEnterPressed = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
        onSearchButtonClick();
        }
    };
    if (!enrollmentrequest) {
        return <div>Loading...</div>; // o simplemente return null;
      }
    const buildApproval = async (enrollID: string) => {
      var fleet;
      if (selected === 'none for now') {
        fleet = '';
      } else {  
        fleet = selected;
      }
      bodyApproval.labels.fleet = fleet;
      bodyApproval.labels["company.example.com/building"] = (document.getElementById("building") as HTMLInputElement)?.value ?? '';
      bodyApproval.labels["company.example.com/floor"] = (document.getElementById("floor") as HTMLInputElement)?.value ?? '';
      bodyApproval.labels["company.example.com/room"] = (document.getElementById("room") as HTMLInputElement)?.value ?? '';
      bodyApproval.labels["approval-comment"] = (document.getElementById("approvalComment") as HTMLInputElement)?.value ?? '';
      bodyApproval.region = (document.getElementById("region") as HTMLInputElement)?.value ?? '';
      console.log(JSON.stringify(bodyApproval));
      const approveEnrollmentResponse = await approveEnrollmentRequest(enrollmentrequest.metadata.name, bodyApproval, auth.user?.access_token ?? '')
        if ((approveEnrollmentResponse.code === 200) || (approveEnrollmentResponse.status === 200)) {
          setApprovalStatus('approved');
        } else {
          setApprovalStatus('error');
        }
    }

    const buidRejection = async (enrollID: string) => {
      const rejectEnrollmentResponse = await rejectEnrollmentRequest(enrollmentrequest.metadata.name, auth.user?.access_token ?? '')
      console.log(rejectEnrollmentResponse);
      if (rejectEnrollmentResponse.code === 200) {
        setApprovalStatus('rejected');
      } else {
        setApprovalStatus('error');
      }
    }
    return (
      <div>
      {approvalStatus ? (<EnrollStatus enrollID={enrollID} enrollStatus={approvalStatus} />) : (
        <PageSection style={{ textAlign: 'center' }}>
            <Title headingLevel="h1" size="lg" style={{ marginBottom: "20px"}}>Enrollment Request</Title>
            <div>
            <ClipboardCopy style={{width: "350px", margin: '0 auto'}} isReadOnly hoverTip="Copy" variant="inline-compact" clickTip="Copied" isBlock>
                <b>{enrollmentrequest.metadata.name.toString()}</b>
            </ClipboardCopy>
            </div>

            <div style={{ width: '350px', margin: '0 auto' }}> Fleet to attach:
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
            <div style={ { marginBottom: '10px', marginTop: '10px', textAlign: 'right' }}>
              region: <input type="text" id="region" name="region" size={10} defaultValue="us-east-1" />
            </div>
            <div style={ { marginBottom: '10px', marginTop: '10px', textAlign: 'right' }}>
            company.example.com/building: <input type="text" id="building" name="building" size={10} />
            </div>
            <div style={ { marginBottom: '10px', marginTop: '10px', textAlign: 'right'  }}>
            company.example.com/floor: <input type="text" id="floor" name="floor" size={10} />
            </div>
            <div style={ { marginBottom: '10px', marginTop: '10px', textAlign: 'right' }}>
            company.example.com/room: <input type="text" id="room" name="room" size={10} />
            </div>
            <div style={ { marginBottom: '10px', marginTop: '10px'}}>
            approval-comment: <input type="text" id="approvalComment" name="approvalComment" size={35} />
            </div>
            </div>
            <div style={ { marginBottom: '20px', marginTop: '20px' }}>
                <Button variant="primary" style={{ fontSize: '30px', padding: '20px 20px' }} onClick={() => buildApproval(enrollmentrequest.metadata.name)}>Approve</Button>
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
                          <AlertActionLink onClick={() => {buidRejection(enrollmentrequest.metadata.name); handleCancel()}}>Reject enrollment</AlertActionLink>
                          <AlertActionLink onClick={(handleCancel)}>Cancel</AlertActionLink>
                        </React.Fragment>
                      }
                >
                    Are you sure you want to reject this enrollment request?
                </Alert>
                </AlertGroup>
            )}
        </PageSection>)}
        </div>
    );
};

export { Enroll };
