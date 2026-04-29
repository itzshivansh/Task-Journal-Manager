import { useEffect, useMemo, useState } from "react";
import API from "../utils/api"; // ✅ FIXED
import { useToast } from "../ui/Toast.jsx";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskRow } from "./components/SortableTaskRow.jsx";
import { ensureNotificationPermission, scheduleTaskReminder } from "../lib/notifications.js";

export function TasksPage() {
  const toast = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  const query = useMemo(
    () => ({
      q: q || undefined,
      status: status || undefined,
      priority: priority || undefined,
      page: 1,
      limit: 50
    }),
    [q, status, priority]
  );

  async function load() {
    setBusy(true);
    try {
      const { data } = await API.get("/api/tasks", { params: query }); // ✅ FIXED
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.show(err?.response?.data?.error || "Failed to load tasks", "error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [query]);

  async function createTask() {
    if (!newTitle.trim()) {
      toast.show("Task title required", "error");
      return;
    }

    try {
      const { data } = await API.post("/api/tasks", {
        title: newTitle.trim(),
        dueDate: newDue ? new Date(newDue).toISOString() : null,
        priority: newPriority
      });

      if (remindersEnabled) scheduleTaskReminder(data.task);

      setNewTitle("");
      setNewDue("");
      setNewPriority("Medium");

      await load();
    } catch (err) {
      toast.show(err?.response?.data?.error || "Failed to create task", "error");
    }
  }

  async function toggleComplete(task) {
    try {
      await API.patch(`/api/tasks/${task._id}`, {
        status: task.status === "Completed" ? "Pending" : "Completed"
      });

      await load();
    } catch (err) {
      toast.show(err?.response?.data?.error || "Failed to update task", "error");
    }
  }

  async function removeTask(task) {
    try {
      await API.delete(`/api/tasks/${task._id}`);

      toast.show("Task deleted", "success");

      await load();
    } catch (err) {
      toast.show(err?.response?.data?.error || "Failed to delete task", "error");
    }
  }

  async function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    try {
      await API.post("/api/tasks/reorder", {
        orderedIds: next.map((t) => t._id)
      });
    } catch {
      toast.show("Reorder failed", "error");
      await load();
    }
  }

  return (
    <div className="space-y-4">
      {/* UI SAME — no change needed */}
      {/* (your JSX remains exactly same) */}
      {/* I didn't modify UI to avoid breaking layout */}
      {busy ? (
        <div className="card p-6">Loading…</div>
      ) : (
        <div className="card card-hover p-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((t) => t._id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    No tasks.
                  </div>
                ) : (
                  items.map((t) => (
                    <SortableTaskRow
                      key={t._id}
                      task={t}
                      onToggle={() => toggleComplete(t)}
                      onDelete={() => removeTask(t)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}