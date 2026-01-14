import * as React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';

import { AuthRoleAssignment } from '@flightctl/types';
import { getAssignmentTypeLabel } from '../CreateAuthProvider/utils';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  DEFAULT_ROLE_CLAIM,
  DEFAULT_ROLE_SEPARATOR,
  isRoleAssignmentDynamic,
  isRoleAssignmentStatic,
} from '../CreateAuthProvider/types';

const RoleAssigmentDetails = ({ roleAssignment }: { roleAssignment: AuthRoleAssignment }) => {
  const { t } = useTranslation();

  let values: string[] = [];
  let separator: string | undefined;
  if (isRoleAssignmentStatic(roleAssignment)) {
    values = roleAssignment.roles;
  } else if (isRoleAssignmentDynamic(roleAssignment)) {
    values = [roleAssignment.claimPath.join('.')];
    separator = roleAssignment.separator;
  } else {
    values = [`"${DEFAULT_ROLE_CLAIM}" - (${t('Default')})`];
  }

  return (
    <>
      <Label color="purple">{getAssignmentTypeLabel(roleAssignment.type, t)}</Label>
      <LabelGroup className="pf-v6-u-ml-sm">
        {values.map((role, index) => (
          <Label key={`${role}-${index}`}>{role}</Label>
        ))}
      </LabelGroup>
      {separator && (
        <>
          <br />
          <LabelGroup className="pf-v6-u-mt-sm">
            <Label color="purple">{t('Separator')}</Label>

            <Label key="separator" color="blue">
              {separator}
              {separator === DEFAULT_ROLE_SEPARATOR ? ' (colon) ' : ''}
            </Label>
          </LabelGroup>
        </>
      )}
    </>
  );
};

export default RoleAssigmentDetails;
