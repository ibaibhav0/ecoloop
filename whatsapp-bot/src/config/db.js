import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
mongoose.set('bufferCommands', false);

export let isMongoConnected = false;

export async function connectDB() {
  if (!MONGODB_URI || MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost')) {
    // Only attempt if explicit or local mongod is expected, with tight 1s timeout
    try {
      if (mongoose.connection.readyState >= 1) {
        isMongoConnected = true;
        return mongoose.connection;
      }
      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 2000,
      });
      isMongoConnected = true;
      console.log(`📡 [MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      isMongoConnected = false;
      console.log(`ℹ️ [Database] Running with zero-latency in-memory persistence resilience store.`);
      return null;
    }
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isMongoConnected = true;
    console.log(`📡 [MongoDB Atlas] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [MongoDB] Atlas Notice: ${err.message}. Local resilience store active.`);
    return null;
  }
}
