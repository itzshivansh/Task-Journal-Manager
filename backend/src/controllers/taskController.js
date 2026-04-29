import { z } from "zod";
import { Task } from "../models/Task.js";
import { HttpError } from "../utils/httpError.js";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(5000).optional().default(""),
  dueDate: z.string().datetime().optional().nullable().default(null),
  priority: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
  status: z.enum(["Pending", "Completed"]).optional().default("Pending")
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  order: z.number().int().optional(),
  completedAt: z.string().datetime().optional().nullable()
});

export const listTasksQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["Pending", "Completed"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1)
});

export async function createTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, priority, status } = req.body;

    const max = await Task.findOne({ userId }).sort({ order: -1 }).select("order");
    const order = (max?.order ?? 0) + 1;

    const task = await Task.create({
      userId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      status,
      order,
      completedAt: status === "Completed" ? new Date() : null
    });

    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function listTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { q, status, priority, from, to, page, limit } = req.validatedQuery || req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to) filter.dueDate.$lte = new Date(to);
    }
    if (q) {
      filter.$or = [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Task.find(filter).sort({ order: 1, dueDate: 1, createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter)
    ]);

    return res.json({ items, page, limit, total });
  } catch (err) {
    return next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const patch = { ...req.body };

    // ✅ Normalize checkbox-style input
    if (patch.completed === true) {
      patch.status = "Completed";
      patch.completedAt = new Date();
      delete patch.completed;
    }

    if (patch.completed === false) {
      patch.status = "Pending";
      patch.completedAt = null;
      delete patch.completed;
    }

    // ✅ Ensure valid date conversion
    if (patch.dueDate !== undefined) {
      patch.dueDate = patch.dueDate ? new Date(patch.dueDate) : null;
    }

    if (patch.completedAt !== undefined && patch.completedAt !== null) {
      patch.completedAt = new Date(patch.completedAt);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: patch },
      { new: true, runValidators: true }
    );

    if (!task) return next(new HttpError(404, "Task not found"));

    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) return next(new HttpError(404, "Task not found"));
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

export async function reorderTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { orderedIds } = req.body;

    const tasks = await Task.find({ userId, _id: { $in: orderedIds } }).select("_id");
    if (tasks.length !== orderedIds.length) return next(new HttpError(400, "Some tasks not found"));

    const bulk = orderedIds.map((id, idx) => ({
      updateOne: { filter: { _id: id, userId }, update: { $set: { order: idx + 1 } } }
    }));
    await Task.bulkWrite(bulk);

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

