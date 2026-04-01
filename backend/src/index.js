const express = require("express");
const morgan = require("morgan");
const env = require("./config/env");
const { applySecurity } = require("./middleware/security");
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
app.get("/health", (req, res) => res.json({ ok: true }));
app.use(authRoutes);
app.use(meetingsRoutes);
app.use(availabilityRoutes);
app.use(linksRoutes);
app.use(bookingsRoutes);
app.use(dashboardRoutes);
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
