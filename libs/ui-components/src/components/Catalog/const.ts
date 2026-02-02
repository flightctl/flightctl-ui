export const CATALOG_LABEL = 'catalog.flightctl.io/';

export const OS_CHANNEL_LABEL_KEY = 'os.catalog.flightctl.io/channel';
export const OS_CATALOG_LABEL_KEY = 'os.catalog.flightctl.io/catalog';
export const OS_ITEM_LABEL_KEY = 'os.catalog.flightctl.io/item';
export const APP_CHANNEL_LABEL_KEY = 'app.catalog.flightctl.io/channel';
export const APP_CATALOG_LABEL_KEY = 'app.catalog.flightctl.io/catalog';
export const APP_ITEM_LABEL_KEY = 'app.catalog.flightctl.io/item';
export const APP_VOLUME_CHANNEL_LABEL_KEY = 'volume.catalog.flightctl.io/channel';
export const APP_VOLUME_CATALOG_LABEL_KEY = 'volume.catalog.flightctl.io/catalog';
export const APP_VOLUME_ITEM_LABEL_KEY = 'volume.catalog.flightctl.io/item';

export const getAppVolumeName = (appName: string | undefined, volumeName: string, label: string) => {
  return `${appName || ''}.${volumeName}.${label}`;
};
