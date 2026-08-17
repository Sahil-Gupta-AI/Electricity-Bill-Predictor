const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const RETRY_INTERVAL_MS = 5000; // retry every 5 seconds

const connectDB = async () => {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ MongoDB Connected");

      // Auto-reconnect if connection drops at runtime
      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected. Retrying in 5s...");
        setTimeout(connectDB, RETRY_INTERVAL_MS);
      });

      break; // exit retry loop on success
    } catch (error) {
      console.warn(
        `❌ MongoDB connection failed: ${error.message}\n   Retrying in ${RETRY_INTERVAL_MS / 1000}s...`
      );
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
    }
  }
};

module.exports = connectDB;