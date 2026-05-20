import * as React from 'react';
import { Content, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import ImageUrl from './ImageUrl';
import SourceImageValidation from './SourceImageValidation';
import { getImageReference } from '../../utils/imageBuilds';
import { useOciRegistriesContext } from './OciRegistriesContext';

const ImageUrlCard = ({
  repository,
  imageName,
  imageTag,
  validateAccessibility,
}: {
  repository: string | undefined;
  imageName: string | undefined;
  imageTag: string | undefined;
  validateAccessibility?: boolean;
}) => {
  const { t } = useTranslation();
  const { ociRegistries } = useOciRegistriesContext();

  const imageReference =
    repository && imageName && imageTag
      ? getImageReference(ociRegistries, { repository, imageName, imageTag })
      : undefined;

  if (imageReference && repository && imageName && imageTag) {
    return (
      <Stack hasGutter>
        <StackItem>
          <Split hasGutter>
            <SplitItem>{t('Image reference URL')}</SplitItem>
            {validateAccessibility && (
              <SplitItem>
                <SourceImageValidation repository={repository} imageName={imageName} imageTag={imageTag} />
              </SplitItem>
            )}
          </Split>
        </StackItem>
        <StackItem>
          <ImageUrl imageReference={imageReference} />
        </StackItem>
      </Stack>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>{t('Image reference URL')}</StackItem>
      <StackItem>
        <Content component="small" style={{ fontStyle: 'italic' }}>
          {t('Enter the image details to view the URL it resolves to')}
        </Content>
      </StackItem>
    </Stack>
  );
};

export default ImageUrlCard;
