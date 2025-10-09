// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options
      // useNewUrlParser: true, // This is now default in Mongoose 6+
      // useUnifiedTopology: true, // This is now default in Mongoose 6+
      // Add these modern options instead
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;