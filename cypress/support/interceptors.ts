import { loadInterceptors as loadFleetInterceptors } from './interceptors/fleets';
import { loadInterceptors as loadEnrollmentRequestsInterceptors } from './interceptors/enrollmentRequests';
import { loadInterceptors as loadResourceSyncsInterceptors } from './interceptors/resouceSyncs';
import { loadInterceptors as loadDeviceInterceptors } from './interceptors/devices';
import { loadInterceptors as loadRepositoryInterceptors } from './interceptors/repositories';

const loadApiInterceptors = () => {
  loadFleetInterceptors();
  loadDeviceInterceptors();
  loadEnrollmentRequestsInterceptors();
  loadRepositoryInterceptors();
  loadResourceSyncsInterceptors();
};

Cypress.Commands.add('loadApiInterceptors', loadApiInterceptors);

export { loadApiInterceptors };
