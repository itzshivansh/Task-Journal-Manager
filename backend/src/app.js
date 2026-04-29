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

  // =========================
  // Security Middleware
  // =========================
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // =========================
  // CORS (FIXED - PRODUCTION SAFE)
  // =========================
  const allowedOrigins = [
    "https://task-journal-manager.vercel.app",
    "http://localhost:5173"
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow Postman / server-to-server
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // DO NOT crash request in production
        return callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );

  // Handle preflight requests
  app.options("*", cors());

  // =========================
  // HEALTH CHECK
  // =========================
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // =========================
  // ROOT
  // =========================
  app.get("/", (_req, res) => {
    res.json({
      status: "OK",
      message: "Task & Journal API is running 🚀"
    });
  });

  app.head("/", (_req, res) => {
    res.status(200).end();
  });

  // =========================
  // ROUTES
  // =========================
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/journal", journalRoutes);

  // =========================
  // ERROR HANDLERS
  // =========================
  app.use(notFound);
  app.use(errorHandler);

  return app;
}