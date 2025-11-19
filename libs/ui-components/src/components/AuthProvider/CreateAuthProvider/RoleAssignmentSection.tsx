import * as React from 'react';
import { TFunction } from 'react-i18next';
import {
  FormGroup,
  FormSection,
  Label,
  LabelGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import RadioField from '../../form/RadioField';
import ListItemField from '../../form/ListItemField';
import TextField from '../../form/TextField';
import ErrorHelperText, { DefaultHelperText } from '../../form/FieldHelperText';
import { AuthProviderFormValues, RoleAssignmentType } from './types';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import { RoleClaimHelperText, RoleSeparatorHelperText } from './AuthProviderHelperText';

const getAvailableRoles = (t: TFunction): Record<string, string> => ({
  admin: t('System administrator'),
  'org-admin': t('Organization administrator'),
  operator: t('Operator'),
  installer: t('Installer'),
  viewer: t('Viewer'),
});

const RoleSelector = () => {
  const { t } = useTranslation();
  const [{ value: roles }, meta, { setValue }] = useField<string[]>('staticRoles');
  const [isOpen, setIsOpen] = React.useState(false);

  const allRoles = React.useMemo(() => {
    return getAvailableRoles(t);
  }, [t]);

  const availableRoles = React.useMemo(() => {
    return Object.entries(allRoles)
      .filter(([roleCode]) => !roles.includes(roleCode))
      .map(([roleCode, roleLabel]) => ({
        value: roleCode,
        label: roleLabel,
      }));
  }, [roles, allRoles]);

  const onAddRole = (role: string) => {
    if (!roles.includes(role)) {
      setValue([...roles, role], true);
    }
    setIsOpen(false);
  };

  const onDelete = (role: string) => {
    setValue(
      roles.filter((r) => r !== role),
      true,
    );
  };

  const hasAvailableRoles = availableRoles.length > 0;

  return (
    <>
      <DefaultHelperText helperText={t('List of roles to assign to all users from this provider')} />
      <LabelGroup
        numLabels={5}
        isEditable
        addLabelControl={
          <Select
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSelect={(_, value) => onAddRole(value as string)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                isDisabled={!hasAvailableRoles}
                onClick={() => setIsOpen(!isOpen)}
                isExpanded={isOpen}
                className="pf-v5-u-ml-xs"
              >
                {t('Add role')}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            <SelectList>
              {availableRoles.map((role) => (
                <SelectOption key={role.value} value={role.value}>
                  {role.label}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        }
      >
        {roles.map((roleCode) => (
          <Label key={roleCode} onClose={() => onDelete(roleCode)} textMaxWidth="18ch" isEditable>
            {allRoles[roleCode]}
          </Label>
        ))}
      </LabelGroup>
      <ErrorHelperText meta={meta} touchRequired={false} />
    </>
  );
};

const RoleAssignmentSection = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AuthProviderFormValues>();

  return (
    <FormSection title={t('Role assignment')} className="pf-v5-u-mt-md">
      <Split hasGutter>
        <SplitItem>
          <RadioField
            id="roleAssignmentStatic"
            name="roleAssignmentType"
            label={t('Static')}
            checkedValue={RoleAssignmentType.Static}
          />
        </SplitItem>
        <SplitItem>
          <RadioField
            id="roleAssignmentDynamic"
            name="roleAssignmentType"
            label={t('Dynamic')}
            checkedValue={RoleAssignmentType.Dynamic}
          />
        </SplitItem>
      </Split>

      {values.roleAssignmentType === RoleAssignmentType.Static && (
        <FormGroup label={t('Roles')} isRequired>
          <RoleSelector />
        </FormGroup>
      )}

      {values.roleAssignmentType === RoleAssignmentType.Dynamic && (
        <>
          <FormGroupWithHelperText label={t('Role claim path')} content={<RoleClaimHelperText />}>
            <ListItemField
              name="roleClaimPath"
              helperText={t(
                'Path segments to the role/group claim (e.g., ["groups"], ["roles"], ["realm_access", "roles"])',
              )}
              addButtonText={t('Add path segment')}
            />
          </FormGroupWithHelperText>

          <FormGroupWithHelperText label={t('Separator')} content={<RoleSeparatorHelperText />}>
            <TextField name="roleSeparator" id="roleSeparator" aria-label={t('Separator')} placeholder=":" />
          </FormGroupWithHelperText>
        </>
      )}
    </FormSection>
  );
};

export default RoleAssignmentSection;
