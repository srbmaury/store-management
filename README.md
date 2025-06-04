cd client
npm run dev
npm run test
npm run test:coverage
npm run cypress:open
cd server
npm run dev
npm run test
npm run test:coverage

client/
    index.html
    vite.config.js
    README.md
    .gitignore
    package-lock.json
    package.json
    eslint.config.js
    public/
        vite.svg
    src/
        App.css
        index.css
        main.jsx
        App.jsx
        context/
            AuthContext.jsx
            SalesContext.jsx
        utils/
            useDebounce.js
            generateInvoiceHtml.js
            Spinner.jsx
            api.js
        components/
            PrivateRoute.jsx
            AuthForm.jsx
        assets/
            react.svg
        pages/
            SalesPage.jsx
            ReceiptUploader.jsx
            SalesHistoryPage.jsx
            DashboardPage.jsx
            AdminJoinRequests.jsx
            StoreListingPage.jsx
            InventoryPage.jsx
            auth/
                LoginPage.jsx
                RegisterPage.jsx
            charts/
                KPICards.jsx
                ChartToggleButtons.jsx
                ChartContainer.jsx
                LowStockAlert.jsx
                Chart.jsx
                RecentSalesTable.jsx
            helper/
                DashboardLayout.jsx
                SalesHistory.jsx
                SaleCard.jsx
                Items.jsx
server/
    index.js
    package-lock.json
    package.json
    .env
    index.jsc
    middleware/
        authMiddleware.js
    models/
        JoinRequest.js
        User.js
        Inventory.js
        Sale.js
    controllers/
        joinRequestController.js
        inventoryController.js
        salesController.js
        storeController.js
        authController.js
    routes/
        storeRoutes.js
        authRoutes.js
        joinRequestRoutes.js
        salesRoutes.js
        inventoryRoutes.js

 npm install --save-dev babel-jest @babel/preset-env @babel/preset-react
 npx vitest --coverage
 npm run test:coverage
 npx vitest

Store Management System
A full-stack web application for managing store inventory, sales, and staff, built with React (Vite) for the frontend and Node.js/Express/MongoDB for the backend.

Features
User Authentication: Register/login as admin or staff, JWT-based authentication.
Store Management: Admins can create stores, staff can join via join requests.
Inventory Management: Add, edit, delete, and bulk upload inventory items (Excel supported).
Sales Tracking: Record sales, view sales history, and generate invoices.
Receipt OCR: Upload receipt images and auto-extract items using OCR (Tesseract.js).
Dashboard & Analytics: Visualize sales and inventory data with charts and KPIs.
Role-Based Access: Admin and staff roles with appropriate permissions.
Responsive UI: Built with Salesforce Lightning Design System for a modern look.
Project Structure
Client
src/
pages/ – Main app pages (Dashboard, Inventory, Sales, etc.)
components/ – Reusable UI components
context/ – React context providers (Auth, Sales)
utils/ – Utility functions and API helpers
assets/ – Static assets (images, icons)
Uses Salesforce Lightning Design System for UI.
Server
controllers/ – Route logic (auth, inventory, sales, etc.)
models/ – Mongoose models (User, Inventory, Sale, etc.)
routes/ – Express route definitions
middleware/ – Auth and other middleware
Getting Started
Prerequisites
Node.js (v16+ recommended)
MongoDB (local or cloud)
1. Clone the repository
2. Install dependencies
Client
Server
3. Configure Environment Variables
Create a .env file in server:

1 vulnerability
4. Run the Application
Start Backend
Start Frontend
Frontend: http://localhost:5173
Backend: http://localhost:5000
Testing
Frontend
Uses Vitest and React Testing Library.

Backend
Add your tests in __tests__ and run with your preferred test runner.

Scripts
Client
npm run dev – Start Vite dev server
npm run build – Build for production
npm run preview – Preview production build
npm run lint – Lint code
npm run test – Run tests
Server
npm run dev – Start server with nodemon
npm start – Start server
Technologies Used
Frontend: React, Vite, React Router, Axios, Tesseract.js, string-similarity, recharts, Salesforce Lightning Design System
Backend: Node.js, Express, MongoDB, Mongoose, JWT, dotenv, cors
License
MIT

Acknowledgements
Salesforce Lightning Design System
Tesseract.js
Vitest
Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Author
Your Name
For more details, see the code in client/ and server/

Store Management System
Full-Stack Web Application for Efficient Store Operations

Overview:
A robust store management system designed to streamline inventory, sales, and staff management. Built with a modern tech stack, the application provides a responsive and user-friendly interface for both administrators and staff.

Key Features:

User Authentication:

Secure JWT-based authentication for admins and staff.
Role-based access control with distinct permissions for administrators and staff.
Store Management:

Admins can create and manage stores.
Staff can join stores via join requests.
Inventory Management:

Add, edit, delete, and bulk upload inventory items.
Real-time stock updates during sales.
Sales Tracking:

Record sales with customer details and itemized breakdowns.
Generate invoices for completed sales.
View sales history with filtering, sorting, and pagination.
Receipt OCR:

Extract item details from uploaded receipt images using Tesseract.js.
Dashboard & Analytics:

Visualize sales and inventory data with interactive charts and KPIs.
Testing & Code Coverage:

Comprehensive unit tests for both frontend and backend.
Code coverage reports generated using Istanbul.
Responsive UI:

Built with Salesforce Lightning Design System for a modern and mobile-friendly interface.
Technologies Used:

Frontend:

React (Vite), React Router, Axios, Recharts, Salesforce Lightning Design System.
Backend:

Node.js, Express.js, MongoDB, Mongoose, JWT, dotenv, cors.
Testing:

Vitest, React Testing Library, and custom backend test suites.
Other Tools:

Tesseract.js for OCR, string-similarity for data matching.
Project Highlights:

Scalable Architecture:

Modular design with separate controllers, models, and routes for backend logic.
Developer-Friendly:

Linting and formatting with ESLint and Prettier.
Easy setup with detailed documentation and environment configuration.
Performance Optimization:

Efficient database queries with Mongoose.
Pagination and sorting for large datasets.
Security:

Secure authentication and authorization mechanisms.
Validation of user input to prevent common vulnerabilities.
Deployment:

Frontend: Vite development server for local testing.
Backend: Node.js server with MongoDB integration.
License:
MIT License.

Acknowledgments:

Salesforce Lightning Design System.
Tesseract.js for OCR capabilities.
Istanbul.js for code coverage reporting.