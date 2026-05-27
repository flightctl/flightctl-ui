import * as React from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  List,
  ListItem,
  StackItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';
import { getExportFormatLabel } from '../../utils/imageBuilds';
import { ImageBuildWizardError } from './CreateImageBuildWizard/types';
import { ImagePromotionFormValues } from '../ImagePromotion/types';

export const ErrorAlert = ({ error }: { error: ImageBuildWizardError }) => {
  const { t } = useTranslation();
  if (error.type === 'build') {
    return (
      <Alert isInline variant="danger" title={t('Failed to create image build')}>
        {getErrorMessage(error.error)}
      </Alert>
    );
  }
  if (error.type === 'promotion') {
    return (
      <Alert isInline variant="danger" title={t('Failed to create image promotion')}>
        {getErrorMessage(error.error)}
      </Alert>
    );
  }

  return (
    <Alert isInline variant="warning" title={t('Image build created, but some exports failed')}>
      <Content>
        {t('The image build "{{buildName}}" was created successfully, however the following export(s) failed:', {
          buildName: error.buildName,
        })}
      </Content>

      <List isPlain>
        {error.errors.map(({ format, error: exportError }, index) => (
          <ListItem key={index}>
            <strong>{getExportFormatLabel(t, format)}:</strong> {getErrorMessage(exportError)}
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};

export const SoftwareCatalogReviewCard = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImagePromotionFormValues & { promoteToCatalog: boolean }>();

  return (
    values.promoteToCatalog && (
      <StackItem>
        <Card>
          <CardTitle>{t('Software Catalog')}</CardTitle>
          <CardBody>
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Promotion name')}</DescriptionListTerm>
                <DescriptionListDescription>{values.name}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Catalog')}</DescriptionListTerm>
                <DescriptionListDescription>{values.catalog}</DescriptionListDescription>
              </DescriptionListGroup>
              {values.type === 'new' ? (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
                    <DescriptionListDescription>{values.new.name}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
                    <DescriptionListDescription>{values.new.version}</DescriptionListDescription>
                  </DescriptionListGroup>
                </>
              ) : (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
                    <DescriptionListDescription>{values.existing.name}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
                    <DescriptionListDescription>{values.existing.version}</DescriptionListDescription>
                  </DescriptionListGroup>
                  {values.existing.replaces && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Replaces')}</DescriptionListTerm>
                      <DescriptionListDescription>{values.existing.replaces}</DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                </>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
    )
  );
};
