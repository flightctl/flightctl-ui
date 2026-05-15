import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';

import { ImageBuild } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import TextField from '../../form/TextField';
import FlightCtlForm from '../../form/FlightCtlForm';
import { getBuildNameValidations } from '../../form/validations';
import NameField from '../../form/NameField';
import { NewVersionFormValues, newVersionValidationSchema } from './utils';
import ImageUrlCard from '../ImageUrlCard';
import { getImageReference } from '../../../utils/imageBuilds';
import { OciRegistriesContextProvider, useOciRegistriesContext } from '../OciRegistriesContext';

const bumpImageTag = (tag: string): string => {
  const match = tag.match(/^(.*)-(\d+)$/);
  if (match) {
    return `${match[1]}-${parseInt(match[2], 10) + 1}`;
  }
  return `${tag}-1`;
};

type NewVersionFormProps = {
  isSubmitting: boolean;
  submitError: string | undefined;
  imageBuild: ImageBuild;
};

const NewVersionForm = ({ isSubmitting, submitError, imageBuild }: NewVersionFormProps) => {
  const { t } = useTranslation();
  const { ociRegistries } = useOciRegistriesContext();
  const { values } = useFormikContext<NewVersionFormValues>();

  const imageReference = React.useMemo(() => {
    return getImageReference(ociRegistries, {
      repository: imageBuild.spec.destination.repository,
      imageName: imageBuild.spec.destination.imageName,
      imageTag: values.destinationImageTag || imageBuild.spec.destination.imageTag,
    });
  }, [ociRegistries, imageBuild.spec.destination, values.destinationImageTag]);

  return (
    <Stack hasGutter>
      <StackItem>
        <FlightCtlForm>
          <NameField
            name="name"
            aria-label={t('Build name')}
            isRequired
            isDisabled={isSubmitting}
            validations={getBuildNameValidations(t)}
            resourceType="imagebuilds"
          />
          <FormGroup label={t('Base image tag')}>
            <TextField name="sourceImageTag" aria-label={t('Base image tag')} isDisabled={isSubmitting} />
          </FormGroup>
          <FormGroup label={t('Output image tag')}>
            <TextField
              name="destinationImageTag"
              aria-label={t('Output image tag')}
              helperText={t('Tag for the built image. Defaults to the parent tag incremented by one.')}
              isDisabled={isSubmitting}
            />
          </FormGroup>
          {submitError && (
            <Alert isInline variant="danger" title={t('Failed to create new version')}>
              {submitError}
            </Alert>
          )}
        </FlightCtlForm>
      </StackItem>
      <StackItem>
        <ImageUrlCard imageReference={imageReference} />
      </StackItem>
    </Stack>
  );
};

type NewVersionImageBuildModalProps = {
  imageBuild: ImageBuild;
  onClose: (newBuildName?: string) => void;
};

const NewVersionImageBuildModalWithRegistries = ({ imageBuild, onClose }: NewVersionImageBuildModalProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const { isLoading, error } = useOciRegistriesContext();

  const [submitError, setSubmitError] = React.useState<string>();

  const parentName = imageBuild.metadata.name as string;
  const parentSourceTag = imageBuild.spec.source.imageTag;
  const parentDestinationTag = imageBuild.spec.destination.imageTag;

  const initialValues: NewVersionFormValues = {
    name: '',
    sourceImageTag: parentSourceTag,
    destinationImageTag: bumpImageTag(parentDestinationTag),
  };

  const handleSubmit = async (values: NewVersionFormValues) => {
    setSubmitError(undefined);
    const name = values.name.trim();
    try {
      await post<Record<string, string>, ImageBuild>(`imagebuilds/${parentName}/newversion`, {
        name,
        ...(values.sourceImageTag.trim() ? { sourceImageTag: values.sourceImageTag.trim() } : {}),
        ...(values.destinationImageTag.trim() ? { destinationImageTag: values.destinationImageTag.trim() } : {}),
      });
      onClose(name);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  const content = error ? (
    <Alert title={t('Failed to load OCI repositories')} isInline variant="danger">
      {getErrorMessage(error)}
    </Alert>
  ) : isLoading ? (
    <Spinner />
  ) : undefined;

  return (
    <Formik<NewVersionFormValues>
      initialValues={initialValues}
      validationSchema={newVersionValidationSchema(t)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, submitForm, isValid, dirty }) => (
        <Modal isOpen onClose={isSubmitting ? undefined : () => onClose()} variant="small">
          <ModalHeader title={t('Build new version')} />
          {content ? (
            <>
              <ModalBody>{content}</ModalBody>
              <ModalFooter>
                <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
                  {t('Cancel')}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalBody>
                <Stack hasGutter>
                  <StackItem>
                    <Content component={ContentVariants.small}>
                      {t('Create an updated version using the same parameters')}
                    </Content>
                  </StackItem>
                  <StackItem>
                    <NewVersionForm isSubmitting={isSubmitting} submitError={submitError} imageBuild={imageBuild} />
                  </StackItem>
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button
                  key="confirm"
                  variant="primary"
                  isDisabled={isSubmitting || !isValid || !dirty}
                  isLoading={isSubmitting}
                  onClick={submitForm}
                >
                  {t('Build new version')}
                </Button>
                <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
                  {t('Cancel')}
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>
      )}
    </Formik>
  );
};

const NewVersionImageBuildModal = (props: NewVersionImageBuildModalProps) => {
  return (
    <OciRegistriesContextProvider>
      <NewVersionImageBuildModalWithRegistries {...props} />
    </OciRegistriesContextProvider>
  );
};

export default NewVersionImageBuildModal;
