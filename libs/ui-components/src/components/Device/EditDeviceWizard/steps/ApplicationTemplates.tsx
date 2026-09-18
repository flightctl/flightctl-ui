import * as React from 'react';

import {
  Button,
  Flex,
  FormGroup,
  FormSection,
  Grid,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import CatalogIcon from '@patternfly/react-icons/dist/js/icons/catalog-icon';

import { AppType } from '@flightctl/types';
import {
  AppSpecType,
  type CatalogAppForm,
  type DeviceSpecConfigFormValues,
  type ManualAppForm,
  isCatalogAppEntry,
} from '../../../../types/deviceSpec';
import { createInitialAppForm, createInitialManualAppEntry } from '../deviceSpecUtils';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import RadioField from '../../../form/RadioField';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { getAppTypeLabel, manualAppTypeOptions } from '../../../../utils/catalogTypes';
import DeleteModal from '../../../modals/DeleteModal/DeleteModal';
import ApplicationImageForm from './ApplicationImageForm';
import ApplicationInlineForm from './ApplicationInlineForm';
import ApplicationContainerForm from './ApplicationContainerForm';
import ApplicationHelmForm from './ApplicationHelmForm';
import ApplicationVmForm from './ApplicationVmForm';
import ApplicationVolumeForm from './ApplicationVolumeForm';
import ApplicationVariablesForm from './ApplicationVariablesForm';
import ApplicationIntegritySettings from './ApplicationIntegritySettings';
import CatalogRefCard from '../../../CatalogRef/CatalogRefCard';
import ApplicationWorkloadCard from './ApplicationWorkloadCard';
import CatalogAddAppModal from '../../../CatalogComposition/CatalogAddAppModal';
import CatalogEditAppModal from '../../../CatalogComposition/CatalogEditAppModal';
import { createCatalogAppEntry } from '../../../CatalogComposition/catalogCompositionUtils';
import { useResolvedCatalogRef } from '../../../Catalog/useResolvedCatalogRef';

import './ApplicationsForm.css';

const CatalogManagedApplicationSection = ({
  index,
  isReadOnly,
  showUpdateStatus,
}: {
  index: number;
  isReadOnly?: boolean;
  showUpdateStatus: boolean;
}) => {
  const appFieldName = `applications[${index}].app`;
  const [{ value: app }, { error }, { setValue }] = useField<CatalogAppForm>(appFieldName);
  const resolved = useResolvedCatalogRef(app.catalogItemRef);
  const [isAdvancedEditOpen, setIsAdvancedEditOpen] = React.useState(false);

  return (
    <>
      <CatalogRefCard
        catalogItemRef={app.catalogItemRef}
        headerTitle={app.name}
        showUpdateStatus={showUpdateStatus}
        onEdit={isReadOnly || !resolved?.item ? undefined : () => setIsAdvancedEditOpen(true)}
        formikError={error as unknown as CatalogAppForm}
      />
      {resolved?.item && isAdvancedEditOpen && (
        <CatalogEditAppModal
          catalogItem={resolved.item}
          appForm={app}
          onClose={() => setIsAdvancedEditOpen(false)}
          onSave={(nextApp) => {
            void setValue(nextApp);
            setIsAdvancedEditOpen(false);
          }}
        />
      )}
    </>
  );
};

const ApplicationSection = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { setFieldTouched } = useFormikContext<DeviceSpecConfigFormValues>();
  const appFieldName = `applications[${index}].app`;
  const [{ value: app }, , { setValue }] = useField<ManualAppForm>(appFieldName);
  const { appType, specType, name: appName } = app;
  const [, { error }, { setTouched }] = useField(appFieldName);
  // Initial expanded state: an app that have been just created is expanded, otherwise it's collapsed.
  const [isExpanded, setIsExpanded] = React.useState(!appName);

  const isContainer = app.appType === AppType.AppTypeContainer;
  const isHelm = app.appType === AppType.AppTypeHelm;
  const isQuadlet = app.appType === AppType.AppTypeQuadlet;
  const isCompose = app.appType === AppType.AppTypeCompose;
  const isVm = app.appType === AppType.AppTypeVm;

  const isContainerIncomplete = isContainer && !('ports' in app);
  const isHelmIncomplete = isHelm && !('valuesFiles' in app);
  const isQuadletComposeIncomplete = (isQuadlet || isCompose) && !('volumes' in app);
  const isVmIncomplete = isVm && !('diskImage' in app);

  const shouldResetApp = isContainerIncomplete || isHelmIncomplete || isQuadletComposeIncomplete || isVmIncomplete;

  const appTypesOptions = manualAppTypeOptions(t);

  React.useEffect(() => {
    if (shouldResetApp) {
      const initialApp = createInitialAppForm(appType, appName || '');
      setValue(initialApp, false);
    }
  }, [shouldResetApp, appType, appName, setValue]);

  const applicationTitle = appName || '' || t('Application {{ appNum }}', { appNum: index + 1 });

  const handleToggle = () => {
    setTouched(true);
    Object.keys((error as unknown as object) || {}).forEach((key) => {
      setFieldTouched(`${appFieldName}.${key}`, true);
    });
    setIsExpanded((expanded) => !expanded);
  };

  return (
    <ApplicationWorkloadCard
      title={applicationTitle}
      isExpanded={isExpanded}
      onToggle={handleToggle}
      hasError={!isExpanded && !!error}
      errorLabel={applicationTitle}
      headerActions={
        <Label isCompact variant="filled" color="purple">
          {getAppTypeLabel(appType, t)}
        </Label>
      }
    >
      <Grid span={12} hasGutter>
        <FormGroup label={t('Application type')} isRequired>
          <FormSelect
            items={appTypesOptions}
            name={`${appFieldName}.appType`}
            placeholderText={t('Select an application type')}
            isDisabled={isReadOnly}
          />
        </FormGroup>

        {isVm ? (
          <ApplicationVmForm index={index} isReadOnly={isReadOnly} />
        ) : isContainer ? (
          <ApplicationContainerForm index={index} isReadOnly={isReadOnly} />
        ) : isHelm ? (
          <ApplicationHelmForm index={index} isReadOnly={isReadOnly} />
        ) : (
          <>
            <FormGroupWithHelperText
              label={t('Definition source')}
              isRequired
              content={
                <Stack hasGutter>
                  <StackItem>
                    <strong>{t('Configuration Sources')}:</strong>
                  </StackItem>
                  <StackItem>
                    <ul>
                      <li>
                        <strong>{t('OCI reference')}</strong> -{' '}
                        {t('Pull definitions from container registry (reusable, versioned).')}
                      </li>
                      <li>
                        <strong>{t('Inline')}</strong> -{' '}
                        {t('Define application files directly in this interface (custom, one-off).')}
                      </li>
                    </ul>
                  </StackItem>
                </Stack>
              }
            >
              <Split hasGutter>
                <SplitItem>
                  <RadioField
                    id={`${appFieldName}-spec-type-image`}
                    name={`${appFieldName}.specType`}
                    label={t('OCI reference URL')}
                    isDisabled={isReadOnly}
                    checkedValue={AppSpecType.OCI_IMAGE}
                  />
                </SplitItem>
                <SplitItem>
                  <RadioField
                    id={`${appFieldName}-spec-type-inline`}
                    name={`${appFieldName}.specType`}
                    label={t('Inline')}
                    isDisabled={isReadOnly}
                    checkedValue={AppSpecType.INLINE}
                  />
                </SplitItem>{' '}
              </Split>
            </FormGroupWithHelperText>

            <FormGroupWithHelperText
              label={t('Application name')}
              content={
                specType === AppSpecType.INLINE
                  ? t('The unique identifier for this application.')
                  : t('If not specified, the image name will be used. Application name must be unique.')
              }
              isRequired={specType === AppSpecType.INLINE}
            >
              <TextField aria-label={t('Application name')} name={`${appFieldName}.name`} isDisabled={isReadOnly} />
            </FormGroupWithHelperText>

            {specType === AppSpecType.OCI_IMAGE && (
              <ApplicationImageForm applicationName={appFieldName} isReadOnly={isReadOnly} isRequired />
            )}
            {specType === AppSpecType.INLINE && (
              <ApplicationInlineForm files={app.files || []} index={index} isReadOnly={isReadOnly} />
            )}
          </>
        )}

        {(isQuadlet || isContainer) && !isVm && <ApplicationIntegritySettings index={index} isReadOnly={isReadOnly} />}

        {!isHelm && !isVm && (
          <>
            <ApplicationVolumeForm
              appFieldName={appFieldName}
              isReadOnly={isReadOnly}
              isSingleContainerApp={isContainer}
            />
            <ApplicationVariablesForm appFieldName={appFieldName} isReadOnly={isReadOnly} />
          </>
        )}
      </Grid>
    </ApplicationWorkloadCard>
  );
};

const ApplicationTemplates = ({ isReadOnly, isEdit = false }: { isReadOnly?: boolean; isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();
  const [appIndexToDelete, setAppIndexToDelete] = React.useState<number | undefined>(undefined);
  const [isCatalogSelectOpen, setIsCatalogSelectOpen] = React.useState(false);

  if (isReadOnly && values.applications.length === 0) {
    return null;
  }

  return (
    <FormGroupWithHelperText
      label={t('Application workloads')}
      content={t(
        'Add workloads from the Software Catalog or define them manually. Catalog items pin a channel and version in this template.',
      )}
    >
      <FieldArray name="applications">
        {(arrayHelpers) => (
          <>
            {values.applications.map((entry, index) => {
              const isCatalogApp = isCatalogAppEntry(entry);
              return (
                <FormSection key={index}>
                  <Split hasGutter>
                    <SplitItem isFilled>
                      {isCatalogApp ? (
                        <CatalogManagedApplicationSection
                          index={index}
                          isReadOnly={isReadOnly}
                          showUpdateStatus={isEdit}
                        />
                      ) : (
                        <ApplicationSection index={index} isReadOnly={isReadOnly} />
                      )}
                    </SplitItem>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          aria-label={t('Delete application')}
                          variant="link"
                          isDanger
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => {
                            if (isEdit) {
                              setAppIndexToDelete(index);
                            } else {
                              arrayHelpers.remove(index);
                            }
                          }}
                        />
                      </SplitItem>
                    )}
                  </Split>
                </FormSection>
              );
            })}

            {appIndexToDelete !== undefined && (
              <DeleteModal
                onClose={() => setAppIndexToDelete(undefined)}
                onDelete={() => {
                  arrayHelpers.remove(appIndexToDelete);
                  setAppIndexToDelete(undefined);
                  return Promise.resolve();
                }}
                resourceType="application"
                confirmText={t(
                  'This removes the application from the template. You can add it again from the catalog or manually.',
                )}
              />
            )}

            {!isReadOnly && (
              <FormSection>
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  gap={{ default: 'gapSm' }}
                  flexWrap={{ default: 'wrap' }}
                >
                  <Button variant="secondary" icon={<CatalogIcon />} onClick={() => setIsCatalogSelectOpen(true)}>
                    {t('Add from software catalog')}
                  </Button>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    iconPosition="start"
                    onClick={() => {
                      arrayHelpers.push(createInitialManualAppEntry(AppType.AppTypeContainer));
                    }}
                  >
                    {t('Add application manually')}
                  </Button>
                </Flex>
              </FormSection>
            )}

            {isCatalogSelectOpen && (
              <CatalogAddAppModal
                onClose={() => setIsCatalogSelectOpen(false)}
                onConfirm={(selection, appName, advancedConfig) => {
                  arrayHelpers.push(createCatalogAppEntry(appName, selection, advancedConfig));
                  setIsCatalogSelectOpen(false);
                }}
              />
            )}
          </>
        )}
      </FieldArray>
    </FormGroupWithHelperText>
  );
};

export default ApplicationTemplates;
