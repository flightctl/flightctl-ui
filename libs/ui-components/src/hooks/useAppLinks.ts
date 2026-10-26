import { useAppContext } from './useAppContext';

// Links to other flightctl upstream resources
export const DEMO_REPOSITORY_URL = 'https://github.com/flightctl/flightctl-demos';

type AppLink =
  | 'createApp'
  | 'useTemplateVars'
  | 'addNewDevice'
  | 'createAcmRepo'
  | 'provisionDevice'
  | 'catalog'
  | 'deltaGenerationBasics'
  | 'deltaTargetRepo';

const baseUpstreamDocs = 'https://github.com/flightctl/flightctl/blob/main/docs';
const upstreamLinks: Record<AppLink, string> = {
  createApp: `${baseUpstreamDocs}/user/using/managing-devices.md#creating-applications`,
  useTemplateVars: `${baseUpstreamDocs}/user/using/managing-fleets.md#defining-device-templates`,
  addNewDevice: `${baseUpstreamDocs}/user/building/building-images.md#choosing-an-enrollment-method`,
  createAcmRepo: `${baseUpstreamDocs}/user/using/registering-microshift-devices-acm.md#auto-registering-devices-with-microshift-into-acm`,
  provisionDevice: `${baseUpstreamDocs}/user/using/provisioning-devices.md#provisioning-physical-devices`,
  catalog: `${baseUpstreamDocs}/user/using/managing-catalogs.md`,
  deltaGenerationBasics: `${baseUpstreamDocs}/user/using/managing-devices.md#using-control-plane-generated-os-deltas`,
  deltaTargetRepo: `${baseUpstreamDocs}/user/using/managing-repositories.md#optional-fields`,
};

const RHEM_VERSION = '1.4';
const baseDownstreamDocs = `https://docs.redhat.com/en/documentation/red_hat_edge_manager/${RHEM_VERSION}`;
const downstreamLinks: Record<AppLink, string> = {
  createApp: `${baseDownstreamDocs}/configure-con_build_app_packages`,
  useTemplateVars: `${baseDownstreamDocs}/plan-managing_device_fleets`,
  addNewDevice: `${baseDownstreamDocs}/plan-con_edge_mgr_images_consider`,
  createAcmRepo: `${baseDownstreamDocs}/configure-con_config_git_repo`,
  provisionDevice: `${baseDownstreamDocs}/deploy-con_edge_mgr_provision_intro`,
  catalog: `${baseDownstreamDocs}/deploy-con_software_catalog`,
  deltaGenerationBasics: `${baseDownstreamDocs}/configure-delta_updates_for_os_images_and_applications`,
  deltaTargetRepo: `${baseDownstreamDocs}/configure-configuring_an_oci_repository`,
};

export const useAppLinks = (link: AppLink) => {
  const { settings } = useAppContext();

  return settings.isRHEM ? downstreamLinks[link] : upstreamLinks[link];
};
