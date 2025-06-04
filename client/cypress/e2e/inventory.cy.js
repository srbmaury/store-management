/// <reference types="cypress" />

describe('Inventory Page Admin Flow', () => {
    const adminEmail = 'testingadminemail@example.com';
    const password = 'testpassword';

    beforeEach(() => {
        // Clear test data if your backend supports it
        cy.request('DELETE', 'http://localhost:5000/api/test/clear', { email: adminEmail });
    });

    it('Add items to inventory, update and delete items from inventory, upload inventory Excel file and filter items', () => {
        cy.visit('http://localhost:5173/register');

        cy.get('select[name=role]').select('admin');
        cy.get('input[name=name]').type('Inventory Admin');
        cy.get('input[name=phone]').type('+911234567890');
        cy.get('input[name=storeName]').type('Test Store');
        cy.get('textarea[name=address]').type('123 Test Street');
        cy.get('input[name=email]').type(adminEmail);
        cy.get('input[name=password]').type(password);
        cy.get('input[name=confirmPassword]').type(password);

        cy.get('button[type=submit]').click();

        cy.url().should('include', '/dashboard');
        cy.contains('Welcome, Inventory Admin!').should('be.visible');

        // Navigate to inventory page
        cy.visit('http://localhost:5173/inventory');

        // Add first item
        cy.contains('button', 'Add New Item').click();

        cy.get('input[name=name]').type('Test Item 1');
        cy.get('input[name=sku]').type('SKU001');
        cy.get('input[name=price]').type('9.99');
        cy.get('input[name=stock]').type('10');
        cy.get('input[name=category]').type('Category A');
        cy.get('button[type=submit]').click();

        cy.contains('Test Item 1').should('exist');

        // Add second item
        cy.contains('button', 'Add New Item').click();

        cy.get('input[name=name]').type('Test Item 2');
        cy.get('input[name=sku]').type('SKU002');
        cy.get('input[name=price]').type('19.99');
        cy.get('input[name=stock]').type('5');
        cy.get('input[name=category]').type('Category B');
        cy.get('button[type=submit]').click();

        cy.contains('Item added').should('be.visible');
        cy.contains('Test Item 2').should('exist');

        // Find the row containing "Test Item 1" and click Edit
        cy.contains('tr', 'Test Item 1').within(() => {
            cy.contains('button', 'Edit').click();
        });

        // Change price and stock, then submit
        cy.get('input[name=price]').clear().type('12.99');
        cy.get('input[name=stock]').clear().type('15');
        cy.get('button[type=submit]').click();

        // Confirm success message and updated values
        cy.contains('Item updated').should('be.visible');
        cy.contains('tr', 'Test Item 1').within(() => {
            cy.contains('12.99');
            cy.contains('15');
        });

        // Stub window.confirm to always return true to simulate user clicking "OK"
        cy.on('window:confirm', () => true);

        // Find the row containing "Test Item 2" and click Delete
        cy.contains('tr', 'Test Item 2').within(() => {
            cy.contains('button', 'Delete').click();
        });

        // Confirm success message and that item is gone
        cy.contains('Item deleted').should('be.visible');
        cy.contains('Test Item 2').should('not.exist');

        // Prepare the file from fixtures
        const fileName = 'sample_inventory.xlsx';

        // Attach the file to the hidden input (use data-testid or unique selector)
        cy.get('input[data-testid="excel-upload-input"]').attachFile(fileName);

        // Wait for the upload and API calls to complete
        // You can listen to API calls or just wait for UI update
        cy.contains('Inventory updated from Excel').should('be.visible');
        // wait till list size becomes 11
        cy.get('table tbody tr').should('have.length', 10);
        // Verify new item is shown
        cy.contains('Orange').should('exist');
        cy.contains('SKU009').should('exist');

        // Filter by name "Milk"
        cy.get('input[placeholder="Search by name"]').clear().type('Milk');
        cy.waitForSpinnerToDisappear();
        cy.get('table tbody tr').should('have.length', 1);
        cy.get('table tbody tr').first().contains('Milk');

        // Clear and filter by category "Dairy"
        cy.get('input[placeholder="Search by name"]').clear();
        cy.get('input[placeholder="Category"]').clear().type('Dairy');
        cy.waitForSpinnerToDisappear();
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).invoke('text').then(text => {
                expect(text).to.match(/Butter|Cake|Chips|Bread/);
            });
        });

        // Filter by min stock 100
        cy.get('input[placeholder="Min Stock"]').clear().type('100');
        cy.waitForSpinnerToDisappear();
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).find('td').eq(3).invoke('text').then(text => {
                expect(Number(text)).to.be.gte(100);
            });
        });

        // Filter by max stock 50
        cy.get('input[placeholder="Min Stock"]').clear();
        cy.get('input[placeholder="Max Stock"]').clear().type('100');
        cy.waitForSpinnerToDisappear();
        cy.get('table tbody tr').each(($row) => {
            cy.wrap($row).find('td').eq(2).invoke('text').then(text => {
                expect(Number(text)).to.be.lte(100);
            });
        });

        // Combined filters: name "Cheese", category "Snacks", min 100, max 200
        cy.get('input[placeholder="Search by name"]').clear().type('Cheese');
        cy.get('input[placeholder="Category"]').clear().type('Snacks');
        cy.get('input[placeholder="Min Stock"]').clear().type('1');
        cy.get('input[placeholder="Max Stock"]').clear().type('200');
        cy.waitForSpinnerToDisappear();
        cy.get('table tbody tr').should('have.length', 1);
        cy.get('table tbody tr').first().contains('Cheese');
    });
});
