import * as React from 'react';
import {
  Alert,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  List,
  ListItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import type { AddCatalogItemFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getErrorMessage } from '../../../../utils/error';
import { appTypeIds } from '../../useCatalogItems';
import { getArtifactLabel } from '../../../../utils/catalogTypes';
import { deviceFeaturesToApi, formatDeviceFeatureValue } from '../../../../utils/catalogDeviceFeatures';
import CatalogFeatureRequirements from '../../CatalogItemCompatibility/CatalogFeatureRequirements';

export const reviewStepId = 'review';

const ReviewVersionCustomRequirements = ({ extraFeatures }: { extraFeatures: Record<string, unknown> | undefined }) => {
  const { t } = useTranslation();
  const extraEntries = React.useMemo(
    () => Object.entries(extraFeatures || {}).map(([key, value]) => ({ key, value: formatDeviceFeatureValue(value) })),
    [extraFeatures],
  );
  if (extraEntries.length === 0) {
    return null;
  }
  return (
    <Flex className="pf-v6-u-mt-sm">
      <FlexItem>
        <Content component={ContentVariants.h4}>{t('Custom device requirements:')}</Content>
      </FlexItem>
      <FlexItem>
        <LabelGroup>
          {extraEntries.map(({ key, value }) => (
            <Label key={key}>{`${key}=${value}`}</Label>
          ))}
        </LabelGroup>
      </FlexItem>
    </Flex>
  );
};

const ReviewStep = ({ error, isEdit, isReadOnly }: { error: unknown; isEdit?: boolean; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();

  let reviewTitle: string;
  if (isReadOnly) {
    reviewTitle = t('Review');
  } else if (isEdit) {
    reviewTitle = t('Review and save');
  } else {
    reviewTitle = t('Review and create');
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {reviewTitle}
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Catalog')}</DescriptionListTerm>
            <DescriptionListDescription>{values.catalog}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>{values.name}</DescriptionListDescription>
          </DescriptionListGroup>
          {values.displayName && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Display name')}</DescriptionListTerm>
              <DescriptionListDescription>{values.displayName}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
            <DescriptionListDescription>{values.type}</DescriptionListDescription>
          </DescriptionListGroup>
          {values.type && appTypeIds.includes(values.type) && values.containerUri && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Container image')}</DescriptionListTerm>
              <DescriptionListDescription>{values.containerUri}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.type && !appTypeIds.includes(values.type) && values.artifacts.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Artifacts')}</DescriptionListTerm>
              <DescriptionListDescription>
                <List isPlain>
                  {values.artifacts.map((a) => {
                    return <ListItem key={a.type}>{`${getArtifactLabel(t, a)} - ${a.uri}`}</ListItem>;
                  })}
                </List>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.shortDescription && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Short description')}</DescriptionListTerm>
              <DescriptionListDescription>{values.shortDescription}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.provider && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Provider')}</DescriptionListTerm>
              <DescriptionListDescription>{values.provider}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.homepage && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Homepage')}</DescriptionListTerm>
              <DescriptionListDescription>{values.homepage}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.supportUrl && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Support URL')}</DescriptionListTerm>
              <DescriptionListDescription>{values.supportUrl}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.documentationUrl && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Documentation URL')}</DescriptionListTerm>
              <DescriptionListDescription>{values.documentationUrl}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.deprecated && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Deprecated')}</DescriptionListTerm>
              <DescriptionListDescription>{values.deprecationMessage}</DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {values.versions.map((v) => (
            <DescriptionListGroup key={v.version}>
              <DescriptionListTerm>{t('Version {{version}}', { version: v.version })}</DescriptionListTerm>
              <DescriptionListDescription>
                <CatalogFeatureRequirements deviceFeatures={deviceFeaturesToApi(v.deviceFeatures)} />
                <ReviewVersionCustomRequirements extraFeatures={v.deviceFeatures?.extra} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </StackItem>
      {!!error && (
        <StackItem>
          <Alert
            isInline
            variant="danger"
            title={isEdit ? t('Failed to save catalog item') : t('Failed to create catalog item')}
          >
            {getErrorMessage(error)}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
