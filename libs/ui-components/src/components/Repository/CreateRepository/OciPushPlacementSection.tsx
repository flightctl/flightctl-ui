import * as React from 'react';
import { Trans } from 'react-i18next';
import { useFormikContext } from 'formik';
import { Content, Flex, FlexItem, FormGroup, Icon, Stack, StackItem } from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { useProductName } from '../../../hooks/useProductName';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import { OciPlacementMode, type RepositoryFormValues } from './types';
import { getOciRepoPushDisplayPath } from './utils';
import { FormGroupWithHelperText } from '../../common/WithHelperText';

const PushPlacementPathPreview = ({ ociConfig }: { ociConfig: NonNullable<RepositoryFormValues['ociConfig']> }) => {
  const { t } = useTranslation();

  let missingDetailsContent: React.ReactNode;

  if (!ociConfig.registry) {
    missingDetailsContent = (
      <Content>{t('Enter the registry hostname to preview where images will be pushed.')}</Content>
    );
  }

  if (ociConfig.placementMode === OciPlacementMode.Repository && !ociConfig.repository) {
    missingDetailsContent = <Content>{t('Enter the repository path to preview where images will be pushed.')}</Content>;
  }
  if (ociConfig.placementMode === OciPlacementMode.Namespace && !ociConfig.namespace) {
    missingDetailsContent = <Content>{t('Enter the namespace to preview where images will be pushed.')}</Content>;
  }

  const pushPreviewPath = getOciRepoPushDisplayPath(ociConfig);
  return (
    <Flex gap={{ default: 'gapSm' }}>
      <FlexItem>
        <Icon status="info">
          <InfoCircleIcon />
        </Icon>
      </FlexItem>

      <FlexItem>
        {missingDetailsContent || (
          <Content>
            <Trans t={t} values={{ path: pushPreviewPath }}>
              For this repository, an image named &quot;my-org/my-app&quot; would be stored at{' '}
              <strong>{pushPreviewPath}</strong>
            </Trans>
          </Content>
        )}
      </FlexItem>
    </Flex>
  );
};

const OciPushPlacementSection = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<RepositoryFormValues>();
  const productName = useProductName();
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
      content={t(
        'Choose where {{productName}} stores images when it pushes to this registry. Used for image builds and delta update artifacts.',
        { productName },
      )}
    >
      <Stack hasGutter>
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <RadioField
                id="oci-placement-registry"
                name="ociConfig.placementMode"
                label={t('Mirror source image path')}
                description={t('Each image is stored at the same path as its source image.')}
                checkedValue={OciPlacementMode.Registry}
                onChangeCustom={onPlacementModeChange}
              />
            </StackItem>
            <StackItem>
              <RadioField
                id="oci-placement-repository"
                name="ociConfig.placementMode"
                label={t('Fixed repository path')}
                description={t('All images are stored at the same fixed path. The source image name is not used.')}
                checkedValue="repository"
                onChangeCustom={onPlacementModeChange}
                body={
                  ociConfig.placementMode === OciPlacementMode.Repository && (
                    <FormGroup label={t('Repository path')} isRequired>
                      <TextField
                        name="ociConfig.repository"
                        aria-label={t('Repository path')}
                        placeholder={t('e.g. my-org/edge-images')}
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
                description={t("Each image is stored under a namespace, using the source image's name.")}
                checkedValue={OciPlacementMode.Namespace}
                onChangeCustom={onPlacementModeChange}
                body={
                  ociConfig.placementMode === OciPlacementMode.Namespace && (
                    <FormGroup label={t('Namespace')} isRequired>
                      <TextField
                        name="ociConfig.namespace"
                        aria-label={t('Namespace')}
                        placeholder={t('e.g. my-org')}
                      />
                    </FormGroup>
                  )
                }
              />
            </StackItem>
            <StackItem>
              <PushPlacementPathPreview ociConfig={ociConfig} />
            </StackItem>
          </Stack>
        </StackItem>
      </Stack>
    </FormGroupWithHelperText>
  );
};

export default OciPushPlacementSection;
