// backend/api/index.js
import app from '../server.js';
import { connectDB } from '../config/database.js';

let cachedDb = null;

export default async (req, res) => {
  try {
    if (!cachedDb) {
      cachedDb = await connectDB();
    }
  } catch (err) {
    console.error('Failed to connect to database in serverless function:', err);
  }
  return app(req, res);
};
