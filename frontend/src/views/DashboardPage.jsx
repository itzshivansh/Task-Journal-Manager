import { useEffect, useState } from "react";
import API from "../utils/api"; // ✅ FIXED
import { Link } from "react-router-dom";
import { format } from "date-fns";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setBusy(true);
      try {
        const res = await API.get("/api/dashboard"); // ✅ FIXED
        if (mounted) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setBusy(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="muted">{format(new Date(), "EEEE, MMM d")}</div>
          <h1 className="section-title">Dashboard</h1>
        </div>

        <div className="flex gap-2">
          <Link className="btn-soft" to="/tasks">
            View tasks
          </Link>
          <Link className="btn-primary" to="/journal">
            Write journal
          </Link>
        </div>
      </div>

      {busy ? (
        <div className="card p-6">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card card-hover p-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending tasks
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {data?.tasks?.pending ?? 0}
            </div>
          </div>

          <div className="card card-hover p-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Completed tasks
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {data?.tasks?.completed ?? 0}
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Completed today: {data?.tasks?.completedToday ?? 0}
            </div>
          </div>

          <div className="card card-hover p-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Journal streak
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {data?.journal?.streak ?? 0}
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Today’s entry: {data?.journal?.today ? "✅" : "—"}
            </div>
          </div>

          <div className="card card-hover p-5 md:col-span-3">
            <div className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Today’s journal entry
            </div>

            {data?.journal?.today ? (
              <div>
                <div className="text-lg font-semibold">
                  {data.journal.today.title || "Untitled"}
                </div>

                <div className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        data.journal.today.contentHtml || "<em>(empty)</em>"
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                No entry yet. Head to{" "}
                <Link
                  className="text-purple-700 hover:underline dark:text-purple-300"
                  to="/journal"
                >
                  Journal
                </Link>{" "}
                to write one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}