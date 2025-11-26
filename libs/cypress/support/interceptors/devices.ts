import { Device, PatchRequest } from '@flightctl/types';
import { API_VERSION } from '../constants';

const buildDevicesResponse = (devices: Device[]) => ({
  apiVersion: API_VERSION,
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

  cy.intercept('GET', '/api/flightctl/api/v1/devices?*', (req) => {
    req.reply({
      body: buildDevicesResponse([]),
    });
  }).as('device-list-filter');

  cy.intercept('PATCH', '/api/flightctl/api/v1/devices/*', (req) => {
    if (Array.isArray(req.body)) {
      const isAliasPatch = (req.body[0] as PatchRequest[0]).path === '/metadata/alias';
      if (isAliasPatch) {
        req.reply(200, {});
      } else {
        // Not implemented, raise an error for awareness
        req.reply(500);
      }
    }
  }).as('patch-device');
};

export { loadInterceptors };
