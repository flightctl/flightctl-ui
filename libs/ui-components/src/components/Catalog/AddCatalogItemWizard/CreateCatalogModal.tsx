import * as React from 'react';
import {
  ActionGroup,
  Alert,
  Button,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ApiVersion, Catalog } from '@flightctl/types/alpha';

import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getDnsSubdomainValidations, validKubernetesDnsSubdomain } from '../../form/validations';
import FlightCtlForm from '../../form/FlightCtlForm';
import NameField from '../../form/NameField';
import TextField from '../../form/TextField';
import { getErrorMessage } from '../../../utils/error';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import TextAreaField from '../../form/TextAreaField';

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
};

const CreateCatalogModal = ({ onClose, onSuccess }: CreateCatalogModalProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [error, setError] = React.useState<unknown>();

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
        support: Yup.string().url(t('Must be a valid URL')),
      }),
    [t],
  );

  const initialValues: CreateCatalogFormValues = {
    name: '',
    displayName: '',
    shortDescription: '',
    icon: '',
    provider: '',
    support: '',
  };

  return (
    <Modal variant="medium" isOpen onClose={onClose}>
      <Formik<CreateCatalogFormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount
        onSubmit={async (values) => {
          setError(undefined);
          try {
            const catalog = await post<Catalog>('catalogs', {
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
            onSuccess(catalog);
          } catch (e) {
            setError(e);
          }
        }}
      >
        {({ isSubmitting, isValid, submitForm }) => (
          <>
            <ModalHeader title={t('Create catalog')} />
            <ModalBody>
              <FlightCtlForm>
                <NameField
                  name="name"
                  aria-label={t('Name')}
                  isRequired
                  resourceType="catalogs"
                  validations={getDnsSubdomainValidations(t)}
                />
                <FormGroup label={t('Display name')}>
                  <TextField name="displayName" aria-label={t('Display name')} />
                </FormGroup>
                <FormGroup label={t('Short description')}>
                  <TextAreaField name="shortDescription" aria-label={t('Short description')} />
                </FormGroup>
                <FormGroupWithHelperText label={t('Icon')} content={t('URL or data URI of the catalog item icon.')}>
                  <TextField name="icon" aria-label={t('Icon')} placeholder="https://example.com/icon.svg" />
                </FormGroupWithHelperText>
                <FormGroup label={t('Provider')}>
                  <TextField name="provider" aria-label={t('Provider')} />
                </FormGroup>
                <FormGroup label={t('Support')}>
                  <TextField name="support" aria-label={t('Support')} placeholder="https://example.com/support" />
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
                  <ActionGroup>
                    <Button
                      variant="primary"
                      onClick={submitForm}
                      isDisabled={!isValid || isSubmitting}
                      isLoading={isSubmitting}
                    >
                      {t('Create')}
                    </Button>
                    <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
                      {t('Cancel')}
                    </Button>
                  </ActionGroup>
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
