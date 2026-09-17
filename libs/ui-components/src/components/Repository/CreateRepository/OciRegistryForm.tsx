import * as React from 'react';
import { Alert, Content, Divider, FormGroup, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { Trans } from 'react-i18next';

import { OciRepoSpec } from '@flightctl/types';

import { useExistingDeltaStorageTarget } from '../../../hooks/useExistingDeltaStorageTarget';
import { useTranslation } from '../../../hooks/useTranslation';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import WithTooltip from '../../common/WithTooltip';
import { type RepositoryFormValues } from './types';
import DeltaStorageSelection from './DeltaStorageSelection';
import OciBaseImagesSection from './OciBaseImagesSection';
import OciPushPlacementSection from './OciPushPlacementSection';
import OciRegistryAccessMode from './OciRegistryAccessMode';

type OciConfig = RepositoryFormValues['ociConfig'];

const DeltaStorageSection = ({
  currentRepoName,
  isEdit,
  isAccessModeDisabled,
}: {
  currentRepoName?: string;
  isEdit?: boolean;
  isAccessModeDisabled: boolean;
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<RepositoryFormValues>();
  const { existingDeltaTargetName, isLoading } = useExistingDeltaStorageTarget(currentRepoName);

  const ociConfig = values.ociConfig as NonNullable<OciConfig>;
  const deltaStorageTarget = ociConfig.deltaStorageTarget;
  const isDeltaStorageBlocked = Boolean(existingDeltaTargetName);

  React.useEffect(() => {
    if (isDeltaStorageBlocked && deltaStorageTarget) {
      void setFieldValue('ociConfig.deltaStorageTarget', false);
    }
  }, [isDeltaStorageBlocked, deltaStorageTarget, setFieldValue]);

  return (
    <Stack hasGutter>
      <StackItem>
        <DeltaStorageSelection
          isDisabled={isDeltaStorageBlocked || isLoading}
          isEdit={isEdit}
          isAccessModeDisabled={isAccessModeDisabled}
        />
      </StackItem>
      {existingDeltaTargetName && (
        <StackItem>
          <Alert isInline variant="info" title={t('This organization already has a repository for delta storage')}>
            <Trans t={t} values={{ name: existingDeltaTargetName }}>
              The repository <strong>{'{{name}}'}</strong> is currently configured as the delta storage repository for
              this organization.
            </Trans>
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

type OciRegistryFormProps = {
  isAccessModeDisabled: boolean;
  accessModeDisabledReason?: string;
  currentRepoName?: string;
  isEdit?: boolean;
};

const OciRegistryForm = ({
  isAccessModeDisabled,
  accessModeDisabledReason,
  currentRepoName,
  isEdit,
}: OciRegistryFormProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();

  const ociConfig = values.ociConfig as NonNullable<OciConfig>;
  const isReadWrite = ociConfig.accessMode === OciRepoSpec.accessMode.READ_WRITE;
  return (
    <Stack hasGutter style={{ '--pf-v6-l-stack--m-gutter--Gap': '2rem' } as React.CSSProperties}>
      <StackItem>
        <FormGroup label={t('Registry hostname')} isRequired fieldId="oci-registry-hostname">
          <TextField
            name="ociConfig.registry"
            aria-label={t('Registry hostname')}
            helperText={t('For example: quay.io, registry.redhat.io, myregistry.com:5000')}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={t('Scheme')} role="radiogroup" fieldId="oci-registry-scheme">
          <Split hasGutter>
            <SplitItem>
              <RadioField
                id="oci-scheme-https"
                name="ociConfig.scheme"
                label={t('HTTPS')}
                checkedValue={OciRepoSpec.scheme.HTTPS}
              />
            </SplitItem>
            <SplitItem>
              <RadioField
                id="oci-scheme-http"
                name="ociConfig.scheme"
                label={t('HTTP')}
                checkedValue={OciRepoSpec.scheme.HTTP}
              />
            </SplitItem>
          </Split>
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroupWithHelperText
          label={t('Registry usage')}
          content={t(
            'Choose how the platform uses this registry. Read only is for source registries you pull from. Read and write is required when the platform stores content such as image builds or delta updates.',
          )}
        >
          <Stack hasGutter>
            <StackItem>
              <Content style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                {t('Choose how the platform should use this registry.')}
              </Content>
            </StackItem>
            <StackItem>
              <WithTooltip showTooltip={isAccessModeDisabled} content={accessModeDisabledReason}>
                <OciRegistryAccessMode isSelectable={!isAccessModeDisabled} />
              </WithTooltip>
            </StackItem>
          </Stack>
        </FormGroupWithHelperText>
      </StackItem>
      <StackItem>
        <Divider />
      </StackItem>

      {isReadWrite && (
        <>
          <StackItem>
            <OciPushPlacementSection />
          </StackItem>
          <StackItem>
            <Divider />
          </StackItem>
          {values.allowDeltaStorage && (
            <StackItem>
              <DeltaStorageSection
                currentRepoName={currentRepoName}
                isEdit={isEdit}
                isAccessModeDisabled={isAccessModeDisabled}
              />
            </StackItem>
          )}
        </>
      )}

      <StackItem>
        <OciBaseImagesSection />
      </StackItem>
    </Stack>
  );
};

export default OciRegistryForm;
