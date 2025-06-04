Cypress.Commands.add('waitForSpinnerToDisappear', () => {
  // Check if spinner exists, and if so, wait for it to disappear
  cy.get('body').then(($body) => {
    if ($body.find('.slds-spinner_container').length > 0) {
      // Spinner exists — wait for it to disappear
      cy.get('.slds-spinner_container', { timeout: 10000 }).should('not.exist');
    }
  });
  cy.wait(1000);
});
