const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("../config/env");
function applySecurity(app) {
  app.use(helmet());
  const extraOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(new Set([env.frontendUrl, ...extraOrigins].filter(Boolean)));
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.includes(origin);
      return callback(null, allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}
module.exports = { applySecurity };
