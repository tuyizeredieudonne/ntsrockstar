import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConnection {
  isConnected?: number;
}

const mongooseConnection: MongooseConnection = {};

async function dbConnect() {
  if (mongooseConnection.isConnected) {
    return;
  }

  const db = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  mongooseConnection.isConnected = db.connections[0].readyState;
}

export default dbConnect; 