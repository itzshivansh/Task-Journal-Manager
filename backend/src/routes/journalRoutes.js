import express from "express";
import {
  calendarMonth,
  calendarQuerySchema,
  deleteByDate,
  getByDate,
  getToday,
  listHistory,
  listJournalQuerySchema,
  upsertToday,
  upsertTodaySchema
} from "../controllers/journalController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const journalRoutes = express.Router();

journalRoutes.use(requireAuth);

journalRoutes.get("/today", getToday);
journalRoutes.put("/today", validate(upsertTodaySchema), upsertToday);

journalRoutes.get("/history", validate(listJournalQuerySchema, "query"), listHistory);
journalRoutes.get("/calendar", validate(calendarQuerySchema, "query"), calendarMonth);

journalRoutes.get("/:date", getByDate);
journalRoutes.delete("/:date", deleteByDate);

