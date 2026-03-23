import * as React from 'react';
import {
  Button,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';
import { CheckIcon } from '@patternfly/react-icons/dist/js/icons/check-icon';
import { useField } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import ErrorHelperText from '../../form/FieldHelperText';
import { getDnsSubdomainValidations, getKubernetesDnsSubdomainErrors } from '../../form/validations';

type ChannelsSelectProps = {
  name: string;
  availableChannels: string[];
  isDisabled?: boolean;
};

const ChannelsSelect = ({ name, availableChannels, isDisabled }: ChannelsSelectProps) => {
  const { t } = useTranslation();
  const [{ value: selected }, meta, { setValue, setTouched }] = useField<string[]>(name);

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const textInputRef = React.useRef<HTMLInputElement>(null);

  const allOptions = React.useMemo(() => {
    const merged = new Set([...availableChannels, ...selected]);
    return Array.from(merged).sort();
  }, [availableChannels, selected]);

  const trimmedInput = inputValue.trim();
  const filteredOptions = allOptions.filter(
    (option) => !trimmedInput || option.toLowerCase().includes(trimmedInput.toLowerCase()),
  );
  const isNewChannel = trimmedInput && !allOptions.some((opt) => opt.toLowerCase() === trimmedInput.toLowerCase());
  const dnsErrors = trimmedInput ? getKubernetesDnsSubdomainErrors(trimmedInput) : {};
  const isValidDnsSubdomain = trimmedInput ? Object.keys(dnsErrors).length === 0 : true;
  const showCreateOption = isNewChannel && isValidDnsSubdomain;

  const toggleSelection = (channel: string) => {
    const newSelected = selected.includes(channel) ? selected.filter((s) => s !== channel) : [...selected, channel];
    void setValue(newSelected, true);
    setTouched(true);
  };

  const handleSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    if (value === undefined) {
      return;
    }
    const channel = String(value);
    toggleSelection(channel);
    setInputValue('');
    textInputRef.current?.focus();
  };

  const handleCreateOption = () => {
    const newChannel = inputValue.trim();
    if (newChannel && !selected.includes(newChannel)) {
      void setValue([...selected, newChannel], true);
      setTouched(true);
    }
    setInputValue('');
    textInputRef.current?.focus();
  };

  const removeChannel = (channel: string) => {
    void setValue(
      selected.filter((s) => s !== channel),
      true,
    );
    setTouched(true);
  };

  const clearAll = () => {
    void setValue([], true);
    setTouched(true);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !isNewChannel) {
      return;
    }
    event.preventDefault();
    if (isValidDnsSubdomain) {
      handleCreateOption();
    }
  };

  return (
    <>
      <Select
        isOpen={isOpen}
        selected={selected}
        onSelect={handleSelect}
        onOpenChange={(open) => {
          if (!open && !meta.touched) {
            setTouched(true);
          }
          setIsOpen(open);
          setInputValue('');
        }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            variant="typeahead"
            onClick={() => {
              if (isDisabled) {
                return;
              }
              setIsOpen(!isOpen);
              textInputRef.current?.focus();
            }}
            isExpanded={isOpen}
            isFullWidth
            isDisabled={isDisabled}
          >
            <TextInputGroup isPlain>
              <TextInputGroupMain
                value={inputValue}
                onChange={(_, val) => {
                  setInputValue(val);
                  if (!isOpen) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={onInputKeyDown}
                onClick={() => {
                  if (!isOpen) {
                    setIsOpen(true);
                  }
                }}
                placeholder={selected.length === 0 ? t('Select or create channels') : undefined}
                autoComplete="off"
                innerRef={textInputRef}
              >
                <LabelGroup>
                  {selected.map((channel) => (
                    <Label key={channel} onClose={() => removeChannel(channel)}>
                      {channel}
                    </Label>
                  ))}
                </LabelGroup>
              </TextInputGroupMain>
              {selected.length > 0 && (
                <TextInputGroupUtilities>
                  <Button
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAll();
                    }}
                    aria-label={t('Clear all')}
                  >
                    <TimesIcon />
                  </Button>
                </TextInputGroupUtilities>
              )}
            </TextInputGroup>
          </MenuToggle>
        )}
      >
        <SelectList>
          {filteredOptions.map((option) => (
            <SelectOption key={option} value={option} hasCheckbox isSelected={selected.includes(option)}>
              {option}
            </SelectOption>
          ))}
          {showCreateOption && (
            <SelectOption value={trimmedInput} onClick={handleCreateOption}>
              {t('Create "{{channel}}" channel', { channel: trimmedInput })}
            </SelectOption>
          )}
          {isNewChannel && !isValidDnsSubdomain && (
            <SelectOption isDisabled>
              <HelperText component="ul">
                {getDnsSubdomainValidations(t).map((validation) => {
                  const hasError = dnsErrors[validation.key] === 'failed';
                  return (
                    <HelperTextItem
                      key={validation.key}
                      component="li"
                      variant={hasError ? 'error' : 'success'}
                      icon={hasError ? <TimesIcon /> : <CheckIcon />}
                    >
                      {validation.message}
                    </HelperTextItem>
                  );
                })}
              </HelperText>
            </SelectOption>
          )}
          {!filteredOptions.length && !isNewChannel && (
            <SelectOption isDisabled>{t('Type to create new channel')}</SelectOption>
          )}
        </SelectList>
      </Select>
      <ErrorHelperText meta={meta} />
    </>
  );
};

export default ChannelsSelect;
