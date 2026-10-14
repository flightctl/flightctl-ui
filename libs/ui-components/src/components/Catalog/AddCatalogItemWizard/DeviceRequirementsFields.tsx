import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  FormGroup,
  Label,
  LabelGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { useField } from 'formik';

import { DeviceFeatureBoolean } from '@flightctl/types/alpha';
import { OsModeType } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  type DeviceFeaturesFormValues,
  formatDeviceFeatureValue,
  getEmptyDeviceFeaturesFormValues,
} from '../../../utils/catalogDeviceFeatures';
import { FormGroupWithHelperText } from '../../common/WithHelperText';

type FeatureValue = '' | DeviceFeatureBoolean;

type KnownFeatureKey = 'gpuPresent' | 'kvmEnabled' | 'osMode';
const FEATURE_KEYS: KnownFeatureKey[] = ['gpuPresent', 'kvmEnabled', 'osMode'];

type FeatureSelectProps = {
  featureKey: KnownFeatureKey;
  value: FeatureValue;
  label: string;
  isDisabled?: boolean;
  onUpdate: (value: FeatureValue) => void;
};

const FeatureSelect = ({ featureKey, label, value, isDisabled, onUpdate }: FeatureSelectProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const trueLabel = featureKey === 'osMode' ? t('Image mode is required') : t('Feature must be present');
  const falseLabel = featureKey === 'osMode' ? t('Package mode is required') : t('Feature must not be present');

  return (
    <FormGroup label={label} className="pf-v6-u-mb-sm">
      <Split hasGutter>
        <SplitItem isFilled>
          <Select
            isOpen={isOpen}
            selected={value}
            onSelect={(_event, selected) => {
              onUpdate(String(selected) as DeviceFeatureBoolean);
              setIsOpen(false);
            }}
            onOpenChange={setIsOpen}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsOpen((open) => !open)}
                isExpanded={isOpen}
                isDisabled={isDisabled}
                isFullWidth
              >
                {value === DeviceFeatureBoolean.DeviceFeatureBooleanTrue ? trueLabel : falseLabel}
              </MenuToggle>
            )}
          >
            <SelectList>
              <SelectOption
                key={DeviceFeatureBoolean.DeviceFeatureBooleanTrue}
                value={DeviceFeatureBoolean.DeviceFeatureBooleanTrue}
              >
                {trueLabel}
              </SelectOption>
              <SelectOption
                key={DeviceFeatureBoolean.DeviceFeatureBooleanFalse}
                value={DeviceFeatureBoolean.DeviceFeatureBooleanFalse}
              >
                {falseLabel}
              </SelectOption>
            </SelectList>
          </Select>
        </SplitItem>
        {!isDisabled && (
          <SplitItem>
            <Button
              aria-label={t('Delete {{label}} requirement', { label })}
              variant="link"
              isDanger
              icon={<MinusCircleIcon aria-hidden="true" />}
              iconPosition="start"
              onClick={() => onUpdate('')}
            />
          </SplitItem>
        )}
      </Split>
    </FormGroup>
  );
};

const hasAnyDeviceRequirement = (features: DeviceFeaturesFormValues): boolean =>
  Boolean(features.gpuPresent || features.kvmEnabled || features.osMode || Object.keys(features.extra).length > 0);

const DeviceRequirementsFields = ({ namePrefix, isDisabled }: { namePrefix: string; isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const [{ value }, , { setValue, setTouched }] = useField<DeviceFeaturesFormValues | null>(
    `${namePrefix}.deviceFeatures`,
  );
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  const featureLabels: Record<KnownFeatureKey, string> = {
    gpuPresent: t('GPU acceleration'),
    kvmEnabled: t('KVM virtualization'),
    osMode: t('OS mode'),
  };

  const current = {
    ...(value ?? getEmptyDeviceFeaturesFormValues()),
    extra: value?.extra ?? {},
  };
  const remainingKeys = FEATURE_KEYS.filter((key) => !current[key]);
  const extraEntries = Object.entries(current.extra);
  const hasAnyRequirement = hasAnyDeviceRequirement(current);

  const updateFeature = (feature: KnownFeatureKey) => (value: FeatureValue) => {
    let featureValue: DeviceFeatureBoolean | OsModeType | '';
    if (feature === 'osMode' && value !== '') {
      featureValue =
        value === DeviceFeatureBoolean.DeviceFeatureBooleanTrue ? OsModeType.OsModeImage : OsModeType.OsModePackage;
    } else {
      featureValue = value;
    }
    const next = { ...current, [feature]: featureValue };
    void setValue(hasAnyDeviceRequirement(next) ? next : null, true);
    void setTouched(true);
  };

  if (isDisabled && !hasAnyRequirement) {
    return t('This version does not define any device requirements.');
  }

  return (
    <FormGroupWithHelperText
      label={t('Device requirements')}
      content={t('Define the device feature requirements for this version.')}
    >
      {current.gpuPresent && (
        <FeatureSelect
          featureKey="gpuPresent"
          label={featureLabels.gpuPresent}
          value={current.gpuPresent}
          isDisabled={isDisabled}
          onUpdate={updateFeature('gpuPresent')}
        />
      )}
      {current.kvmEnabled && (
        <FeatureSelect
          featureKey="kvmEnabled"
          label={featureLabels.kvmEnabled}
          value={current.kvmEnabled}
          isDisabled={isDisabled}
          onUpdate={updateFeature('kvmEnabled')}
        />
      )}
      {current.osMode && (
        <FeatureSelect
          featureKey="osMode"
          label={featureLabels.osMode}
          value={
            current.osMode === OsModeType.OsModeImage
              ? DeviceFeatureBoolean.DeviceFeatureBooleanTrue
              : DeviceFeatureBoolean.DeviceFeatureBooleanFalse
          }
          isDisabled={isDisabled}
          onUpdate={updateFeature('osMode')}
        />
      )}
      {!isDisabled && remainingKeys.length > 0 && (
        <FormGroup>
          <Dropdown
            isOpen={isAddOpen}
            onOpenChange={setIsAddOpen}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                variant="plainText"
                icon={<PlusCircleIcon aria-hidden="true" />}
                onClick={() => setIsAddOpen((open) => !open)}
                isExpanded={isAddOpen}
              >
                {t('Add device requirement')}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {remainingKeys.map((key) => (
                <DropdownItem
                  key={key}
                  onClick={() => {
                    updateFeature(key)(DeviceFeatureBoolean.DeviceFeatureBooleanTrue);
                    setIsAddOpen(false);
                  }}
                >
                  {featureLabels[key]}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </FormGroup>
      )}
      {extraEntries.length > 0 && (
        <FormGroupWithHelperText
          label={t('Custom device requirements')}
          content={t('This version includes custom device requirements. These cannot be managed in the Console.')}
        >
          <LabelGroup>
            {extraEntries.map(([key, extraValue]) => (
              <Label key={key}>{`${key}=${formatDeviceFeatureValue(extraValue)}`}</Label>
            ))}
          </LabelGroup>
        </FormGroupWithHelperText>
      )}
    </FormGroupWithHelperText>
  );
};

export default DeviceRequirementsFields;
