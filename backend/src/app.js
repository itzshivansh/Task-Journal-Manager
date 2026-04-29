import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { journalRoutes } from "./routes/journalRoutes.js";
import { taskRoutes } from "./routes/taskRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // =======================
  // Security & Middleware
  // =======================
  app.use(helmet());

  const allowedOrigins = String(env.CLIENT_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true); // allow Postman etc.
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // =======================
  // Health Check
  // =======================
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // =======================
  // ROOT ROUTE (IMPORTANT)
  // =======================
  app.get("/", (_req, res) => {
    res.json({
      status: "OK",
      message: "Task & Journal API is running 🚀"
    });
  });

  // For Render HEAD request
  app.head("/", (_req, res) => {
    res.status(200).end();
  });

  // =======================
  // API ROUTES
  // =======================
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/journal", journalRoutes);

  // =======================
  // ERROR HANDLING
  // =======================
  app.use(notFound);
  app.use(errorHandler);

  return app;
}