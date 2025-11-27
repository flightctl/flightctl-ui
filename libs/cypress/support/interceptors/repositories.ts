import { Repository } from '@flightctl/types';
import { repoList } from '../../fixtures';
import { API_VERSION } from '../constants';
import { createListMatcher, createDetailMatcher, extractResourceName } from './matchers';

const buildRepositoriesResponse = (repositories: Repository[]) => ({
  apiVersion: API_VERSION,
  items: repositories,
  kind: 'RepositoryList',
  metadata: {},
});

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('repositories'), (req) => {
    req.reply({
      body: buildRepositoriesResponse(repoList),
    });
  }).as('repository-list');

  cy.intercept('GET', createDetailMatcher('repositories'), (req) => {
    const repoName = extractResourceName(req.url, 'repositories');
    if (!repoName) {
      req.reply(404);
      return;
    }
    const found = repoList.find((repo) => repo.metadata.name === repoName);
    if (found) {
      req.reply({
        body: found,
      });
    } else {
      req.reply(404);
    }
  }).as('get-repo-details');
};

export { loadInterceptors };
