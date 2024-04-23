import { FleetsPage } from '../../pages/FleetsPage';
import { NewFleetFormPage } from '../../pages/NewFleetFormPage';

describe('Create fleet form', () => {
  let fleetsPage: FleetsPage;
  let newFleetFormPage: NewFleetFormPage;

  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  beforeEach(() => {
    FleetsPage.visit();

    fleetsPage = new FleetsPage();
  });

  it('can be submitted to create a new fleet', () => {
    fleetsPage.fleetRow('sample-fleet').should('not.exist');

    fleetsPage.openCreateFleetFormButton.click();
    newFleetFormPage = new NewFleetFormPage();

    newFleetFormPage.title.should('have.text', 'Create fleet');

    newFleetFormPage.newFleetNameField.type('sample-fleet');
    newFleetFormPage.newFleetOSImageField.type('os-image');
    newFleetFormPage.newFleetSourceNameField.type('my-source');
    newFleetFormPage.newFleetRepositoryUrlField.type('some-url');
    newFleetFormPage.newFleetTargetReferenceField.type('main');
    newFleetFormPage.newFleetRepositoryPathField.type('/some-path');

    newFleetFormPage.createFleetFormSubmitButton.should('be.enabled').click();

    fleetsPage.title.should('have.text', 'Fleets');
    fleetsPage.fleetRow('sample-fleet').should('exist');
  });

  it('disables the create fleet button if a fleet with the same name exists', () => {
    const existingFleetName = 'eu-west-prod-001';
    fleetsPage.fleetRow(existingFleetName).should('exist');
    fleetsPage.openCreateFleetFormButton.click();
    newFleetFormPage = new NewFleetFormPage();

    // Fill the form correctly, except for the duplicate fleet name
    newFleetFormPage.newFleetNameField.type(existingFleetName).blur();
    newFleetFormPage.newFleetNameErrorMessage.should('have.text', 'Fleet with the same name already exists.');
    newFleetFormPage.newFleetOSImageField.type('os-image');
    newFleetFormPage.newFleetSourceNameField.type('my-source');
    newFleetFormPage.newFleetRepositoryUrlField.type('some-url');
    newFleetFormPage.newFleetTargetReferenceField.type('main');
    newFleetFormPage.newFleetRepositoryPathField.type('/some-path');
    newFleetFormPage.createFleetFormSubmitButton.should('be.disabled');

    // Fix the duplicate fleet name and check that the form could be submitted
    newFleetFormPage.newFleetNameField.clear().type(`${existingFleetName}-2`);
    newFleetFormPage.newFleetNameErrorMessage.should('not.exist');
    newFleetFormPage.createFleetFormSubmitButton.should('be.enabled');
  });
});
