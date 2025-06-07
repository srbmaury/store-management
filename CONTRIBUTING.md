# Contributing to Store Management System
Thank you for considering contributing to the Store Management System! We welcome contributions from the community to improve the project, whether it's fixing bugs, adding new features, or improving documentation.

### How to Contribute
#### 1. Fork the Repository
- Navigate to the Store Management System GitHub repository.
- Click the "Fork" button to create your own copy of the repository.

#### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/store-management-copy.git
cd store-management-copy
```

#### 3. Set Up the Environment
- Install dependencies for both the frontend and backend:
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```
- Create a .env file in the server directory and configure the environment variables:
```bash
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```
#### 4. Create a New Branch
- Before making any changes, create a new branch:
```bash
git checkout -b feature/<your-feature-name>
```

####  5. Make Your Changes
- Add your code or documentation changes.
- Ensure your code follows the project's coding standards (ESLint and Prettier are configured).

####  6. Test Your Changes
- Run unit tests to ensure your changes don't break existing functionality:
```bash
# Frontend
cd client
npm run test

# Backend
cd ../server
npm run test
```
- If applicable, add new tests for your changes.

####  7. Commit Your Changes
- Write clear and concise commit messages:
```bash
git add .
git commit -m "Add feature: <description>"
```

####  8. Push Your Changes
- Push your branch to your forked repository:
```bash
git push origin feature/<your-feature-name>
```

####  9. Create a Pull Request
- Navigate to the original repository.
- Click "New Pull Request" and select your branch.
- Provide a detailed description of your changes and why they are necessary.

## Code of Conduct
Please adhere to the project's Code of Conduct to ensure a welcoming and inclusive environment.

### Development Guidelines
#### Frontend
- Use React best practices for component design and state management.
- Follow the folder structure conventions.

#### Backend
- Use modular design for controllers, routes, and models.
- Follow RESTful API principles.
- Ensure proper error handling and validation.

### Reporting Issues
If you encounter any bugs or have feature requests, please open an issue in the Issues tab.

### Acknowledgments
Thank you for contributing to the Store Management System! Your efforts help make this project better for everyone. 😊

Feel free to reach out if you have any questions or need assistance. Happy coding! 🚀