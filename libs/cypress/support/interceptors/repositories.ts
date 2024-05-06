import { Repository } from '@flightctl/types';
import { repoList } from '../../fixtures';

const buildRepositoriesResponse = (repositories: Repository[]) => ({
  apiVersion: 'v1alpha1',
  items: repositories,
  kind: 'RepositoryList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', '/api/flightctl/api/v1/repositories', (req) => {
    req.reply({
      body: buildRepositoriesResponse(repoList),
    });
  }).as('repository-list');
};

export { loadInterceptors };
