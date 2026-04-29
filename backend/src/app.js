import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { authRoutes } from "./routes/authRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { journalRoutes } from "./routes/journalRoutes.js";
import { taskRoutes } from "./routes/taskRoutes.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Security + logging
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // ✅ CORS FIX (safe for frontend + Render)
  app.use(
    cors({
      origin: true, // allows all origins (safe for dev + your Vercel frontend)
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ FIX: NO "*" (this was crashing your server)
  app.options(/.*/, cors());

  // Health routes
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/", (_req, res) => {
    res.json({
      status: "OK",
      message: "Task & Journal API is running 🚀",
    });
  });

  app.head("/", (_req, res) => {
    res.status(200).end();
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/journal", journalRoutes);

  // 404 handler (IMPORTANT)
  app.use(notFound);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}