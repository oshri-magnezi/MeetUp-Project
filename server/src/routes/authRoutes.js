import express from "express";
import { register, login, logout, refresh, getUsers, deleteUser } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { registerRules, loginRules } from "../validators/authValidators.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", validate(registerRules), register);
router.post("/login", validate(loginRules), login);
router.post("/refresh", refresh);
router.post("/logout", protect, logout);

// נתיבי אדמין בלבד — הרשאה לפי תפקיד (Role-based Authorization)
router.get("/users", protect, restrictTo("admin"), getUsers);
router.delete("/users/:id", protect, restrictTo("admin"), deleteUser);

export default router;
