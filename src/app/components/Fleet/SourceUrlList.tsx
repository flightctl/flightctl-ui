import React from 'react';

import { Button } from '@patternfly/react-core';

const SourceUrlList = ({ sourceUrls }: { sourceUrls: string[] }) => {
  return sourceUrls.length > 0 ? (
    <section>
      {sourceUrls.map((sourceUrl) => (
        <Button key={sourceUrl} variant="link" isInline>
          {sourceUrl}
        </Button>
      ))}
    </section>
  ) : '-';
};

export default SourceUrlList;
