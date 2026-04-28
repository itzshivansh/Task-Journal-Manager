export async function ensureNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function scheduleTaskReminder(task) {
  if (!("Notification" in window)) return null;
  if (Notification.permission !== "granted") return null;
  if (!task?.dueDate) return null;

  const due = new Date(task.dueDate).getTime();
  const now = Date.now();
  const ms = due - now;
  if (ms <= 0) return null;

  // Best-effort: browsers may throttle timers; this is only while the tab is open.
  const id = window.setTimeout(() => {
    try {
      // eslint-disable-next-line no-new
      new Notification("Task due", {
        body: task.title,
        tag: `task_due_${task._id}`
      });
    } catch {
      // ignore
    }
  }, Math.min(ms, 2 ** 31 - 1));

  return id;
}

