/// <reference types="cypress" />

describe('Auth Flow: Signup then Login', () => {
  const adminEmail = 'testingadminemail@example.com'
  const password = 'testpassword'
  const staffEmail = 'testingstaffemail@example.com'

  beforeEach(() => {
    // Clear test data if your backend supports it
    // cy.request('GET', 'https://store-management-backend-peg6.onrender.com/api/test');
    cy.request('DELETE', 'https://store-management-backend-peg6.onrender.com/api/test/clear', { email: adminEmail });
    cy.request('DELETE', 'https://store-management-backend-peg6.onrender.com/api/test/clear', { email: staffEmail });
  });

  it('Registers a new admin user and staff user, handles join requests, and verifies approval flow', () => {
    cy.visit('https://store-management-frontend-skek.onrender.com/register')

    cy.get('select[name=role]').select('admin')
    cy.get('input[name=name]').type('Test Admin')
    cy.get('input[name=phone]').type('+911234567890')
    cy.get('input[name=storeName]').type('Test Store')
    cy.get('textarea[name=address]').type('123 Test Street')
    cy.get('input[name=confirmPassword]').type(password)
    cy.get('input[name=email]').type(adminEmail)
    cy.get('input[name=password]').type(password)

    cy.get('button[type=submit]').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test Admin!').should('be.visible')

    cy.request('DELETE', 'https://store-management-backend-peg6.onrender.com/api/test/clear', { email: staffEmail })
    cy.visit('https://store-management-frontend-skek.onrender.com/register')

    cy.get('select[name=role]').select('staff')
    cy.get('input[name=name]').type('Test Staff')
    cy.get('input[name=phone]').type('+911234567890')
    cy.get('input[name=confirmPassword]').type(password)
    cy.get('input[name=email]').type(staffEmail)
    cy.get('input[name=password]').type(password)

    cy.get('button[type=submit]').click()

    cy.url().should('include', '/storeListing')
    cy.contains('Available Stores').should('be.visible')

    // Find the store card containing "Test Store"
    cy.contains('.slds-box', 'Test Store').within(() => {
      // The button should be visible and labeled 'Request to Join'
      cy.contains('button', 'Request to Join').should('be.visible').click()

      // After clicking, it should show the 'Pending' badge
      cy.contains('.slds-badge', 'Pending').should('be.visible')
    })

    cy.visit('https://store-management-frontend-skek.onrender.com/login')

    cy.get('input[name=email]').type(adminEmail)
    cy.get('input[name=password]').type(password)
    cy.get('button[type=submit]').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test Admin!').should('be.visible')

    // Click on the Join Requests button in the navigation
    cy.contains('button', 'Join Requests').click()

    // Assert URL changed accordingly, e.g., to /joinRequests
    cy.url().should('include', '/joinRequests')

    cy.contains('Pending Join Requests').should('be.visible')

    cy.contains('.slds-box', 'Test Staff').within(() => {
      // The button should be visible and labeled 'Approve'
      cy.contains('button', 'Approve').should('be.visible').click()
    })

    cy.visit('https://store-management-frontend-skek.onrender.com/login')

    cy.get('input[name=email]').type(staffEmail)
    cy.get('input[name=password]').type(password)
    cy.get('button[type=submit]').click()

    cy.url().should('include', '/storeListing')
    cy.contains('Available Stores').should('be.visible')
    cy.contains('.slds-box', 'Test Store').within(() => {
      // The button should now be labeled 'Approved'
      cy.contains('span', 'Approved').should('be.visible')
      cy.contains('button', 'Join Store').should('be.visible').click()
    })
    cy.url().should('include', '/sales')
  })

  it('Registers a new admin user and staff user, handles join requests, and verifies rejection flow', () => {
    cy.visit('https://store-management-frontend-skek.onrender.com/register')

    cy.get('select[name=role]').select('admin')
    cy.get('input[name=name]').type('Test Admin')
    cy.get('input[name=phone]').type('+911234567890')
    cy.get('input[name=storeName]').type('Test Store')
    cy.get('textarea[name=address]').type('123 Test Street')
    cy.get('input[name=confirmPassword]').type(password)
    cy.get('input[name=email]').type(adminEmail)
    cy.get('input[name=password]').type(password)

    cy.get('button[type=submit]').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test Admin!').should('be.visible')

    cy.request('DELETE', 'https://store-management-backend-peg6.onrender.com/api/test/clear', { email: staffEmail })
    cy.visit('https://store-management-frontend-skek.onrender.com/register')

    cy.get('select[name=role]').select('staff')
    cy.get('input[name=name]').type('Test Staff')
    cy.get('input[name=phone]').type('+911234567890')
    cy.get('input[name=confirmPassword]').type(password)
    cy.get('input[name=email]').type(staffEmail)
    cy.get('input[name=password]').type(password)

    cy.get('button[type=submit]').click()

    cy.url().should('include', '/storeListing')
    cy.contains('Available Stores').should('be.visible')

    // Find the store card containing "Test Store"
    cy.contains('.slds-box', 'Test Store').within(() => {
      // The button should be visible and labeled 'Request to Join'
      cy.contains('button', 'Request to Join').should('be.visible').click()

      // After clicking, it should show the 'Pending' badge
      cy.contains('.slds-badge', 'Pending').should('be.visible')
    })

    cy.visit('https://store-management-frontend-skek.onrender.com/login')

    cy.get('input[name=email]').type(adminEmail)
    cy.get('input[name=password]').type(password)
    cy.get('button[type=submit]').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test Admin!').should('be.visible')

    // Click on the
    cy.contains('button', 'Join Requests').click()
    // Assert URL changed accordingly, e.g., to /joinRequests
    cy.url().should('include', '/joinRequests')
    cy.contains('Pending Join Requests').should('be.visible')
    cy.contains('.slds-box', 'Test Staff').within(() => {
      // The button should be visible and labeled 'Reject'
      cy.contains('button', 'Reject').should('be.visible').click()
    })

    cy.visit('https://store-management-frontend-skek.onrender.com/login')
    cy.get('input[name=email]').type(staffEmail)
    cy.get('input[name=password]').type(password)
    cy.get('button[type=submit]').click()
    cy.url().should('include', '/storeListing')
    cy.contains('Available Stores').should('be.visible')
    cy.contains('.slds-box', 'Test Store').within(() => {
      // The button should now be labeled 'Rejected'
      cy.contains('span', 'Rejected').should('be.visible')
      cy.contains('button', 'Join Store').should('not.exist')
    })
    cy.contains('button', 'Logout').click()
    cy.url().should('include', '/login')
    cy.get('input[name=email]').type(adminEmail)
    cy.get('input[name=password]').type(password)
    cy.get('button[type=submit]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test Admin!').should('be.visible')
    cy.contains('button', 'Join Requests').click()
    cy.url().should('include', '/joinRequests')
    cy.contains('Pending Join Requests').should('be.visible')
    cy.contains('.slds-box', 'Test Staff').should('not.exist')
    cy.contains('button', 'Back to Dashboard').click()

    cy.contains('button', 'Logout').click()
    cy.url().should('include', '/login')
  })
})
