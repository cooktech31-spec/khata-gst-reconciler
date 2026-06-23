// =====================================================================
// app.js — Express app setup
// =====================================================================

const express = require("express");
const cors = require("cors");

const { apiKeyAuth } = require("./middleware/apiKeyAuth");
const uploadRoutes = require("./routes/upload");
const batchRoutes = require("./routes/batches");

function createApp() {
  const app = express();

  app.use(cors()); // production mein origin restrict karna (SETUP.md mein note hai)
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  // Saare /api routes API key se protected hain
  app.use("/api", apiKeyAuth, uploadRoutes);
  app.use("/api", apiKeyAuth, batchRoutes);

  return app;
}

module.exports = { createApp };
