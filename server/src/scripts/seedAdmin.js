import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

async function seedAdmin() {
  await connectToDatabase(process.env.MONGODB_URI);

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const name = (process.env.ADMIN_NAME || "Admin").trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.name = name;
    if (password.length >= 8) {
      existing.passwordHash = await bcrypt.hash(password, 12);
    }
    await existing.save();
    // eslint-disable-next-line no-console
    console.log(`Updated existing user to admin: ${email}`);
    process.exit(0);
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  // eslint-disable-next-line no-console
  console.log(`Admin created: ${email}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Admin seed failed:", error.message);
  process.exit(1);
});
