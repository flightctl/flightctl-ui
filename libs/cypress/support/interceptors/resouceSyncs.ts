import { createListMatcher } from './matchers';

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('resourcesyncs'), (req) => {
    req.reply({
      body: [],
    });
  }).as('resource-syncs');
};

export { loadInterceptors };
