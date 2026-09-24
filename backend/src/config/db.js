const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careconnect';
  try {
    // Attempt connecting to configured MongoDB URI (e.g. local or Atlas)
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected successfully to standard instance: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to standard URI (${uri}). Launching embedded MongoDB Memory Server...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected successfully to embedded MongoMemoryServer: ${memUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to start MongoDB Memory Server:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
