const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/calendly_clone",
  jwtSecret: process.env.JWT_SECRET,
  apiVersion: process.env.API_VERSION || "v1",
  apiKey: process.env.API_KEY || "calendly_clone_secret_key",
  encryptionKey: process.env.API_ENCRYPTION_KEY || "calendly_clone_encryption_key_32",
};

if (!env.jwtSecret) {
  console.warn("⚠️  Warning: JWT_SECRET is not defined in environment variables!");
}
if (!process.env.API_KEY) {
  console.warn("⚠️  Warning: API_KEY is not defined, using default!");
}
if (!process.env.API_ENCRYPTION_KEY) {
  console.warn("⚠️  Warning: API_ENCRYPTION_KEY is not defined, using default!");
}
module.exports = env;
