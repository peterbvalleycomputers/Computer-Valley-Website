import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";
import { createApp } from "./app.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

async function bootstrap() {
  await connectToDatabase(process.env.MONGODB_URI);
  const app = createApp();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
