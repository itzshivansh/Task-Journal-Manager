import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { api } from "../lib/api";
import { useToast } from "../ui/Toast.jsx";
import { format } from "date-fns";
import { JournalCalendar } from "./components/JournalCalendar.jsx";

function ymdLocal(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function JournalPage() {
  const toast = useToast();
  const [todayDate] = useState(ymdLocal());
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const dirtyKey = useMemo(() => `tjm_journal_draft_${todayDate}`, [todayDate]);

  async function loadToday() {
    const { data } = await api.get("/journal/today");
    const entry = data.entry;
    setTitle(entry?.title || "");
    setContentHtml(entry?.contentHtml || "");
  }

  async function loadHistory(p = page) {
    const { data } = await api.get("/journal/history", { params: { page: p, limit } });
    setHistory(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadToday();
        await loadHistory(1);
      } catch (err) {
        toast.show(err?.response?.data?.error?.message || "Failed to load journal", "error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restore local draft if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(dirtyKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (typeof draft?.title === "string") setTitle(draft.title);
      if (typeof draft?.contentHtml === "string") setContentHtml(draft.contentHtml);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyKey]);

  // autosave draft locally while typing
  useEffect(() => {
    const payload = { title, contentHtml, at: Date.now() };
    localStorage.setItem(dirtyKey, JSON.stringify(payload));
  }, [title, contentHtml, dirtyKey]);

  // autosave to server with debounce
  useEffect(() => {
    const t = window.setTimeout(async () => {
      setSaving(true);
      try {
        await api.put("/journal/today", { date: todayDate, title, contentHtml });
        setLastSavedAt(new Date());
      } catch {
        // best effort; keep draft locally
      } finally {
        setSaving(false);
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [todayDate, title, contentHtml]);

  async function deleteEntry(date) {
    try {
      await api.delete(`/journal/${date}`);
      toast.show("Entry deleted");
      if (date === todayDate) {
        setTitle("");
        setContentHtml("");
      }
      await loadHistory(1);
    } catch (err) {
      toast.show(err?.response?.data?.error?.message || "Delete failed", "error");
    }
  }

  async function openEntry(date) {
    try {
      const { data } = await api.get(`/journal/${date}`);
      setTitle(data.entry.title || "");
      setContentHtml(data.entry.contentHtml || "");
    } catch (err) {
      toast.show(err?.response?.data?.error?.message || "Failed to open entry", "error");
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journal</h1>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {format(new Date(), "EEEE, MMM d")} • {saving ? "Saving…" : lastSavedAt ? `Saved ${format(lastSavedAt, "p")}` : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Title (optional)
            </label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Date
            </label>
            <div className="input flex items-center">{todayDate}</div>
          </div>
        </div>

        <div className="mt-3">
          <ReactQuill theme="snow" value={contentHtml} onChange={setContentHtml} />
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Autosaves locally while typing, and syncs to the server every ~1s.
        </div>
      </div>

        <div className="md:col-span-1">
          <JournalCalendar onSelectDate={(date) => openEntry(date)} />
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">History</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Page {page} of {pageCount}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              disabled={page <= 1}
              onClick={async () => {
                const next = Math.max(1, page - 1);
                setPage(next);
                await loadHistory(next);
              }}
            >
              Prev
            </button>
            <button
              className="btn-ghost"
              disabled={page >= pageCount}
              onClick={async () => {
                const next = Math.min(pageCount, page + 1);
                setPage(next);
                await loadHistory(next);
              }}
            >
              Next
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {history.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No entries yet.</div>
          ) : (
            history.map((e) => (
              <div key={e._id} className="flex items-center justify-between gap-3 p-3">
                <button className="text-left" onClick={() => openEntry(e.date)}>
                  <div className="text-sm font-medium">{e.title || "Untitled"}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{e.date}</div>
                </button>
                <button className="btn-ghost" onClick={() => deleteEntry(e.date)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

