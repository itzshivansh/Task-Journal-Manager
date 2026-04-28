import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
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
      const { data } = await api.get("/tasks", { params: query });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.show(err?.response?.data?.error?.message || "Failed to load tasks", "error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function createTask() {
    if (!newTitle.trim()) return;
    try {
      const { data } = await api.post("/tasks", {
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
      toast.show(err?.response?.data?.error?.message || "Failed to create task", "error");
    }
  }

  async function toggleComplete(task) {
    try {
      await api.patch(`/tasks/${task._id}`, {
        status: task.status === "Completed" ? "Pending" : "Completed"
      });
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.error?.message || "Failed to update task", "error");
    }
  }

  async function removeTask(task) {
    try {
      await api.delete(`/tasks/${task._id}`);
      await load();
    } catch (err) {
      toast.show(err?.response?.data?.error?.message || "Failed to delete task", "error");
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
      await api.post("/tasks/reorder", { orderedIds: next.map((t) => t._id) });
    } catch {
      toast.show("Reorder failed", "error");
      await load();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="section-title">To‑Do List</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400">{total} tasks</div>
        </div>
        <div className="card flex flex-col gap-2 p-3 md:flex-row md:items-center">
          <input
            className="input md:w-56"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input md:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            className="input md:w-40"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold">Create task</div>
          <button
            className="btn-soft"
            onClick={async () => {
              const perm = await ensureNotificationPermission();
              if (perm === "granted") {
                setRemindersEnabled(true);
                toast.show("Reminders enabled (while tab is open)");
              } else if (perm === "unsupported") {
                toast.show("Notifications not supported in this browser", "error");
              } else {
                toast.show("Notification permission not granted", "error");
              }
            }}
          >
            Enable reminders
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <input
            className="input md:col-span-2"
            placeholder="New task title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input className="input" type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
          <select
            className="input"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div className="mt-3 flex justify-end">
          <button className="btn-primary" onClick={createTask}>
            Add task
          </button>
        </div>
        {remindersEnabled ? (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Reminders are best-effort and only fire while this tab is open.
          </div>
        ) : null}
      </div>

      {busy ? (
        <div className="card p-6">Loading…</div>
      ) : (
        <div className="card card-hover p-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((t) => t._id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No tasks.</div>
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

