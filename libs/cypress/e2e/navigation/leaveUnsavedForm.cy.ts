import { FleetsPage } from '../../pages/FleetsPage';
import { CreateFleetWizardPage } from '../../pages/CreateFleetWizardPage';
import { GenericModalPage } from '../../pages/GenericModalPage';
import { MainNavigationSection } from '../../pages/MainNavigationSection';

describe('Unsaved form confirmation', () => {
  let fleetsPage: FleetsPage;
  let createFleetWizardPage: CreateFleetWizardPage;

  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  beforeEach(() => {
    FleetsPage.visit();

    fleetsPage = new FleetsPage();
  });

  it('shows a warning before leaving an unsaved form', () => {
    fleetsPage.openCreateFleetFormButton.click();
    createFleetWizardPage = new CreateFleetWizardPage();

    createFleetWizardPage.newFleetNameField.type('sample-fleet');

    // Attempt to leave the form with unsaved changes by moving to Devices
    MainNavigationSection.navigateToFlightCtlSection('Devices')

    const confirmUnsavedChanges = new GenericModalPage();
    confirmUnsavedChanges.modalTitle.should('contain.text', 'There are unsaved changes');
  });
});
