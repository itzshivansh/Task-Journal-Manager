import express from "express";
import {
  createTask,
  createTaskSchema,
  deleteTask,
  listTasks,
  listTasksQuerySchema,
  reorderSchema,
  reorderTasks,
  updateTask,
  updateTaskSchema
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const taskRoutes = express.Router();

taskRoutes.use(requireAuth);

taskRoutes.get("/", validate(listTasksQuerySchema, "query"), listTasks);
taskRoutes.post("/", validate(createTaskSchema), createTask);
taskRoutes.patch("/:id", validate(updateTaskSchema), updateTask);
taskRoutes.delete("/:id", deleteTask);
taskRoutes.post("/reorder", validate(reorderSchema), reorderTasks);

