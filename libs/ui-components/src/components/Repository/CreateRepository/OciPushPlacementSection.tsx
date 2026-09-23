import * as React from 'react';
import { Trans } from 'react-i18next';
import { useFormikContext } from 'formik';
import { Content, FormGroup, Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import { useAppLinks } from '../../../hooks/useAppLinks';
import LearnMoreLink from '../../common/LearnMoreLink';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import { OciPlacementMode, type RepositoryFormValues } from './types';
import { getOciRepoDisplayPath } from './utils';
import { FormGroupWithHelperText } from '../../common/WithHelperText';

const EXAMPLE_SOURCE_IMAGE = 'my-org/my-app';

const PlacementPreview = ({ ociConfig }: { ociConfig: NonNullable<RepositoryFormValues['ociConfig']> }) => {
  const { t } = useTranslation();

  let content: React.ReactNode | undefined;
  if (!ociConfig.registry) {
    content = t('Enter the registry hostname to preview where images will be pushed.');
  } else if (ociConfig.placementMode === OciPlacementMode.Repository && !ociConfig.repository) {
    content = t('Enter the repository path to preview where images are stored.');
  } else if (ociConfig.placementMode === OciPlacementMode.Namespace && !ociConfig.namespace) {
    content = t('Enter the namespace to preview where images are stored.');
  } else {
    const previewPath = getOciRepoDisplayPath(ociConfig, EXAMPLE_SOURCE_IMAGE);
    content = (
      <Trans t={t} values={{ image: EXAMPLE_SOURCE_IMAGE, path: previewPath }}>
        Example: &apos;{'{{ image }}'}&apos; is stored at <strong>{previewPath}</strong>
      </Trans>
    );
  }
  return <Content className="pf-v6-u-font-size-xs"> {content}</Content>;
};

const OciPushPlacementSection = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<RepositoryFormValues>();
  const deltaTargetDocLink = useAppLinks('deltaTargetRepo');
  const ociConfig = values.ociConfig as NonNullable<RepositoryFormValues['ociConfig']>;

  const onPlacementModeChange = (value: unknown) => {
    const mode = value as OciPlacementMode;
    if (mode !== OciPlacementMode.Repository) {
      void setFieldValue('ociConfig.repository', '');
    }
    if (mode !== OciPlacementMode.Namespace) {
      void setFieldValue('ociConfig.namespace', '');
    }
  };

  return (
    <FormGroupWithHelperText
      label={t('Image placement')}
      content={
        <>
          <p>
            {t(
              'Defines how repository paths are organized when this registry stores content. Applies to image builds and delta artifacts.',
            )}
          </p>
          {deltaTargetDocLink ? <LearnMoreLink link={deltaTargetDocLink} text={t('View documentation')} /> : null}
        </>
      }
    >
      <Stack hasGutter>
        <StackItem>
          <RadioField
            id="oci-placement-registry"
            name="ociConfig.placementMode"
            label={t('Mirror source image path')}
            description={t('Each image is stored at the same repository path as its source image.')}
            checkedValue={OciPlacementMode.Registry}
            onChangeCustom={onPlacementModeChange}
            body={ociConfig.placementMode === OciPlacementMode.Registry && <PlacementPreview ociConfig={ociConfig} />}
          />
        </StackItem>
        <StackItem>
          <RadioField
            id="oci-placement-repository"
            name="ociConfig.placementMode"
            label={t('Fixed repository path')}
            description={t('All images are stored under the same repository path in this registry.')}
            checkedValue={OciPlacementMode.Repository}
            onChangeCustom={onPlacementModeChange}
            body={
              ociConfig.placementMode === OciPlacementMode.Repository && (
                <FormGroup label={t('Repository path')} isRequired>
                  <TextField
                    name="ociConfig.repository"
                    aria-label={t('Repository path')}
                    placeholder={t('For example: my-images')}
                    helperText={<PlacementPreview ociConfig={ociConfig} />}
                  />
                </FormGroup>
              )
            }
          />
        </StackItem>

        <StackItem>
          <RadioField
            id="oci-placement-namespace"
            name="ociConfig.placementMode"
            label={t('Group by image name')}
            description={t("Each image is stored under a namespace using the source image's name.")}
            checkedValue={OciPlacementMode.Namespace}
            onChangeCustom={onPlacementModeChange}
            body={
              ociConfig.placementMode === OciPlacementMode.Namespace && (
                <FormGroup label={t('Namespace')} isRequired>
                  <TextField
                    name="ociConfig.namespace"
                    aria-label={t('Namespace')}
                    placeholder={t('For example: my-org')}
                    helperText={<PlacementPreview ociConfig={ociConfig} />}
                  />
                </FormGroup>
              )
            }
          />
        </StackItem>
      </Stack>
    </FormGroupWithHelperText>
  );
};

export default OciPushPlacementSection;
