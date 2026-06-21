import apiClient from "./client";

/* ─────────────────────────────────────────────
   index.js — כל נקודות הקצה (Endpoints) במקום אחד.
   כל קומפוננטה מייבאת מכאן ולא קוראת ל-axios ישירות.
───────────────────────────────────────────── */

/* ── Auth ──
   הבקאנד מצופה להחזיר { user, token } בהתחברות/הרשמה.
   המודל User בצד השרת אמור להחזיק שדה name (ולא fullName). */
export const registerRequest = (payload) =>
  apiClient.post("/auth/register", payload).then((res) => res.data);

export const loginRequest = (credentials) =>
  apiClient.post("/auth/login", credentials).then((res) => res.data);

/* ── Meetups ── */
export const getMeetups = () =>
  apiClient.get("/meetups").then((res) => res.data);

export const createMeetupRequest = (payload) =>
  apiClient.post("/meetups", payload).then((res) => res.data);

export const deleteMeetupRequest = (id) =>
  apiClient.delete(`/meetups/${id}`).then((res) => res.data);

// דורש נקודת קצה POST /api/meetups/:id/join בצד השרת
export const joinMeetupRequest = (id) =>
  apiClient.post(`/meetups/${id}/join`).then((res) => res.data);