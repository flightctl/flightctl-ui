import React, { useState, useEffect } from 'react';
import { fetchData } from '@app/old/utils/commonFunctions';
import {
  Card,
  CardBody,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Divider,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { set } from 'yaml/dist/schema/yaml-1.1/set';
import { useAuth } from '@app/hooks/useAuth';

const Organization: React.FunctionComponent = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();

  React.useEffect(() => {}, [auth]);

  return (
    <PageSection>
      <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>
        Organization
      </Title>
    </PageSection>
  );
};

export { Organization };
