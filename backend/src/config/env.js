const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/calendly_clone",
  jwtSecret: process.env.JWT_SECRET,
};
if (!env.jwtSecret) {
  console.warn("⚠️  Warning: JWT_SECRET is not defined in environment variables!");
}
module.exports = env;
