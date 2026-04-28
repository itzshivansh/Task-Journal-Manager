import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (local date from client)
    title: { type: String, default: "" },
    contentHtml: { type: String, default: "" }
  },
  { timestamps: true }
);

journalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);

