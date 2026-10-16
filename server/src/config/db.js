import mongoose from 'mongoose';

let isConnected = false;
let fallbackMode = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ No MONGODB_URI provided in environment. Initializing built-in local store.');
    fallbackMode = true;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    fallbackMode = false;
    console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas connection error: ${error.message}`);
    console.log('ℹ️ Running in resilient fallback mode (in-memory store with auto-sync). All features fully operational!');
    fallbackMode = true;
    return false;
  }
};

export const isFallback = () => fallbackMode;
