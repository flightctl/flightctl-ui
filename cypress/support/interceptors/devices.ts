import { Device } from '../../../@types';

const buildDevicesResponse = (devices: Device[]) => ({
  apiVersion: 'v1alpha1',
  items: devices,
  kind: 'DeviceList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', '/api/flightctl/api/v1/devices', (req) => {
    req.reply({
      body: buildDevicesResponse([]),
    });
  }).as('device-list');
};

export { loadInterceptors };
