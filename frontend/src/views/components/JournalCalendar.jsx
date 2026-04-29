import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

function yyyymm(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function daysInMonth(year, month1) {
  return new Date(year, month1, 0).getDate();
}

export function JournalCalendar({ onSelectDate }) {
  const [month, setMonth] = useState(yyyymm());
  const [dates, setDates] = useState(new Set());

  const { year, month1 } = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return { year: y, month1: m };
  }, [month]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await api.get("/journal/calendar", { params: { month } });
      const set = new Set(data.items.map((x) => x.date));
      if (mounted) setDates(set);
    }
    load().catch(() => {});
    return () => {
      mounted = false;
    };
  }, [month]);

  const totalDays = daysInMonth(year, month1);
  const firstDow = new Date(year, month1 - 1, 1).getDay(); // 0=Sun
  const blanks = Array.from({ length: firstDow });
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Calendar</div>
        <input className="input w-36" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 dark:text-slate-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {blanks.map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map((day) => {
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const has = dates.has(date);
          return (
            <button
              key={date}
              className={[
                "h-9 rounded-lg text-sm",
                has
                  ? "bg-purple-600 text-white hover:bg-purple-500"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              ].join(" ")}
              onClick={() => onSelectDate?.(date)}
              title={has ? "Has entry" : "No entry"}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

