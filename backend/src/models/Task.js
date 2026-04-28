import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueDate: { type: Date, default: null, index: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium", index: true },
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending", index: true },
    order: { type: Number, default: 0, index: true },
    completedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, order: 1 });

export const Task = mongoose.model("Task", taskSchema);

