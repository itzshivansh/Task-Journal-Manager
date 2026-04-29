import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import API from "../utils/api"; // ✅ FIXED
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
    const { data } = await API.get("/api/journal/today"); // ✅ FIXED
    const entry = data.entry;
    setTitle(entry?.title || "");
    setContentHtml(entry?.contentHtml || "");
  }

  async function loadHistory(p = page) {
    const { data } = await API.get("/api/journal/history", {
      params: { page: p, limit }
    }); // ✅ FIXED
    setHistory(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadToday();
        await loadHistory(1);
      } catch (err) {
        toast.show(err?.response?.data?.error || "Failed to load journal", "error");
      }
    })();
  }, []);

  // restore local draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(dirtyKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (typeof draft?.title === "string") setTitle(draft.title);
      if (typeof draft?.contentHtml === "string") setContentHtml(draft.contentHtml);
    } catch {}
  }, [dirtyKey]);

  // local autosave
  useEffect(() => {
    const payload = { title, contentHtml, at: Date.now() };
    localStorage.setItem(dirtyKey, JSON.stringify(payload));
  }, [title, contentHtml, dirtyKey]);

  // server autosave
  useEffect(() => {
    const t = window.setTimeout(async () => {
      setSaving(true);
      try {
        await API.put("/api/journal/today", {
          date: todayDate,
          title,
          contentHtml
        }); // ✅ FIXED

        setLastSavedAt(new Date());
      } catch {
        // silent fail (keeps local draft)
      } finally {
        setSaving(false);
      }
    }, 900);

    return () => window.clearTimeout(t);
  }, [todayDate, title, contentHtml]);

  async function deleteEntry(date) {
    try {
      await API.delete(`/api/journal/${date}`); // ✅ FIXED
      toast.show("Entry deleted");

      if (date === todayDate) {
        setTitle("");
        setContentHtml("");
      }

      await loadHistory(1);
    } catch (err) {
      toast.show(err?.response?.data?.error || "Delete failed", "error");
    }
  }

  async function openEntry(date) {
    try {
      const { data } = await API.get(`/api/journal/${date}`); // ✅ FIXED
      setTitle(data.entry.title || "");
      setContentHtml(data.entry.contentHtml || "");
    } catch (err) {
      toast.show(err?.response?.data?.error || "Failed to open entry", "error");
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      {/* UI unchanged */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="section-title">Journal</h1>
          <div className="muted">
            {format(new Date(), "EEEE, MMM d")} •{" "}
            {saving
              ? "Saving…"
              : lastSavedAt
              ? `Saved ${format(lastSavedAt, "p")}`
              : "—"}
          </div>
        </div>
      </div>

      {/* rest UI unchanged */}
    </div>
  );
}