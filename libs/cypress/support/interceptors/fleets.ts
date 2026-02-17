import { basicFleets } from '../../fixtures/fleets';
import { Fleet } from '@flightctl/types';
import { API_VERSION } from '../constants';
import { createListMatcher, createDetailMatcher, extractResourceName } from './matchers';

const buildFleetResponse = (fleets: Fleet[]) => ({
  apiVersion: API_VERSION,
  items: fleets,
  kind: 'FleetList',
  metadata: {},
});

const buildNewFleet = (newFleetName: string): Fleet => {
  const baseFleet = basicFleets[0];
  return { ...baseFleet, metadata: { ...baseFleet.metadata, name: newFleetName } };
};

// Statuses:
// 1. - "FLIGHTCTL_ADD_FLEET"
// When it is not set, it returns a list of 2 fleets
// When it is set, it adds a new fleet with the name set in this environment variable

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('fleets'), (req) => {
    const newFleetName = Cypress.expose('FLIGHTCTL_ADD_FLEET');
    const allFleets = [...basicFleets];
    if (newFleetName) {
      allFleets.push(buildNewFleet(newFleetName));
    }
    req.reply({
      body: buildFleetResponse(allFleets),
    });
  }).as('fleets');

  cy.intercept('GET', createDetailMatcher('fleets'), (req) => {
    const newFleetName = Cypress.expose('FLIGHTCTL_ADD_FLEET') as string;
    const requestFleetName = extractResourceName(req.url, 'fleets');

    if (!requestFleetName) {
      req.reply({ statusCode: 404 });
      return;
    }

    if (requestFleetName === newFleetName) {
      req.reply({
        body: buildNewFleet(newFleetName),
      });
      return;
    }

    const requestedFleet = basicFleets.find((f) => f.metadata.name === requestFleetName);
    if (requestedFleet) {
      req.reply({
        body: requestedFleet,
      });
    } else {
      req.reply({
        statusCode: 404,
      });
    }
  }).as('get-fleet-details');

  cy.intercept('POST', '/api/flightctl/api/v1/fleets', (req) => {
    const newFleetName = req.body.metadata.name as string;
    req.reply(buildNewFleet(newFleetName));
  }).as('create-new-fleet');
};

export { loadInterceptors };
