import React from 'react';

const SourceUrlList = ({ sourceUrls }: { sourceUrls: string[] }) => {
  return sourceUrls ? (
    <section>
      {sourceUrls.map((sourceUrl) => {
        return <article key={sourceUrl}>{sourceUrl}</article>;
      })}
    </section>
  ) : null;
};

export default SourceUrlList;
