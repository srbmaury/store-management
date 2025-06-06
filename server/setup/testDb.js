const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

exports.connectTestDb = async () => {
	mongo = await MongoMemoryServer.create();
	const uri = mongo.getUri();
	await mongoose.connect(uri);
};

exports.clearDb = async () => {
	const collections = mongoose.connection.collections;
	for (let key in collections) {
		await collections[key].deleteMany();
	}
};

exports.closeTestDb = async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongo.stop();
};