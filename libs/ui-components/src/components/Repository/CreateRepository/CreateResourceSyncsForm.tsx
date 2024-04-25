import * as React from 'react';
import { Field, FieldArray, useFormikContext } from 'formik';
import { Button, FormGroup, FormSection } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { useTranslation } from '../../../hooks/useTranslation';

import { useFetch } from '../../../hooks/useFetch';
import TextField from '../../form/TextField';
import WithHelperText from '../../common/WithHelperText';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';

const CreateResourceSyncsForm = () => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const { values } = useFormikContext<RepositoryFormValues>();

  const validateExistingRsName = async (name: string) => {
    const rsExists = values.resourceSyncs.find((formRs) => formRs.name === name && formRs.exists);
    if (rsExists || !name) {
      // We should not validate the item against itself
      return undefined;
    }

    try {
      await get(`resourcesyncs/${name}`);
      return t(`A resource sync named "{{name}}" already exists`, { name });
    } catch (e) {
      return undefined;
    }
  };

  return (
    <FieldArray name="resourceSyncs">
      {({ remove, push }) => (
        <>
          {values.resourceSyncs.map((resourceSync, index) => (
            <FormSection key={index}>
              <FormGroup label={t('Resource sync name')} isRequired>
                <Field name={`resourceSyncs[${index}].name`} validate={validateExistingRsName}>
                  {() => (
                    <TextField
                      name={`resourceSyncs[${index}].name`}
                      aria-label={t('Resource sync name')}
                      value={resourceSync.name}
                      isDisabled={resourceSync.exists}
                    />
                  )}
                </Field>
              </FormGroup>
              <FormGroup
                label={t('Target revision')}
                isRequired
                labelIcon={
                  <WithHelperText ariaLabel={t('Target revision')} content={t('Name of a branch or a tag.')} />
                }
              >
                <TextField
                  name={`resourceSyncs[${index}].targetRevision`}
                  aria-label={t('Target revision')}
                  value={resourceSync.targetRevision}
                  helperText={t('For example: main')}
                />
              </FormGroup>
              <FormGroup
                label={t('Path')}
                isRequired
                labelIcon={
                  <WithHelperText
                    ariaLabel={t('Path')}
                    content={t('Absolute path to the file or directory holding the resource definitions.')}
                  />
                }
              >
                <TextField
                  name={`resourceSyncs[${index}].path`}
                  aria-label={t('Path')}
                  value={resourceSync.path}
                  helperText={t('For example: /inverter-fleet/fleets/eu-west-prod-001/fleet.yaml')}
                />
              </FormGroup>
              <FormGroup isInline>
                {values.resourceSyncs.length > 1 && (
                  <Button variant="link" icon={<MinusCircleIcon />} iconPosition="left" onClick={() => remove(index)}>
                    {t('Remove resource sync')}
                  </Button>
                )}
              </FormGroup>
            </FormSection>
          ))}
          <div>
            <Button
              variant="link"
              icon={<PlusCircleIcon />}
              iconPosition="left"
              onClick={() => push({ name: '', path: '', targetRevision: '' } as ResourceSyncFormValue)}
            >
              {t('Add another resource sync')}
            </Button>
          </div>
        </>
      )}
    </FieldArray>
  );
};

export default CreateResourceSyncsForm;
