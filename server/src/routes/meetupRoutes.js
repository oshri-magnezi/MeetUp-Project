import express from "express";
import {
  getMeetups,
  createMeetup,
  deleteMeetup,
  joinMeetup,
} from "../controllers/meetupController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getMeetups);                   // ציבורי
router.post("/", protect, createMeetup);       // מוגן
router.delete("/:id", protect, deleteMeetup);  // מוגן
router.post("/:id/join", protect, joinMeetup); // מוגן

export default router;