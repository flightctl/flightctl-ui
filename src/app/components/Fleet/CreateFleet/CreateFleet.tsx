import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import * as yaml from 'js-yaml';
import * as Yup from 'yup';

import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  Form,
  FormGroup,
  Grid,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Fleet, FleetList } from '@types';
import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';
import FlightCtlActionGroup from '@app/components/form/FlightCtlActionGroup';

import LabelsField from '../../form/LabelsField';
import { FleetFormValues } from './types';
import ConfigTemplateForm from './ConfigTemplateForm';
import TextField from '@app/components/form/TextField';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

const validationSchema = (t: TFunction, fleets: Fleet[]) => {
  const existingFleets = fleets.map((f) => f.metadata.name);
  return Yup.object<FleetFormValues>({
    name: Yup.string()
      .required(t('Name is required.'))
      .notOneOf(existingFleets, t('Fleet with the same name already exists.')),
    osImage: Yup.string(),
    fleetLabels: Yup.array().required(),
    labels: Yup.array().required(),
    configTemplates: Yup.array().of(
      Yup.object({
        type: Yup.string().required(),
        name: Yup.string().required(t('Name is required.')),
        path: Yup.string().required(t('Path is required.')),
        repoURL: Yup.string().required(t('Repository URL is required.')),
        targetRevision: Yup.string().required(t('Target revision is required.')),
      }),
    ),
  });
};

const getFleetResource = (values: FleetFormValues): Fleet => ({
  apiVersion: API_VERSION,
  kind: 'Fleet',
  metadata: {
    name: values.name,
    labels: values.fleetLabels.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {}),
  },
  spec: {
    selector: {
      matchLabels: values.labels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
    },
    template: {
      metadata: {
        labels: {
          fleet: values.name,
        },
      },
      spec: {
        os: {
          image: values.osImage,
        },
        config: values.configTemplates.map((ct) => {
          if (ct.type === 'git') {
            return {
              configType: 'GitConfigProviderSpec',
              name: ct.name,
              gitRef: {
                path: ct.path,
                repository: ct.repoURL,
                targetRevision: ct.targetRevision,
              },
            };
          }
          if (ct.type === 'kube') {
            return {
              configType: 'KubernetesSecretProviderSpec',
              name: ct.name,
              secretRef: {
                mountPath: ct.mountPath,
                name: ct.secretName,
                namespace: ct.secretNs,
              },
            };
          }
          return {
            configType: 'InlineConfigProviderSpec',
            inline: yaml.load(ct.inline),
            name: ct.name,
          };
        }),
      },
    },
  },
});

const CreateFleetForm = ({ children }: React.PropsWithChildren<Record<never, never>>) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { values, setFieldValue, submitForm, isSubmitting, isValid } = useFormikContext<FleetFormValues>();
  return (
    <Form>
      <Grid hasGutter span={8}>
        <FormGroup label={t('Name')} isRequired>
          <TextField
            name="name"
            aria-label={t('Name')}
            value={values.name}
            onChange={(_, value) => setFieldValue('name', value)}
          />
        </FormGroup>
        <FormGroup label={t('Device label selector')}>
          <LabelsField labels={values.labels} setLabels={(newLabels) => setFieldValue('labels', newLabels)} />
        </FormGroup>
        <FormGroup label={t('Fleet labels')}>
          <LabelsField labels={values.fleetLabels} setLabels={(newLabels) => setFieldValue('fleetLabels', newLabels)} />
        </FormGroup>
        <FormGroup label={t('OS image')}>
          <TextField
            name="osImage"
            aria-label={t('OS image')}
            value={values.osImage}
            onChange={(_, value) => setFieldValue('osImage', value)}
            helperText={t(
              'Must be either an OCI image ref (e.g. "quay.io/redhat/rhde:9.3") or ostree ref (e.g. "https://ostree.fedoraproject.org/iot?ref=fedora/stable/x86_64/iot"). Keep this empty if you do not want to manage your OS from fleet.',
            )}
          />
        </FormGroup>
        <FormGroup label={t('Configuration templates')} isRequired>
          <ConfigTemplateForm />
        </FormGroup>
      </Grid>
      {children}
      <FlightCtlActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitting || !isValid}>
          {t('Create fleet')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

const CreateFleet = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { post } = useFetch();
  const [error, setError] = React.useState<string>();
  const [fleetList, isLoading, fetchError] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (fetchError) {
    return (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {getErrorMessage(fetchError)}
      </Alert>
    );
  }
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/devicemanagement/fleets">{t('Fleets')}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{t('Create fleet')}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {t('Create fleet')}
          </Title>
        </StackItem>
        <StackItem>
          <Formik<FleetFormValues>
            initialValues={{
              name: '',
              osImage: '',
              fleetLabels: [],
              labels: [],
              configTemplates: [
                {
                  type: 'git',
                  name: '',
                  path: '',
                  repoURL: '',
                  targetRevision: '',
                },
              ],
            }}
            validationSchema={validationSchema(t, fleetList?.items || [])}
            onSubmit={async (values) => {
              setError(undefined);
              try {
                await post<Fleet>('fleets', getFleetResource(values));
                navigate('/devicemanagement/fleets');
              } catch (e) {
                setError(getErrorMessage(e));
              }
            }}
            validateOnMount
          >
            <CreateFleetForm>
              {error && (
                <Alert isInline variant="danger" title={t('An error occurred')}>
                  {error}
                </Alert>
              )}
            </CreateFleetForm>
          </Formik>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default CreateFleet;
