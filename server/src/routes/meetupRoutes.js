import express from "express";
import {
  getMeetups,
  createMeetup,
  updateMeetup,
  deleteMeetup,
  joinMeetup,
  leaveMeetup,
} from "../controllers/meetupController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createMeetupRules,
  updateMeetupRules,
} from "../validators/meetupValidators.js";

const router = express.Router();

router.get("/", getMeetups);                                             // ציבורי
router.post("/", protect, validate(createMeetupRules), createMeetup);    // מוגן
router.put("/:id", protect, validate(updateMeetupRules), updateMeetup);  // מוגן (בעלים בלבד)
router.delete("/:id", protect, deleteMeetup);                            // מוגן
router.post("/:id/join", protect, joinMeetup);                           // מוגן — הצטרפות
router.delete("/:id/join", protect, leaveMeetup);                        // מוגן — ביטול רישום

export default router;