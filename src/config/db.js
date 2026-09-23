const mongoose = require('mongoose');

// Cached connection: required on Vercel serverless (reuses the
// connection across warm invocations instead of opening a new one
// per request and exhausting the Atlas connection pool).
let cached = global.__deltaMongoose;
if (!cached) {
  cached = global.__deltaMongoose = { conn: null, promise: null };
}

async function connectDB(uri) {
  if (cached.conn) return cached.conn;
  if (!uri) throw new Error('MONGO_URI is missing. Set it in backend/.env (or Vercel env vars)');
  mongoose.set('strictQuery', true);
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((m) => {
      console.log('MongoDB connected:', m.connection.host, '/', m.connection.name);
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
