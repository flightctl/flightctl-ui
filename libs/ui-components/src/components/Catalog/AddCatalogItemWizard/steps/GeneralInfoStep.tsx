import * as React from 'react';
import { FormGroup, Grid, GridItem, Spinner, Title } from '@patternfly/react-core';
import { FormikErrors } from 'formik';
import { CatalogList } from '@flightctl/types/alpha';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AddCatalogItemFormValues } from '../types';
import NameField from '../../../form/NameField';
import { getDnsSubdomainValidations } from '../../../form/validations';
import TextField from '../../../form/TextField';
import TextAreaField from '../../../form/TextAreaField';
import CheckboxField from '../../../form/CheckboxField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { useFetch } from '../../../../hooks/useFetch';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<AddCatalogItemFormValues>) => {
  return (
    !errors.name && !errors.homepage && !errors.supportUrl && !errors.documentationUrl && !errors.deprecationMessage
  );
};

const GeneralInfoStep = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const [catalogName, setCatalogName] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(true);

  const { get } = useFetch();
  React.useEffect(() => {
    (async () => {
      try {
        const catalogList = await get<CatalogList>('catalogs');
        if (catalogList.items.length) {
          setCatalogName(catalogList.items[0].metadata.name);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Failed to fetch catalogs', e);
      } finally {
        setIsLoading(false);
      }
    })();
  });

  let content = (
    <FlightCtlForm>
      <NameField
        name="name"
        aria-label={t('Name')}
        isRequired
        isDisabled={isEdit}
        resourceType={`catalogs/${catalogName}/items`}
        validations={getDnsSubdomainValidations(t)}
      />
      <FormGroup label={t('Display name')}>
        <TextField name="displayName" aria-label={t('Display name')} />
      </FormGroup>
      <FormGroupWithHelperText label={t('Icon')} content={t('URL or data URI of the catalog item icon.')}>
        <TextField name="icon" aria-label={t('Icon')} placeholder="https://example.com/icon.svg" />
      </FormGroupWithHelperText>
      <FormGroup label={t('Short description')}>
        <TextAreaField name="shortDescription" aria-label={t('Short description')} />
      </FormGroup>
      <FormGroup label={t('Provider')}>
        <TextField name="provider" aria-label={t('Provider')} />
      </FormGroup>
      <FormGroup label={t('Homepage')}>
        <TextField name="homepage" aria-label={t('Homepage')} placeholder="https://example.com" />
      </FormGroup>
      <FormGroup label={t('Support URL')}>
        <TextField name="supportUrl" aria-label={t('Support URL')} placeholder="https://example.com/support" />
      </FormGroup>
      <FormGroup label={t('Documentation URL')}>
        <TextField name="documentationUrl" aria-label={t('Documentation URL')} placeholder="https://example.com/docs" />
      </FormGroup>
      {isEdit && (
        <CheckboxField name="deprecated" label={t('Deprecated')}>
          <FormGroup label={t('Deprecation message')} isRequired>
            <TextAreaField name="deprecationMessage" aria-label={t('Deprecation message')} isRequired />
          </FormGroup>
          <FormGroup label={t('Replacement')}>
            <TextField
              name="deprecationReplacement"
              aria-label={t('Replacement')}
              helperText={t('Name of the replacement catalog item')}
            />
          </FormGroup>
        </CheckboxField>
      )}
    </FlightCtlForm>
  );

  if (isLoading) {
    content = <Spinner />;
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <Title headingLevel="h2" size="lg">
          {t('General info')}
        </Title>
      </GridItem>
      <GridItem lg={6} md={8}>
        {content}
      </GridItem>
    </Grid>
  );
};

export default GeneralInfoStep;
