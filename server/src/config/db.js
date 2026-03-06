import mongoose from "mongoose";

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required.");
  }

  await mongoose.connect(mongoUri);
}
