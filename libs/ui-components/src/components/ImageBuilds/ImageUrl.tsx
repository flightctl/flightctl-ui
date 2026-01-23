import * as React from 'react';
import LearnMoreLink from '../common/LearnMoreLink';

const getImageUrl = (url: string): string => {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
};

const ImageUrl = ({ imageReference }: { imageReference: string }) => (
  <LearnMoreLink link={getImageUrl(imageReference)} text={imageReference} />
);

export default ImageUrl;
