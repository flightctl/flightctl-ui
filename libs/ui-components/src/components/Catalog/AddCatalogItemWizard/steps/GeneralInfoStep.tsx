import * as React from 'react';
import { Alert, FormGroup, Grid, GridItem, Spinner, Title } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';
import { CatalogList } from '@flightctl/types/alpha';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AddCatalogItemFormValues } from '../types';
import NameField from '../../../form/NameField';
import { getDnsSubdomainValidations } from '../../../form/validations';
import TextField from '../../../form/TextField';
import TextAreaField from '../../../form/TextAreaField';
import IconUploadField from '../../../form/IconUploadField';
import CheckboxField from '../../../form/CheckboxField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import FormSelect, { SelectItem } from '../../../form/FormSelect';
import CreateCatalogModal from '../CreateCatalogModal';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../../../utils/error';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../../types/rbac';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<AddCatalogItemFormValues>) => {
  return (
    !errors.catalog &&
    !errors.name &&
    !errors.homepage &&
    !errors.supportUrl &&
    !errors.documentationUrl &&
    !errors.deprecationMessage &&
    !errors.icon
  );
};

const createCatalogPermission = [{ kind: RESOURCE.CATALOG, verb: VERB.CREATE }];

const GeneralInfoStep = ({ isEdit, isReadOnly }: { isEdit?: boolean; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<AddCatalogItemFormValues>();
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const { checkPermissions } = usePermissionsContext();
  const [canCreateCatalog] = checkPermissions(createCatalogPermission);

  const [catalogList, catalogsLoading, catalogsErr, refetch] = useFetchPeriodically<CatalogList>({
    endpoint: 'catalogs',
  });

  React.useEffect(() => {
    const unownedCatalogs = (catalogList?.items || []).filter((c) => !c.metadata.owner);
    if (unownedCatalogs.length === 1 && !values.catalog) {
      void setFieldValue('catalog', unownedCatalogs[0].metadata.name, true);
    }
  }, [catalogList?.items, values.catalog, setFieldValue]);

  const catalogItems = (catalogList?.items || [])
    .sort((a, b) => {
      const aOwned = !!a.metadata.owner;
      const bOwned = !!b.metadata.owner;
      if (aOwned !== bOwned) {
        return aOwned ? 1 : -1;
      }
      const aName = a.spec.displayName || a.metadata.name || '';
      const bName = b.spec.displayName || b.metadata.name || '';
      return aName.localeCompare(bName);
    })
    .reduce<Record<string, SelectItem>>((acc, curr) => {
      acc[curr.metadata.name || ''] = {
        label: curr.spec.displayName || curr.metadata.name,
        isDisabled: !!curr.metadata.owner,
        description: curr.metadata.owner ? t('Catalog is owned by Resource sync') : undefined,
      };
      return acc;
    }, {});

  let content: React.ReactNode = (
    <FlightCtlForm>
      <FormGroup label={t('Catalog')} isRequired>
        <FormSelect
          name="catalog"
          items={catalogItems}
          placeholderText={t('Select a catalog')}
          isDisabled={isEdit || isReadOnly}
          addAction={
            !isEdit && !isReadOnly && canCreateCatalog
              ? { label: t('Create catalog'), onAdd: () => setCreateModalOpen(true) }
              : undefined
          }
        />
      </FormGroup>
      <NameField
        name="name"
        aria-label={t('Name')}
        isRequired
        isDisabled={isEdit || isReadOnly}
        resourceType={`catalogs/${values.catalog}/items`}
        validations={getDnsSubdomainValidations(t)}
      />
      <FormGroup label={t('Display name')}>
        <TextField name="displayName" aria-label={t('Display name')} isDisabled={isReadOnly} />
      </FormGroup>
      <FormGroup label={t('Icon')}>
        <IconUploadField name="icon" isDisabled={isReadOnly} />
      </FormGroup>
      <FormGroup label={t('Short description')}>
        <TextAreaField name="shortDescription" aria-label={t('Short description')} isDisabled={isReadOnly} />
      </FormGroup>
      <FormGroup label={t('Provider')}>
        <TextField name="provider" aria-label={t('Provider')} isDisabled={isReadOnly} />
      </FormGroup>
      <FormGroup label={t('Homepage')}>
        <TextField
          name="homepage"
          aria-label={t('Homepage')}
          placeholder="https://example.com"
          isDisabled={isReadOnly}
        />
      </FormGroup>
      <FormGroup label={t('Support URL')}>
        <TextField
          name="supportUrl"
          aria-label={t('Support URL')}
          placeholder="https://example.com/support"
          isDisabled={isReadOnly}
        />
      </FormGroup>
      <FormGroup label={t('Documentation URL')}>
        <TextField
          name="documentationUrl"
          aria-label={t('Documentation URL')}
          placeholder="https://example.com/docs"
          isDisabled={isReadOnly}
        />
      </FormGroup>
      {isEdit && (
        <CheckboxField name="deprecated" label={t('Deprecated')} isDisabled={isReadOnly}>
          <FormGroup label={t('Deprecation message')} isRequired>
            <TextAreaField
              name="deprecationMessage"
              aria-label={t('Deprecation message')}
              isRequired
              isDisabled={isReadOnly}
            />
          </FormGroup>
          <FormGroup label={t('Replacement')}>
            <TextField
              name="deprecationReplacement"
              aria-label={t('Replacement')}
              helperText={t('Name of the replacement catalog item')}
              isDisabled={isReadOnly}
            />
          </FormGroup>
        </CheckboxField>
      )}
    </FlightCtlForm>
  );

  if (catalogsLoading) {
    content = <Spinner />;
  }

  if (catalogsErr) {
    content = (
      <Alert isInline variant="danger" title={t('Failed to fetch catalogs')}>
        {getErrorMessage(catalogsErr)}
      </Alert>
    );
  }

  return (
    <>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h2" size="lg">
            {t('General info')}
          </Title>
        </GridItem>
        <GridItem>{content}</GridItem>
      </Grid>
      {createModalOpen && (
        <CreateCatalogModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(catalog) => {
            setCreateModalOpen(false);
            refetch();
            void setFieldValue('catalog', catalog.metadata.name, true);
          }}
        />
      )}
    </>
  );
};

export default GeneralInfoStep;
