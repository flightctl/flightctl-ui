import { FlightCtlApp, useAppContext } from './useAppContext';

// Links to other flightctl upstream resources
export const DEMO_REPOSITORY_URL = 'https://github.com/flightctl/flightctl-demos';

const ACM_VERSION = '2.13';
const AAP_VERSION = '2.5';

const upstreamDocsBase = 'https://github.com/flightctl/flightctl/blob/main/docs';
const acmDownstreamDocsBase = `https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/${ACM_VERSION}/html-single/edge_manager/index`;
const aapDownstreamDocsBase = `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${AAP_VERSION}/html/managing_device_fleets_with_the_red_hat_edge_manager`;

const links = {
  fc: {
    createApp: `${upstreamDocsBase}/user/managing-devices.md#creating-applications`,
    useTemplateVars: `${upstreamDocsBase}/user/managing-fleets.md#defining-device-templates`,
    addNewDevice: `${upstreamDocsBase}/user/getting-started.md#building-a-bootable-container-image-including-the-flight-control-agent`,
    createAcmRepo: `${upstreamDocsBase}/user/registering-microshift-devices-acm.md#creating-the-acm-registration-repository`,
  },
  acm: {
    createApp: `${acmDownstreamDocsBase}#build-app-packages`,
    useTemplateVars: `${acmDownstreamDocsBase}#device-templates`,
    addNewDevice: `${acmDownstreamDocsBase}#edge-mgr-build`,
    createAcmRepo: `${acmDownstreamDocsBase}#device-config-git-cli`,
  },
  aap: {
    createApp: `${aapDownstreamDocsBase}/edge-manager-manage-apps#edge-manager-build-app-packages`,
    useTemplateVars: `${aapDownstreamDocsBase}/assembly-edge-manager-device-fleets#edge-manager-device-templates`,
    addNewDevice: `${aapDownstreamDocsBase}/assembly-edge-manager-images#edge-manager-build-bootc`,
    createAcmRepo: '',
  },
};

type AppLink = 'createApp' | 'useTemplateVars' | 'addNewDevice' | 'createAcmRepo';

const getLinkSource = (appType: FlightCtlApp, isRHEM?: boolean) => {
  // Default doc links are AAP's and apply when using RHEM branding
  if (isRHEM || appType === FlightCtlApp.AAP) {
    return links.aap;
  }
  return appType === FlightCtlApp.STANDALONE ? links.fc : links.acm;
};

export const useAppLinks = (link: AppLink) => {
  const { appType, settings } = useAppContext();

  const links = getLinkSource(appType, settings.isRHEM);
  return links[link];
};
