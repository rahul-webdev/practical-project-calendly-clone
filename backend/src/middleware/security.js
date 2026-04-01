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
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((o) => origin.startsWith(o));
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-KEY", "X-API-VERSION"],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.use(compression());
  app.use(cookieParser());

  // Rate Limiting: 100 requests per 15 minutes per IP
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
  });

  app.use(limiter);
}

/**
 * Middleware to check API key and version
 */
function checkApiKey(req, res, next) {
  const apiKey = req.header("X-API-KEY");
  const apiVersion = req.header("X-API-VERSION");

  if (!apiKey || apiKey !== env.apiKey) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or missing API key." });
  }

  if (!apiVersion || apiVersion !== env.apiVersion) {
    return res.status(400).json({ success: false, message: "Bad Request: Invalid or missing API version." });
  }

  next();
}

module.exports = { applySecurity, checkApiKey };
