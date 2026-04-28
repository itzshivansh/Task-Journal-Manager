import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";

function pill(priority) {
  if (priority === "High") return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200";
  if (priority === "Low") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
  return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200";
}

export function SortableTaskRow({ task, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "flex items-start gap-3 p-3",
        isDragging ? "bg-slate-50 dark:bg-slate-950" : ""
      ].join(" ")}
    >
      <button
        className={[
          "mt-1 h-5 w-5 rounded border",
          task.status === "Completed"
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 dark:border-slate-700"
        ].join(" ")}
        onClick={onToggle}
        aria-label="Toggle completed"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className={["font-medium", task.status === "Completed" ? "line-through opacity-70" : ""].join(" ")}>
            {task.title}
          </div>
          <span className={["rounded-full px-2 py-0.5 text-xs font-semibold", pill(task.priority)].join(" ")}>
            {task.priority}
          </span>
          {task.dueDate ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Due {format(new Date(task.dueDate), "MMM d")}
            </span>
          ) : null}
        </div>
        {task.description ? (
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{task.description}</div>
        ) : null}
      </div>

      <div className="flex gap-1">
        <button className="btn-ghost" onClick={onDelete}>
          Delete
        </button>
        <button
          className="btn-ghost cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          Drag
        </button>
      </div>
    </div>
  );
}

