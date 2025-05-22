import { FlightCtlApp } from './hooks/useAppContext';

const upstreamDocsRepoUrl = 'https://github.com/flightctl/flightctl/blob/main/docs';

const downstreamDocsRepoUrl =
  'https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.13/html-single/edge_manager/index';

const links = {
  rhem: {
    createApp: `${downstreamDocsRepoUrl}#build-app-packages`,
    usingTemplateVars: `${downstreamDocsRepoUrl}#device-templates`,
    addNewDevice: `${downstreamDocsRepoUrl}#edge-mgr-build`,
    createAcmRepo: `${downstreamDocsRepoUrl}#device-config-git-cli`,
  },
  fc: {
    createApp: `${upstreamDocsRepoUrl}/user/managing-devices.md#creating-applications`,
    usingTemplateVars: `${upstreamDocsRepoUrl}/user/managing-fleets.md#defining-device-templates`,
    addNewDevice: `${upstreamDocsRepoUrl}/user/getting-started.md#building-a-bootable-container-image-including-the-flight-control-agent`,
    createAcmRepo: `${upstreamDocsRepoUrl}/user/registering-microshift-devices-acm.md#creating-the-acm-registration-repository`,
  },
};

export const getCreatingApplicationsLink = (appType: FlightCtlApp) =>
  appType === FlightCtlApp.STANDALONE ? links.fc.createApp : links.rhem.createApp;

export const getUsingTemplateVariablesLink = (appType: FlightCtlApp) =>
  appType === FlightCtlApp.STANDALONE ? links.fc.usingTemplateVars : links.rhem.usingTemplateVars;

export const getAddingNewDevicesLink = (appType: FlightCtlApp) =>
  appType === FlightCtlApp.STANDALONE ? links.fc.addNewDevice : links.rhem.addNewDevice;

export const getCreateAcmRepositoryLink = (appType: FlightCtlApp) =>
  appType === FlightCtlApp.STANDALONE ? links.fc.createAcmRepo : links.rhem.createAcmRepo;

// Links to other flightctl upstream resources
export const DEMO_REPOSITORY_URL = 'https://github.com/flightctl/flightctl-demos';

// Links to general Red Hat docs
export const TECH_PREVIEW_LEVEL_LINK = 'https://access.redhat.com/support/offerings/techpreview';
