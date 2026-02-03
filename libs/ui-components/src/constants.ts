export const APP_TITLE = 'Edge Manager';
export const CORE_API_VERSION = 'v1beta1';
export const IMAGEBUILDER_API_VERSION = 'v1alpha1';

export const PAGE_SIZE = 15;
export const EVENT_PAGE_SIZE = 200; // It's 500 in OCP console

export const CERTIFICATE_VALIDITY_IN_YEARS = 1;

export const getApiVersion = (api: 'flightctl' | 'imagebuilder' | 'alerts'): string | undefined => {
  switch (api) {
    case 'flightctl':
      return CORE_API_VERSION;
    case 'imagebuilder':
      return IMAGEBUILDER_API_VERSION;
    case 'alerts':
    default:
      return undefined;
  }
};
