import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", async (_, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
  return res.json({ users });
});

router.get("/stats", async (_, res) => {
  const totalUsers = await User.countDocuments({});
  const adminUsers = await User.countDocuments({ role: "admin" });
  const regularUsers = await User.countDocuments({ role: "user" });

  return res.json({
    totalUsers,
    adminUsers,
    regularUsers,
  });
});

export default router;
