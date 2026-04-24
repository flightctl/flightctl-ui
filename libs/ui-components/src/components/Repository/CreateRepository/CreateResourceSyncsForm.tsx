import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Button, FormGroup, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { ResourceSyncType } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import TextField from '../../form/TextField';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import NameField from '../../form/NameField';
import { getDnsSubdomainValidations } from '../../form/validations';
import RadioField from '../../form/RadioField';
import ExpandableFormSection from '../../form/ExpandableFormSection';

export const CreateResourceSyncForm = ({
  rs,
  index,
  showSyncType = true,
}: {
  rs: ResourceSyncFormValue;
  index: number;
  showSyncType?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <ExpandableFormSection
      title={rs.name || t('Resource sync {{ syncNum }}', { syncNum: index + 1 })}
      fieldName={`resourceSyncs[${index}]`}
    >
      <Stack hasGutter>
        <StackItem>
          <NameField
            name={`resourceSyncs[${index}].name`}
            aria-label={t('Resource sync name')}
            value={rs.name}
            isRequired
            isDisabled={rs.exists}
            resourceType="resourcesyncs"
            validations={getDnsSubdomainValidations(t)}
          />
        </StackItem>
        {showSyncType && (
          <StackItem>
            <FormGroup label={t('Sync type')}>
              <Split hasGutter>
                <SplitItem>
                  <RadioField
                    id={`resource-sync-${index}-fleet-type`}
                    name={`resourceSyncs[${index}].type`}
                    label={t('Fleet')}
                    checkedValue={ResourceSyncType.ResourceSyncTypeFleet}
                  />
                </SplitItem>
                <SplitItem>
                  <RadioField
                    id={`resource-sync-${index}-catalog-type`}
                    name={`resourceSyncs[${index}].type`}
                    label={t('Catalog')}
                    checkedValue={ResourceSyncType.ResourceSyncTypeCatalog}
                  />
                </SplitItem>
              </Split>
            </FormGroup>
          </StackItem>
        )}
        <StackItem>
          <FormGroupWithHelperText label={t('Target revision')} content={t('Name of a branch or a tag.')} isRequired>
            <TextField
              name={`resourceSyncs[${index}].targetRevision`}
              aria-label={t('Target revision')}
              value={rs.targetRevision}
              helperText={t('For example: main')}
            />
          </FormGroupWithHelperText>
        </StackItem>
        <StackItem>
          <FormGroupWithHelperText
            label={t('Path')}
            content={t(
              'The absolute path of a file or directory in the repository. Directories should only contain resource definition files and should not contain additional subdirectories.',
            )}
            isRequired
          >
            <TextField
              name={`resourceSyncs[${index}].path`}
              aria-label={t('Path')}
              value={rs.path}
              helperText={t('For example: {{exampleFile}}', {
                exampleFile: '/demos/basic-nginx-demo/deployment/fleet.yaml',
              })}
            />
          </FormGroupWithHelperText>
        </StackItem>
      </Stack>
    </ExpandableFormSection>
  );
};

const CreateResourceSyncsForm = ({
  showSyncType = true,
  defaultSyncType = ResourceSyncType.ResourceSyncTypeFleet,
}: {
  showSyncType?: boolean;
  defaultSyncType?: ResourceSyncType;
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();

  return (
    <FieldArray name="resourceSyncs">
      {(arrayHelpers) => (
        <Stack hasGutter>
          {values.resourceSyncs.map((resourceSync, index) => (
            <StackItem key={index}>
              <Split hasGutter>
                <SplitItem isFilled>
                  <CreateResourceSyncForm rs={resourceSync} index={index} showSyncType={showSyncType} />
                </SplitItem>
                <SplitItem>
                  <Button
                    aria-label={t('Delete resource sync')}
                    isDisabled={values.resourceSyncs.length === 1}
                    variant="link"
                    icon={<MinusCircleIcon />}
                    iconPosition="start"
                    onClick={() => arrayHelpers.remove(index)}
                  />
                </SplitItem>
              </Split>
            </StackItem>
          ))}
          <StackItem>
            <Button
              variant="link"
              icon={<PlusCircleIcon />}
              iconPosition="left"
              data-testid="repository-add-resource-sync-button"
              onClick={() =>
                arrayHelpers.push({
                  name: '',
                  path: '',
                  targetRevision: '',
                  type: defaultSyncType,
                } as ResourceSyncFormValue)
              }
            >
              {t('Add resource sync')}
            </Button>
          </StackItem>
        </Stack>
      )}
    </FieldArray>
  );
};

export default CreateResourceSyncsForm;
