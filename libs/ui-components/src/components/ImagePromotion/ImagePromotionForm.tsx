import * as React from 'react';
import { Alert, FormGroup, FormSection, Spinner } from '@patternfly/react-core';

import FlightCtlForm from '../form/FlightCtlForm';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { CatalogItem, CatalogList } from '@flightctl/types/alpha';
import { ExportFormatType } from '@flightctl/types/imagebuilder';
import FormSelect, { SelectItem } from '../form/FormSelect';
import RadioField from '../form/RadioField';
import TextField from '../form/TextField';
import TextAreaField from '../form/TextAreaField';
import { useFormikContext } from 'formik';
import NameField from '../form/NameField';
import { getDnsSubdomainValidations } from '../form/validations';
import { useCatalogItems } from '../Catalog/useCatalogs';
import { getErrorMessage } from '../../utils/error';
import { ImagePromotionFormValues } from './types';
import ImagePromotionFormatsField from './ImagePromotionFormatsField';

const NewItemForm = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImagePromotionFormValues>();
  return (
    <>
      <NameField
        name="newItem.name"
        aria-label={t('Catalog item name')}
        isRequired
        isDisabled={isDisabled}
        resourceType={`catalogs/${values.catalog}/items`}
        validations={getDnsSubdomainValidations(t)}
      />
      <FormGroup label={t('Display name')}>
        <TextField name="newItem.displayName" isDisabled={isDisabled} />
      </FormGroup>
      <FormGroup label={t('Version')} isRequired>
        <TextField name="newItem.version" isDisabled={isDisabled} />
      </FormGroup>
      <FormGroup label={t('Readme')}>
        <TextAreaField
          name="newItem.readme"
          isDisabled={isDisabled}
          helperText={t('Markdown documentation for this catalog item')}
        />
      </FormGroup>
    </>
  );
};

const ExistingItemForm = ({ catalogItems, isDisabled }: { catalogItems: CatalogItem[]; isDisabled?: boolean }) => {
  const { t } = useTranslation();

  const selectCatalogItems = catalogItems
    .sort((a, b) => {
      const aName = a.spec.displayName || a.metadata.name || '';
      const bName = b.spec.displayName || b.metadata.name || '';
      return aName.localeCompare(bName);
    })
    .reduce<Record<string, SelectItem>>((acc, curr) => {
      acc[curr.metadata.name || ''] = {
        label: curr.spec.displayName || curr.metadata.name,
      };
      return acc;
    }, {});
  return (
    <>
      <FormGroup label={t('Catalog item')} isRequired>
        <FormSelect name="existingItem.name" items={selectCatalogItems} isDisabled={isDisabled} />
      </FormGroup>
      <FormGroup label={t('Version')} isRequired>
        <TextField name="existingItem.version" isDisabled={isDisabled} />
      </FormGroup>
      <FormSection title={t('Updates')}>
        <FormGroup label={t('Replaces')}>
          <TextField
            name="existingItem.replaces"
            isDisabled={isDisabled}
            placeholder="1.0.0"
            helperText={t('Single version this one replaces, defining the primary upgrade edge')}
          />
        </FormGroup>
        <FormGroup label={t('Skips')}>
          <TextField
            name="existingItem.skips"
            isDisabled={isDisabled}
            placeholder="1.0.1, 1.0.2"
            helperText={t('Comma-separated versions that can upgrade directly to this one')}
          />
        </FormGroup>
        <FormGroup label={t('Skip range')}>
          <TextField
            name="existingItem.skipRange"
            isDisabled={isDisabled}
            placeholder=">=1.0.0 <1.5.0"
            helperText={t('Semver range of versions that can upgrade directly to this one')}
          />
        </FormGroup>
      </FormSection>
      <FormGroup label={t('Readme')}>
        <TextAreaField
          name="existingItem.readme"
          isDisabled={isDisabled}
          helperText={t('Markdown documentation for this version')}
        />
      </FormGroup>
    </>
  );
};

const ImagePromotionForm = ({
  isEdit,
  canAmendExportFormats = true,
  availableFormats,
}: {
  isEdit?: boolean;
  canAmendExportFormats?: boolean;
  availableFormats?: ExportFormatType[];
}) => {
  const { t } = useTranslation();

  const { values } = useFormikContext<ImagePromotionFormValues>();

  const [catalogList, catalogsLoading, catalogsErr] = useFetchPeriodically<CatalogList>({
    endpoint: 'catalogs',
  });

  const [catalogItems, , itemsErr] = useCatalogItems({
    catalogs: values.catalog ? [values.catalog] : undefined,
  });

  const catalogs = (catalogList?.items || [])
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

  if (catalogsLoading) {
    return <Spinner />;
  }

  if (catalogsErr) {
    return (
      <Alert isInline variant="danger" title={t('Failed to load catalogs')}>
        {getErrorMessage(catalogsErr)}
      </Alert>
    );
  }

  if (itemsErr) {
    return (
      <Alert isInline variant="danger" title={t('Failed to load catalog items')}>
        {getErrorMessage(itemsErr)}
      </Alert>
    );
  }

  return (
    <FlightCtlForm>
      <NameField
        resourceType="imagepromotions"
        name="name"
        aria-label={t('Image Promotion name')}
        isRequired
        isDisabled={isEdit}
        validations={getDnsSubdomainValidations(t)}
      />
      <ImagePromotionFormatsField
        isEdit={isEdit}
        canAmendExportFormats={canAmendExportFormats}
        availableFormats={availableFormats}
      />
      <FormGroup label={t('Catalog')} isRequired>
        <FormSelect name="catalog" items={catalogs} isDisabled={isEdit} />
      </FormGroup>
      <FormGroup label={t('Add as')} isRequired>
        <RadioField
          id="existing-item"
          name="type"
          label={t('Existing catalog item')}
          checkedValue="existing"
          isDisabled={!catalogItems.length || isEdit}
        />
        <RadioField id="new-item" name="type" label={t('New catalog item')} checkedValue="new" isDisabled={isEdit} />
      </FormGroup>
      {values.type === 'new' && <NewItemForm isDisabled={isEdit} />}
      {values.type === 'existing' && <ExistingItemForm catalogItems={catalogItems} isDisabled={isEdit} />}
    </FlightCtlForm>
  );
};

export default ImagePromotionForm;
