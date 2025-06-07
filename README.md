# Store Management System

**Full-Stack Web Application for Efficient Store Operations**

## Overview

A robust store management system designed to streamline inventory, sales, and staff management. Built with a modern tech stack, the application provides a responsive and user-friendly interface for both administrators and staff.

---

## 🔑 Key Features

### 🛡️ User Authentication
- Secure JWT-based authentication for admins and staff.
- Role-based access control with distinct permissions for administrators and staff.

### 🏬 Store Management
- Admins can create and manage stores.
- Staff can join stores via invite links.

### 📦 Inventory Management
- Add, edit, delete, and bulk upload inventory items.
- Real-time stock updates during sales.

### 🌐 Multi-Language Support:
- Implemented using react-i18next for localization.
- Supports multiple languages for a global user base.

### 💰 Sales Tracking
- Record sales with customer details and itemized breakdowns.
- Generate invoices for completed sales.
- View sales history with filtering, sorting, and pagination.

### 🧾 Receipt OCR
- Extract item details from uploaded receipt images using Tesseract.js.

### 📊 Dashboard & Analytics
- Visualize sales and inventory data with interactive charts and KPIs.

### ✅ Testing & Code Coverage
- Comprehensive unit tests for both frontend and backend.
- Code coverage reports generated using Istanbul.

### 📱 Responsive UI
- Built with Salesforce Lightning Design System for a modern and mobile-friendly interface.

---

## 🛠 Technologies Used

### Frontend
- React (Vite)
- React Router
- Axios
- Recharts
- Salesforce Lightning Design System

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- dotenv
- cors

### Testing
- Vitest
- React Testing Library
- Custom backend test suites

### Other Tools
- Tesseract.js for OCR
- string-similarity for data matching

---

## 🌟 Project Highlights

### 🔧 Scalable Architecture
- Modular design with separate controllers, models, and routes for backend logic.

### 👩‍💻 Developer-Friendly
- Linting and formatting with ESLint and Prettier.
- Easy setup with detailed documentation and environment configuration.

### ⚡ Performance Optimization
- Efficient database queries with Mongoose.
- Pagination and sorting for large datasets.

### 🔒 Security
- Secure authentication and authorization mechanisms.
- Validation of user input to prevent common vulnerabilities.

---

## 🚀 Deployment

### Frontend
- Vite development server for local testing.

### Backend
- Node.js server with MongoDB integration.

---

## 🧪 Running the Project

```bash
git clone https://github.com/srbmaury/store-management-copy.git

# Frontend
cd client
npm install            # install the dependencies
npm run dev            # Start the development server
npm run test           # Run unit tests
npm run test:coverage  # Generate code coverage report
npm run cypress:open   # Open Cypress for end-to-end testing

# Backend
cd server
npm install            # install the dependencies
npm run dev            # Start the backend server
npm run test           # Run backend tests
npm run test:coverage  # Generate backend code coverage report

## 🤝 Want to Contribute?

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.