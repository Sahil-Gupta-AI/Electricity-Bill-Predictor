const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("MongoDB Connected");
  } catch (error) {
    mongoose.set('bufferCommands', false);
    console.warn("MongoDB connection warning (running in offline/in-memory fallback mode):", error.message);
  }
};

module.exports = connectDB;