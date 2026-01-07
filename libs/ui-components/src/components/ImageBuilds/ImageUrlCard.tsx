import * as React from 'react';
import { Content, Stack, StackItem } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/useTranslation';
import ImageUrl from './ImageUrl';

const ImageUrlCard = ({ imageReference }: { imageReference: string | undefined }) => {
  const { t } = useTranslation();

  let content: React.ReactNode = '';
  if (imageReference) {
    content = <ImageUrl imageReference={imageReference} />;
  } else {
    content = (
      <Content component="small" style={{ fontStyle: 'italic' }}>
        {t('Enter the image details to view the URL it resolves to')}
      </Content>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>{t('Image reference URL')}</StackItem>
      <StackItem>{content}</StackItem>
    </Stack>
  );
};

export default ImageUrlCard;
