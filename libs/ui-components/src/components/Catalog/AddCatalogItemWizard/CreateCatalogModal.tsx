import * as React from 'react';
import {
  Alert,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
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
import { Catalog } from '@flightctl/types/alpha';

import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { getDnsSubdomainValidations, validKubernetesDnsSubdomain, validURLSchema } from '../../form/validations';
import FlightCtlForm from '../../form/FlightCtlForm';
import NameField from '../../form/NameField';
import TextField from '../../form/TextField';
import IconUploadField from '../../form/IconUploadField';
import { getErrorMessage } from '../../../utils/error';
import TextAreaField from '../../form/TextAreaField';
import { CreateCatalogFormValues } from './types';
import { getCatalogPatches, getCatalogResource } from './utils';

type CreateCatalogModalProps = {
  onClose: VoidFunction;
  onSuccess: (catalog: Catalog) => void;
  catalog?: Catalog;
};

const CreateCatalogModal = ({ onClose, onSuccess, catalog }: CreateCatalogModalProps) => {
  const { t } = useTranslation();
  const { post, patch } = useFetch();
  const navigate = useNavigate();
  const [error, setError] = React.useState<unknown>();
  const [createdCatalog, setCreatedCatalog] = React.useState<Catalog>();

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
              const patches = getCatalogPatches(catalog, values);
              if (patches.length) {
                const result = await patch<Catalog>(`catalogs/${catalog.metadata.name}`, patches);
                onSuccess(result);
              }
            } else {
              const result = await post<Catalog>('catalogs', getCatalogResource(values));
              setCreatedCatalog(result);
            }
          } catch (e) {
            setError(e);
          }
        }}
      >
        {({ isSubmitting, isValid, submitForm, dirty }) => (
          <>
            <ModalHeader title={createdCatalog ? t('Catalog created') : title} />
            <ModalBody>
              {createdCatalog ? (
                <EmptyState status={EmptyStateStatus.success} titleText={t('Catalog created successfully')}>
                  <EmptyStateBody>
                    {t(
                      '"{{catalogName}}" has been created. You can now create a catalog item or return to the catalog.',
                      {
                        catalogName: createdCatalog.spec.displayName || createdCatalog.metadata.name,
                      },
                    )}
                  </EmptyStateBody>
                  <EmptyStateFooter>
                    <EmptyStateActions>
                      <Button variant="primary" onClick={() => onSuccess(createdCatalog)}>
                        {t('Create catalog item')}
                      </Button>
                    </EmptyStateActions>
                    <EmptyStateActions>
                      <Button
                        variant="link"
                        onClick={() => {
                          onClose();
                          navigate(ROUTE.CATALOG);
                        }}
                      >
                        {t('Return to catalog')}
                      </Button>
                    </EmptyStateActions>
                  </EmptyStateFooter>
                </EmptyState>
              ) : (
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
                    <TextAreaField
                      name="shortDescription"
                      aria-label={t('Short description')}
                      isDisabled={isReadOnly}
                    />
                  </FormGroup>
                  <FormGroup label={t('Icon')}>
                    <IconUploadField name="icon" isDisabled={isReadOnly} />
                  </FormGroup>
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
              )}
            </ModalBody>
            {!createdCatalog && (
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
            )}
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateCatalogModal;
