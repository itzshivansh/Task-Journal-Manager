import { z } from "zod";
import { JournalEntry } from "../models/JournalEntry.js";
import { HttpError } from "../utils/httpError.js";
import { isValidYmd, toYmd } from "../utils/date.js";

export const upsertTodaySchema = z.object({
  date: z.string().optional(), // allow client to pass local date; default server date
  title: z.string().max(200).optional().default(""),
  contentHtml: z.string().max(200000).optional().default("")
});

export const listJournalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(60).optional().default(15)
});

export const calendarQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/) // YYYY-MM
});

export async function getToday(req, res, next) {
  try {
    const userId = req.user.id;
    const date = toYmd(new Date());
    const entry = await JournalEntry.findOne({ userId, date });
    return res.json({ entry: entry || null, date });
  } catch (err) {
    return next(err);
  }
}

export async function upsertToday(req, res, next) {
  try {
    const userId = req.user.id;
    const date = req.body.date ? req.body.date : toYmd(new Date());
    if (!isValidYmd(date)) return next(new HttpError(400, "Invalid date format"));

    const entry = await JournalEntry.findOneAndUpdate(
      { userId, date },
      { $set: { title: req.body.title ?? "", contentHtml: req.body.contentHtml ?? "" } },
      { upsert: true, new: true }
    );

    return res.json({ entry });
  } catch (err) {
    if (err?.code === 11000) return next(new HttpError(409, "Only one journal entry per day"));
    return next(err);
  }
}

export async function getByDate(req, res, next) {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    if (!isValidYmd(date)) return next(new HttpError(400, "Invalid date format"));
    const entry = await JournalEntry.findOne({ userId, date });
    if (!entry) return next(new HttpError(404, "Entry not found"));
    return res.json({ entry });
  } catch (err) {
    return next(err);
  }
}

export async function deleteByDate(req, res, next) {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    if (!isValidYmd(date)) return next(new HttpError(400, "Invalid date format"));
    const entry = await JournalEntry.findOneAndDelete({ userId, date });
    if (!entry) return next(new HttpError(404, "Entry not found"));
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

export async function listHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit } = req.validatedQuery || req.query;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      JournalEntry.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
      JournalEntry.countDocuments({ userId })
    ]);
    return res.json({ items, page, limit, total });
  } catch (err) {
    return next(err);
  }
}

export async function calendarMonth(req, res, next) {
  try {
    const userId = req.user.id;
    const { month } = req.validatedQuery || req.query; // YYYY-MM
    const prefix = `${month}-`;
    const items = await JournalEntry.find({ userId, date: { $regex: `^${prefix}` } }).select("date title");
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
}

