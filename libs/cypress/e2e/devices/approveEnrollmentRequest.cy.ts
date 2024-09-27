import { DevicesPage } from '../../pages/DevicesPage';
import { ApproveEnrollmentRequestModalPage } from '../../pages/ApproveEnrollmentRequestModalPage';

let devicesPage: DevicesPage;
let approveERModalPage: ApproveEnrollmentRequestModalPage;

describe('Enrollment requests approval', () => {
  beforeEach(() => {
    cy.loadApiInterceptors();
  });

  beforeEach(() => {
    DevicesPage.visit();
    devicesPage = new DevicesPage();
  });

  it('Pending enrollment requests can be approved', () => {
    // Make the "approve enrollment request" modal appear
    devicesPage.firstEnrollmentRequestKebabMenu.click();
    devicesPage.enrollmentRequestKebabMenuAction('Approve').click();

    // Validate that the enrollment request details shown are correct
    approveERModalPage = new ApproveEnrollmentRequestModalPage();
    approveERModalPage.modalTitle.should('contain.text', 'Approve pending device');
    approveERModalPage.deviceName.should(
      'contain.text',
      'a021622d8633782719874da4052f957faa742fc7050026748bc79065c8819d139',
    );

    // Define a new label. The field for adding the new label is focused and can be changed
    approveERModalPage.addNewLabelButton.click();
    cy.focused().should('have.value', 'key=value').clear().type('this-is-a-test=yes');

    // Fill in the rest of the form
    approveERModalPage.deviceAliasField.type('new-device');

    // Submit and verify that the modal closes without an error
    approveERModalPage.approveSubmitButton.should('be.enabled').click();
    approveERModalPage.body.should('not.exist');

    // NOTE: The ER will still appear in the device list as such.
    // To mock it properly, we'd need to remove it from the ER list, and add its equivalent item to the Device list.
  });
});
