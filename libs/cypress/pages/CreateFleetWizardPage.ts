export class CreateFleetWizardPage {
  constructor() {
    cy.get('section').as(CreateFleetWizardPage.name);
  }

  static get alias() {
    return `@${CreateFleetWizardPage.name}`;
  }

  get body() {
    return cy.get(CreateFleetWizardPage.alias);
  }

  get title() {
    return cy.get('h1');
  }

  get newFleetNameField() {
    return cy.get('input[aria-label="Name"]');
  }

  openFleetRichValidationsPopover() {
    return cy.get('button[aria-label="Validation"').click();
  }

  get newFleetRichValidationsPopoverError() {
    return cy.get('.pf-v5-c-helper-text__item.pf-m-error');
  }

  get newFleetSystemImageField() {
    return cy.get('input[aria-label="System image"]');
  }

  get newFleetSourceNameField() {
    return cy.get('input[aria-label="Source name"]');
  }

  get newFleetSourceTypeField() {
    return cy.get('button[id="selectfield-configTemplates[0].type-menu"]');
  }

  get newFleetGitSourceTypeField() {
    return cy.contains('button', 'Git configuration');
  }

  get newFleetTargetReferenceField() {
    return cy.get('input[aria-label="Branch/tag/commit"]');
  }

  get newFleetRepositoryPathField() {
    return cy.get('input[aria-label="Path"]');
  }

  get createFleetFormSubmitButton() {
    return cy.contains('button', 'Create fleet');
  }

  get nextFleetWizardButton() {
    return cy.contains('button', 'Next');
  }

  get addConfigurationButton() {
    return cy.contains('button', 'Add configuration');
  }
}
