import React, { useState, useEffect} from 'react';
import { useAuth } from 'react-oidc-context';
import {
  EmptyState, 
  EmptyStateBody, 
  EmptyStateHeader, 
  EmptyStateIcon,
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
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import ErrorIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import BanIcon from '@patternfly/react-icons/dist/esm/icons/ban-icon';
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

var titleText = "";
var emptyStateBody = "";
var stateIcon = ErrorIcon;
var stateIconColor = "var(--pf--v5-global--danger-color--100)";
const EnrollStatus: React.FunctionComponent<{enrollID: string; enrollStatus: string}> = ({enrollID,enrollStatus}) => {

    const auth = useAuth();
    if (enrollStatus === "approved") {
      titleText = "Enrollment Request Approved";
      emptyStateBody = "Approved correctly. Please check your device for updates."
      stateIcon = CheckIcon;
      stateIconColor = "var(--pf-v5-global--success-color--100)";
    } else if (enrollStatus === "rejected"){
      titleText = "Enrollment Request Rejected";
      emptyStateBody = "Rejected correctly. You must have your reasons for it."
      stateIcon = BanIcon;
      stateIconColor = "var(--pf-v5-global--disabled-color--100)";
    } else {
      titleText = "Enrollment Request Error";
      emptyStateBody = "Something went wrong. Please contact your administrator."
      stateIcon = ErrorIcon;
      stateIconColor = "var(--pf-v5-global--danger-color--100)";
    }
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
    }, [auth]); 

    return (
        <PageSection style={{ textAlign: 'center' }}>
            <Title headingLevel="h1" size="lg" style={{ marginBottom: "20px"}}>Enrollment Request</Title>
            <div>
            <ClipboardCopy style={{width: "350px", margin: '0 auto'}} isReadOnly hoverTip="Copy" variant="inline-compact" clickTip="Copied" isBlock>
                <b>{enrollID}</b>
            </ClipboardCopy>
            </div>
            <EmptyState>
            <EmptyStateHeader
              titleText={titleText}
              headingLevel="h4"
              icon={<EmptyStateIcon icon={stateIcon} color={stateIconColor} />}
            />
            <EmptyStateBody>
              {emptyStateBody}
            </EmptyStateBody>
          </EmptyState>
        </PageSection>
    );
};

export { EnrollStatus };
