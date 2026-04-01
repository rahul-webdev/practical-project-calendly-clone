const express = require("express");
const morgan = require("morgan");
const env = require("./config/env");
const { applySecurity, checkApiKey } = require("./middleware/security");
const { encryptionMiddleware } = require("./middleware/encryption");
const { notFound, errorHandler } = require("./middleware/error");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const meetingsRoutes = require("./routes/meetings");
const availabilityRoutes = require("./routes/availability");
const linksRoutes = require("./routes/links");
const bookingsRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
app.disable("x-powered-by");

applySecurity(app);

app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Health check (no API key needed)
app.get("/health", (req, res) => res.json({ ok: true }));

// All other API routes are versioned and require API key
const apiRouter = express.Router();
apiRouter.use(checkApiKey);
apiRouter.use(encryptionMiddleware);

apiRouter.use(authRoutes);
apiRouter.use(meetingsRoutes);
apiRouter.use(availabilityRoutes);
apiRouter.use(linksRoutes);
apiRouter.use(bookingsRoutes);
apiRouter.use(dashboardRoutes);

app.use(`/api/${env.apiVersion}`, apiRouter);

app.use(notFound);
app.use(errorHandler);
connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log("\n" + "=".repeat(40));
      console.log(`🚀 Server running on port: ${env.port}`);
      console.log(`🌍 API URL: http://localhost:${env.port}`);
      console.log(`💻 Frontend URL allowed: ${env.frontendUrl}`);
      console.log(`⚙️  Environment: ${env.nodeEnv}`);
      console.log("=".repeat(40) + "\n");
    });
  })
  .catch((e) => {
    console.error("DB connection failed", e);
    process.exit(1);
  });
