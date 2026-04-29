import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function main() {
  try {
    await connectDb();

    const app = createApp();

    // ✅ Render-safe port handling
    const PORT = process.env.PORT || env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Task & Journal Manager API listening on :${PORT}`);
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

main();