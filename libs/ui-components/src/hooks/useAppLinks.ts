import { useAppContext } from './useAppContext';

// Links to other flightctl upstream resources
export const DEMO_REPOSITORY_URL = 'https://github.com/flightctl/flightctl-demos';

export const RHEM_VERSION = '1.1';

const baseUpstreamDocs = 'https://github.com/flightctl/flightctl/blob/main/docs';
const baseDownstreamDocs = 'https://docs.redhat.com/en/documentation/red_hat_edge_manager/${RHEM_VERSION}/html';

const upstreamLinks = {
  createApp: `${baseUpstreamDocs}/user/using/managing-devices.md#creating-applications`,
  useTemplateVars: `${baseUpstreamDocs}/user/using/managing-fleets.md#defining-device-templates`,
  addNewDevice: `${baseUpstreamDocs}/user/building/building-images.md#choosing-an-enrollment-method`,
  createAcmRepo: `${baseUpstreamDocs}/user/using/registering-microshift-devices-acm.md#auto-registering-devices-with-microshift-into-acm`,
  provisionDevice: `${baseUpstreamDocs}/user/using/provisioning-devices.md#provisioning-physical-devices`,
  catalog: `https://github.com/flightctl/flightctl/blob/main/docs/user/using/managing-catalogs.md`,
};

const downstreamLinks = {
  createApp: `${baseDownstreamDocs}/managing_applications_on_an_edge_device/rhem-manage-apps#build-app-packages`,
  useTemplateVars: `${baseDownstreamDocs}/managing_device_fleets/device-fleets#device-templates`,
  addNewDevice: `${baseDownstreamDocs}/operating_system_images_for_the_red_hat_edge_manager/edge-mgr-images#build-images-consider`,
  createAcmRepo: `${baseDownstreamDocs}/managing_devices/manage-devices-intro#manage-git-repository`,
  provisionDevice: `${baseDownstreamDocs}/provisioning_devices/provision-devices-intro`,
  catalog: '',
};

type AppLink = 'createApp' | 'useTemplateVars' | 'addNewDevice' | 'createAcmRepo' | 'provisionDevice' | 'catalog';

export const useAppLinks = (link: AppLink) => {
  const { settings } = useAppContext();

  return settings.isRHEM ? downstreamLinks[link] : upstreamLinks[link];
};
