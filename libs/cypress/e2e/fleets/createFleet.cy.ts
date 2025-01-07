import { FleetDetailsPage } from '../../pages/FleetDetailsPage';
import { FleetsPage } from '../../pages/FleetsPage';
import { CreateFleetWizardPage } from '../../pages/CreateFleetWizardPage';

describe('Create fleet form', () => {
  let fleetsPage: FleetsPage;
  let createFleetWizardPage: CreateFleetWizardPage;

  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  beforeEach(() => {
    FleetsPage.visit();

    fleetsPage = new FleetsPage();
  });

  /* TODO fix flakyness */
  it.skip('can be submitted to create a new fleet', () => {
    fleetsPage.fleetRow('sample-fleet').should('not.exist');

    fleetsPage.openCreateFleetFormButton.click();
    createFleetWizardPage = new CreateFleetWizardPage();

    createFleetWizardPage.title.should('have.text', 'Create fleet');

    createFleetWizardPage.newFleetNameField.type('sample-fleet');
    createFleetWizardPage.nextFleetWizardButton.should('be.enabled').click();

    createFleetWizardPage.newFleetSystemImageField.type('os-image');

    createFleetWizardPage.addConfigurationButton.should('be.enabled').click();
    createFleetWizardPage.newFleetSourceNameField.type('my-source');
    createFleetWizardPage.newFleetSourceTypeField.click();
    createFleetWizardPage.newFleetGitSourceTypeField.click();

    createFleetWizardPage.newFleetTargetReferenceField.type('main');
    createFleetWizardPage.newFleetRepositoryPathField.type('/file-path');
    createFleetWizardPage.newFleetRepositoryMountPathField.type('/mount-path');
    createFleetWizardPage.nextFleetWizardButton.should('be.enabled').click();

    createFleetWizardPage.createFleetFormSubmitButton.should('be.enabled').click();

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
