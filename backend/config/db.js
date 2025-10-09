const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // Don't exit process - let server run without DB
  }
};

mongoose.connection.on('error', err => {
  console.log('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

module.exports = connectDB;