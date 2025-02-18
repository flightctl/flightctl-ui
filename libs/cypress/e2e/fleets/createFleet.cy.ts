import { FleetDetailsPage } from '../../pages/FleetDetailsPage';
import { FleetsPage } from '../../pages/FleetsPage';
import { CreateFleetWizardPage } from '../../pages/CreateFleetWizardPage';

describe('Create fleet form', () => {
  let fleetsPage: FleetsPage;
  let createFleetWizardPage: CreateFleetWizardPage;
  const newFleetName = 'sample-fleet';

  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  beforeEach(() => {
    FleetsPage.visit();

    fleetsPage = new FleetsPage();
  });

  it('can be submitted to create a new fleet', () => {
    fleetsPage.fleetRow(newFleetName).should('not.exist');

    fleetsPage.openCreateFleetFormButton.click();
    createFleetWizardPage = new CreateFleetWizardPage();

    createFleetWizardPage.title.should('have.text', 'Create fleet');

    // General info step
    createFleetWizardPage.newFleetNameField.type(newFleetName);
    createFleetWizardPage.nextFleetWizardButton.should('be.enabled').click();

    // Device template step
    createFleetWizardPage.newFleetSystemImageField.type('os-image');

    createFleetWizardPage.addConfigurationButton.should('be.enabled').click();
    createFleetWizardPage.newFleetSourceNameField.type('my-source');
    createFleetWizardPage.newFleetSourceTypeField.click();
    createFleetWizardPage.newFleetGitSourceTypeField.click();

    createFleetWizardPage.newFleetTargetReferenceField.type('main');
    createFleetWizardPage.newFleetRepositoryPathField.type('/file-path');
    createFleetWizardPage.newFleetRepositoryMountPathField.type('/mount-path');
    createFleetWizardPage.nextFleetWizardButton.should('be.enabled').click();

    // Updates step
    createFleetWizardPage.nextFleetWizardButton.should('be.enabled').click();

    // Review and create step
    createFleetWizardPage.createFleetFormSubmitButton.should('be.enabled').click();

    cy.wait('@create-new-fleet').then(({ request }) => {
      expect(request.body, 'Create fleet request').to.nested.include({
        'metadata.name': newFleetName,
      });
      Cypress.env('FLIGHTCTL_ADD_FLEET', newFleetName);
    });

    const fleetDetailsPage = new FleetDetailsPage();
    fleetDetailsPage.title.should('have.text', 'sample-fleet');
  });

  it('disables the create fleet button if a fleet with the same name exists', () => {
    const existingFleetName = 'eu-west-prod-001';
    fleetsPage.fleetRow(existingFleetName).should('exist');
    fleetsPage.openCreateFleetFormButton.click();
    createFleetWizardPage = new CreateFleetWizardPage();

    createFleetWizardPage.newFleetNameField.type(existingFleetName).blur();
    createFleetWizardPage.openFleetRichValidationsPopover();
    createFleetWizardPage.newFleetRichValidationsPopoverError.should('contain.text', 'Name must be unique');
    createFleetWizardPage.nextFleetWizardButton.should('be.disabled');

    // Fix the duplicate fleet name and check that the form could be submitted
    createFleetWizardPage.newFleetNameField.clear().type(`${existingFleetName}-2`);
    createFleetWizardPage.newFleetRichValidationsPopoverError.should('not.exist');
    createFleetWizardPage.nextFleetWizardButton.should('be.enabled');
  });
});
