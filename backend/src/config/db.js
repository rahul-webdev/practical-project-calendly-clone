const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
