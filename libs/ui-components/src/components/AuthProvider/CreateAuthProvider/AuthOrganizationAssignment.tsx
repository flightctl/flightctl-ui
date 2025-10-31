import * as React from 'react';
import { FormGroup, FormSection, Split, SplitItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import ListItemField from '../../form/ListItemField';
import { AuthProviderFormValues, OrgAssignmentType } from './types';

const OrganizationAssignmentSection = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AuthProviderFormValues>();

  return (
    <FormSection title={t('Organization assignment')} className="pf-v5-u-mt-md">
      <Split hasGutter>
        <SplitItem>
          <RadioField
            id="orgAssignmentStatic"
            name="orgAssignmentType"
            label={t('Static')}
            checkedValue={OrgAssignmentType.Static}
          />
        </SplitItem>
        <SplitItem>
          <RadioField
            id="orgAssignmentDynamic"
            name="orgAssignmentType"
            label={t('Dynamic')}
            checkedValue={OrgAssignmentType.Dynamic}
          />
        </SplitItem>
        <SplitItem>
          <RadioField
            id="orgAssignmentPerUser"
            name="orgAssignmentType"
            label={t('Per user')}
            checkedValue={OrgAssignmentType.PerUser}
          />
        </SplitItem>
      </Split>

      {values.orgAssignmentType === OrgAssignmentType.Static && (
        <FormGroup label={t('External organization name')} isRequired>
          <TextField
            name="orgName"
            aria-label={t('External organization name')}
            helperText={t('Users from this provider will be assigned to this organization')}
          />
        </FormGroup>
      )}

      {values.orgAssignmentType === OrgAssignmentType.Dynamic && (
        <>
          <FormGroup label={t('Claim path')} isRequired>
            <ListItemField
              name="claimPath"
              helperText={t('Enter the path segments to the claim (e.g., ["groups"], ["custom_claims", "org_id"])')}
              addButtonText={t('Add path segment')}
            />
          </FormGroup>
          <FormGroup label={t('Organization name prefix')}>
            <TextField
              name="orgNamePrefix"
              aria-label={t('Organization name prefix')}
              helperText={t('Optional prefix for the organization name')}
            />
          </FormGroup>
          <FormGroup label={t('Organization name suffix')}>
            <TextField
              name="orgNameSuffix"
              aria-label={t('Organization name suffix')}
              helperText={t('Optional suffix for the organization name')}
            />
          </FormGroup>
        </>
      )}

      {values.orgAssignmentType === OrgAssignmentType.PerUser && (
        <>
          <FormGroup label={t('Organization name prefix')}>
            <TextField
              name="orgNamePrefix"
              aria-label={t('Organization name prefix')}
              helperText={t('Optional prefix for the user-specific organization name')}
            />
          </FormGroup>
          <FormGroup label={t('Organization name suffix')}>
            <TextField
              name="orgNameSuffix"
              aria-label={t('Organization name suffix')}
              helperText={t('Optional suffix for the user-specific organization name')}
            />
          </FormGroup>
        </>
      )}
    </FormSection>
  );
};

export default OrganizationAssignmentSection;
