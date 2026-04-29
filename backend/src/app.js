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

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // FIXED CORS (NO BLOCKING)
  app.use(
    cors({
      origin: (origin, callback) => {
        return callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );

  app.options("*", cors());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/", (_req, res) => {
    res.json({
      status: "OK",
      message: "Task & Journal API is running 🚀"
    });
  });

  app.head("/", (_req, res) => {
    res.status(200).end();
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/journal", journalRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
