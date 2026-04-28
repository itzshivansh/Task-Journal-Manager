import { Task } from "../models/Task.js";
import { JournalEntry } from "../models/JournalEntry.js";
import { toYmd } from "../utils/date.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayYmd = toYmd(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [pendingTasks, completedTasks, todayEntry, completedTodayCount, journalDates] = await Promise.all([
      Task.countDocuments({ userId, status: "Pending" }),
      Task.countDocuments({ userId, status: "Completed" }),
      JournalEntry.findOne({ userId, date: todayYmd }),
      Task.countDocuments({ userId, status: "Completed", completedAt: { $gte: todayStart, $lte: todayEnd } }),
      JournalEntry.find({ userId }).select("date").sort({ date: -1 }).limit(400)
    ]);

    // streak: consecutive days ending today if today exists, else ending yesterday if yesterday exists
    const set = new Set(journalDates.map((x) => x.date));
    let streak = 0;
    const base = new Date(now);
    // if no entry today, start from yesterday
    if (!set.has(todayYmd)) base.setDate(base.getDate() - 1);
    while (streak < 366) {
      const ymd = toYmd(base);
      if (!set.has(ymd)) break;
      streak += 1;
      base.setDate(base.getDate() - 1);
    }

    return res.json({
      tasks: { pending: pendingTasks, completed: completedTasks, completedToday: completedTodayCount },
      journal: { today: todayEntry || null, streak }
    });
  } catch (err) {
    return next(err);
  }
}

