const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ No MONGO_URI provided in environment. Running in-memory mock mode.");
    return;
  }

  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("✅ MongoDB Connected successfully");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected.");
    });
  } catch (error) {
    console.warn(`⚠️ MongoDB connection skipped (${error.message}). In-memory fallback is active.`);
  }
};

module.exports = connectDB;
