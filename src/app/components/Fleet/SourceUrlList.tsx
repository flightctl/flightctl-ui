import { Button } from '@patternfly/react-core';
import React from 'react';

const SourceUrlList = ({ sourceUrls }: { sourceUrls: string[] }) => {
  return sourceUrls ? (
    <section>
      {sourceUrls.map((sourceUrl) => (
        <Button key={sourceUrl} variant="link" isInline>
          {sourceUrl}
        </Button>
      ))}
    </section>
  ) : null;
};

export default SourceUrlList;
