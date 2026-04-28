import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRoutes = express.Router();

dashboardRoutes.get("/", requireAuth, getDashboard);

