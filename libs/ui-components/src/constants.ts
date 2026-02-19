import { ApiVersion } from '@flightctl/types';
import { ApiVersion as ImageBuilderApiVersion } from '@flightctl/types/imagebuilder';
import { ApiVersion as AlphaVersion } from '@flightctl/types/alpha';

export const APP_TITLE = 'Edge Manager';
export const PAGE_SIZE = 15;
export const EVENT_PAGE_SIZE = 200; // It's 500 in OCP console

export const CERTIFICATE_VALIDITY_IN_YEARS = 1;

export const getApiVersion = (api: 'flightctl' | 'imagebuilder' | 'alerts' | 'catalog'): string | undefined => {
  switch (api) {
    case 'flightctl':
      return ApiVersion.ApiVersionV1beta1;
    case 'imagebuilder':
      return ImageBuilderApiVersion.ApiVersionV1alpha1;
    case 'catalog':
      return AlphaVersion.V1ALPHA1;
    case 'alerts':
    default:
      return undefined;
  }
};
