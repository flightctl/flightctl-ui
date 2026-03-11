import * as React from 'react';
import {
  Alert,
  Button,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ApiVersion, Catalog } from '@flightctl/types/alpha';
import { PatchRequest } from '@flightctl/types';

import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDnsSubdomainValidations, validKubernetesDnsSubdomain, validURLSchema } from '../../form/validations';
import FlightCtlForm from '../../form/FlightCtlForm';
import NameField from '../../form/NameField';
import TextField from '../../form/TextField';
import { getErrorMessage } from '../../../utils/error';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import TextAreaField from '../../form/TextAreaField';
import { appendJSONPatch } from '../../../utils/patch';

type CreateCatalogFormValues = {
  name: string;
  displayName: string;
  shortDescription: string;
  icon: string;
  provider: string;
  support: string;
};

type CreateCatalogModalProps = {
  onClose: VoidFunction;
  onSuccess: (catalog: Catalog) => void;
  catalog?: Catalog;
};

const CreateCatalogModal = ({ onClose, onSuccess, catalog }: CreateCatalogModalProps) => {
  const { t } = useTranslation();
  const { post, patch } = useFetch();
  const [error, setError] = React.useState<unknown>();

  const isEdit = !!catalog;
  const isReadOnly = !!catalog?.metadata?.owner;

  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        name: validKubernetesDnsSubdomain(t, { isRequired: true }),
        displayName: Yup.string(),
        shortDescription: Yup.string(),
        icon: Yup.string().test(
          'url-or-data-uri',
          t('Must be a valid URL or data URI'),
          (value) => !value || /^(https?:\/\/|data:)/.test(value),
        ),
        provider: Yup.string(),
        support: validURLSchema(t),
      }),
    [t],
  );

  const initialValues: CreateCatalogFormValues = {
    name: catalog?.metadata.name || '',
    displayName: catalog?.spec.displayName || '',
    shortDescription: catalog?.spec.shortDescription || '',
    icon: catalog?.spec.icon || '',
    provider: catalog?.spec.provider || '',
    support: catalog?.spec.support || '',
  };

  let title: string;
  if (isReadOnly) {
    title = t('View catalog');
  } else if (isEdit) {
    title = t('Edit catalog');
  } else {
    title = t('Create catalog');
  }

  return (
    <Modal variant="medium" isOpen onClose={onClose}>
      <Formik<CreateCatalogFormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount
        onSubmit={async (values) => {
          if (isReadOnly) {
            return;
          }
          setError(undefined);
          try {
            if (isEdit) {
              const patches: PatchRequest = [];

              appendJSONPatch({
                patches,
                path: '/spec/displayName',
                newValue: values.displayName,
                originalValue: catalog.spec.displayName,
              });
              appendJSONPatch({
                patches,
                path: '/spec/shortDescription',
                newValue: values.shortDescription,
                originalValue: catalog.spec.shortDescription,
              });
              appendJSONPatch({
                patches,
                path: '/spec/icon',
                newValue: values.icon,
                originalValue: catalog.spec.icon,
              });
              appendJSONPatch({
                patches,
                path: '/spec/provider',
                newValue: values.provider,
                originalValue: catalog.spec.provider,
              });
              appendJSONPatch({
                patches,
                path: '/spec/support',
                newValue: values.support,
                originalValue: catalog.spec.support,
              });

              if (patches.length) {
                const result = await patch<Catalog>(`catalogs/${catalog.metadata.name}`, patches);
                onSuccess(result);
              }
            } else {
              const result = await post<Catalog>('catalogs', {
                apiVersion: ApiVersion.V1ALPHA1,
                kind: 'Catalog',
                metadata: { name: values.name },
                spec: {
                  displayName: values.displayName || undefined,
                  shortDescription: values.shortDescription || undefined,
                  icon: values.icon || undefined,
                  provider: values.provider || undefined,
                  support: values.support || undefined,
                },
              });
              onSuccess(result);
            }
          } catch (e) {
            setError(e);
          }
        }}
      >
        {({ isSubmitting, isValid, submitForm, dirty }) => (
          <>
            <ModalHeader title={title} />
            <ModalBody>
              <FlightCtlForm>
                <NameField
                  name="name"
                  aria-label={t('Name')}
                  isRequired
                  isDisabled={isEdit}
                  resourceType="catalogs"
                  validations={getDnsSubdomainValidations(t)}
                />
                <FormGroup label={t('Display name')}>
                  <TextField name="displayName" aria-label={t('Display name')} isDisabled={isReadOnly} />
                </FormGroup>
                <FormGroup label={t('Short description')}>
                  <TextAreaField name="shortDescription" aria-label={t('Short description')} isDisabled={isReadOnly} />
                </FormGroup>
                <FormGroupWithHelperText label={t('Icon')} content={t('URL or data URI of the catalog item icon.')}>
                  <TextField
                    name="icon"
                    aria-label={t('Icon')}
                    placeholder="https://example.com/icon.svg"
                    isDisabled={isReadOnly}
                  />
                </FormGroupWithHelperText>
                <FormGroup label={t('Provider')}>
                  <TextField name="provider" aria-label={t('Provider')} isDisabled={isReadOnly} />
                </FormGroup>
                <FormGroup label={t('Support')}>
                  <TextField
                    name="support"
                    aria-label={t('Support')}
                    placeholder="https://example.com/support"
                    isDisabled={isReadOnly}
                  />
                </FormGroup>
              </FlightCtlForm>
            </ModalBody>
            <ModalFooter>
              <Stack hasGutter>
                {!!error && (
                  <StackItem>
                    <Alert variant="danger" isInline title={getErrorMessage(error)} />
                  </StackItem>
                )}
                <StackItem>
                  <Split hasGutter>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          variant="primary"
                          onClick={submitForm}
                          isDisabled={!isValid || isSubmitting || !dirty}
                          isLoading={isSubmitting}
                        >
                          {isEdit ? t('Save') : t('Create')}
                        </Button>
                      </SplitItem>
                    )}
                    <SplitItem>
                      <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
                        {isReadOnly ? t('Close') : t('Cancel')}
                      </Button>
                    </SplitItem>
                  </Split>
                </StackItem>
              </Stack>
            </ModalFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateCatalogModal;
