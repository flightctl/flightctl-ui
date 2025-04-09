import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Button, FormGroup, FormSection } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { useTranslation } from '../../../hooks/useTranslation';

import TextField from '../../form/TextField';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import NameField from '../../form/NameField';
import { getDnsSubdomainValidations } from '../../form/validations';

export const CreateResourceSyncForm = ({ rs, index }: { rs: ResourceSyncFormValue; index: number }) => {
  const { t } = useTranslation();
  return (
    <FormSection key={index}>
      <NameField
        name={`resourceSyncs[${index}].name`}
        aria-label={t('Resource sync name')}
        value={rs.name}
        isRequired
        isDisabled={rs.exists}
        resourceType="resourcesyncs"
        validations={getDnsSubdomainValidations(t)}
      />
      <FormGroupWithHelperText label={t('Target revision')} content={t('Name of a branch or a tag.')} isRequired>
        <TextField
          name={`resourceSyncs[${index}].targetRevision`}
          aria-label={t('Target revision')}
          value={rs.targetRevision}
          helperText={t('For example: main')}
        />
      </FormGroupWithHelperText>
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
    </FormSection>
  );
};

const CreateResourceSyncsForm = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();

  return (
    <FieldArray name="resourceSyncs">
      {({ remove, push }) => (
        <>
          {values.resourceSyncs.map((resourceSync, index) => (
            <React.Fragment key={index}>
              <CreateResourceSyncForm rs={resourceSync} index={index} />
              {values.resourceSyncs.length > 1 && (
                <FormGroup isInline>
                  <Button variant="link" icon={<MinusCircleIcon />} iconPosition="left" onClick={() => remove(index)}>
                    {t('Remove resource sync')}
                  </Button>
                </FormGroup>
              )}
            </React.Fragment>
          ))}
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            iconPosition="left"
            onClick={() => push({ name: '', path: '', targetRevision: '' } as ResourceSyncFormValue)}
          >
            {t('Add another resource sync')}
          </Button>
        </>
      )}
    </FieldArray>
  );
};

export default CreateResourceSyncsForm;
