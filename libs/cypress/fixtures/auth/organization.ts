import { API_VERSION } from '../../support/constants';

const defaultOrg = {
  apiVersion: API_VERSION,
  kind: 'Organization',
  metadata: {
    name: 'default',
  },
  spec: {
    displayName: 'Default Organization',
  },
};

export { defaultOrg };
