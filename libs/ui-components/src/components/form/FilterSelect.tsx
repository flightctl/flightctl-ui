import {
  Badge,
  MenuToggle,
  Select,
  SelectGroup,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import * as React from 'react';

import './FilterSelect.css';

type FilterSelectGroupProps = React.PropsWithChildren<{
  label: string;
}>;

export const FilterSelectGroup: React.FC<FilterSelectGroupProps> = ({ label, children }) => (
  <SelectGroup label={label}>
    <div className="fctl-filter-select__group">{children}</div>
  </SelectGroup>
);

type FilterSelectProps = React.PropsWithChildren<{
  placeholder: string;
  filter: string;
  setFilter: (filter: string) => void;
  selectedFilters: number;
}>;

const FilterSelect: React.FC<FilterSelectProps> = ({ placeholder, filter, setFilter, children, selectedFilters }) => {
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
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="typeahead"
          aria-label={placeholder}
          onClick={toggleExpand}
          isExpanded={isExpanded}
          isFullWidth
        >
          <TextInputGroup isPlain>
            <TextInputGroupMain
              value={filter}
              onClick={() => !isExpanded && setIsExpanded(true)}
              onChange={(_, value) => setFilter(value)}
              onKeyDown={() => !isExpanded && setIsExpanded(true)}
              autoComplete="off"
              placeholder={placeholder}
              role="combobox"
              isExpanded={isExpanded}
              innerRef={textInputRef}
            />
          </TextInputGroup>
          {!!selectedFilters && (
            <TextInputGroupUtilities onClick={toggleExpand}>
              <Badge isRead>{selectedFilters}</Badge>
            </TextInputGroupUtilities>
          )}
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
