const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const isTest = process.env.NODE_ENV === 'test';
const mongoURI = isTest ? process.env.MONGO_TEST_URI : process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log(`MongoDB connected to ${isTest ? 'TEST' : 'MAIN'} database`);

    if (isTest) {
      // Clear test database before running tests
      mongoose.connection.db.dropDatabase()
        .then(() => {
          console.log('Test database cleared');
          startServer();
        })
        .catch(err => {
          console.error('Failed to clear test database:', err);
          startServer();
        });
    } else {
      startServer();
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
