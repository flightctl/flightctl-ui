import { Fleet } from '@types';

const getSourceUrls = (fleet: Fleet) => {
  const templateSpecConfig = fleet.spec?.template?.spec?.config || [];
  return templateSpecConfig
    .map((config) => ('gitRef' in config ? config.gitRef?.repoURL : ''))
    .filter((sourceURL) => !!sourceURL);
};

export { getSourceUrls };
