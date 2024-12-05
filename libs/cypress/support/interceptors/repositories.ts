import { Repository } from '@flightctl/types';
import { repoList } from '../../fixtures';

const buildRepositoriesResponse = (repositories: Repository[]) => ({
  apiVersion: 'v1alpha1',
  items: repositories,
  kind: 'RepositoryList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', '/api/flightctl/api/v1/repositories?*', (req) => {
    req.reply({
      body: buildRepositoriesResponse(repoList),
    });
  }).as('repository-list');

  cy.intercept('GET', '/api/flightctl/api/v1/repositories/**', (req) => {
    const repoName = req.url.match(/\/repositories\/(.+)$/)[1];
    const found = repoList.find((repo) => repo.metadata.name === repoName);
    if (found) {
      req.reply({
        body: repoList.find((repo) => repo.metadata.name === repoName),
      });
    } else {
      req.reply(404);
    }
  }).as('get-repo-details');
};

export { loadInterceptors };
