import { API_VERSION } from '../constants';
import { createListMatcher } from './matchers';

const catalogs = [
  {
    apiVersion: API_VERSION,
    kind: 'Catalog',
    metadata: { name: 'default' },
    spec: { displayName: 'Default catalog' },
  },
  {
    apiVersion: API_VERSION,
    kind: 'Catalog',
    metadata: { name: 'empty-catalog' },
    spec: { displayName: 'Empty catalog' },
  },
];

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('catalogs'), {
    body: {
      apiVersion: API_VERSION,
      kind: 'CatalogList',
      metadata: {},
      items: catalogs,
    },
  }).as('catalog-list');

  cy.intercept('GET', createListMatcher('catalogitems'), (req) => {
    const fieldSelector = new URL(req.url).searchParams.get('fieldSelector') || '';
    req.alias = fieldSelector.includes('metadata.catalog') ? 'catalog-items-filtered' : 'catalog-items';
    req.reply({
      body: {
        apiVersion: API_VERSION,
        kind: 'CatalogItemList',
        metadata: {},
        items: [],
      },
    });
  });
};

export { loadInterceptors };
