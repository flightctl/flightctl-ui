import * as React from 'react';
import {
  Badge,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  Select,
  SelectGroup,
  Spinner,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/js/icons/filter-icon';

import './FilterSelect.css';

type FilterSelectGroupProps = React.PropsWithChildren<{
  label: string;
}>;

export const FilterSelectGroup = ({ label, children }: FilterSelectGroupProps) => (
  <SelectGroup label={label}>
    <div className="fctl-filter-select__group">{children}</div>
  </SelectGroup>
);

type FilterSelectProps = React.PropsWithChildren<{
  placeholder: string;
  selectedFilters: number;
  isFilterUpdating: boolean;
}>;

const FilterSelect = ({ placeholder, selectedFilters, isFilterUpdating, children }: FilterSelectProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const textInputRef = React.useRef<HTMLInputElement>();
  const toggleExpand = () => {
    if (!isExpanded) {
      textInputRef?.current?.focus();
    }
    setIsExpanded(!isExpanded);
  };
  return (
    <Select
      aria-label={placeholder}
      role="menu"
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          aria-label={placeholder}
          onClick={toggleExpand}
          isExpanded={isExpanded}
          isFullWidth
          icon={
            <Icon>
              <FilterIcon />
            </Icon>
          }
        >
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <span>{placeholder}</span>
            </FlexItem>
            <FlexItem className="fctl-toggle-content">
              {!!selectedFilters && (
                <TextInputGroupUtilities onClick={toggleExpand}>
                  <Badge isRead className="fctl-toggle-content__badge">
                    {selectedFilters}
                  </Badge>
                </TextInputGroupUtilities>
              )}
              {isFilterUpdating && (
                <span className="fctl-toggle-content__loader">
                  <TextInputGroupUtilities onClick={toggleExpand}>
                    <Spinner size="sm" />
                  </TextInputGroupUtilities>
                </span>
              )}
            </FlexItem>
          </Flex>
        </MenuToggle>
      )}
      isOpen={isExpanded}
      onOpenChange={setIsExpanded}
    >
      {children}
    </Select>
  );
};

export default FilterSelect;
