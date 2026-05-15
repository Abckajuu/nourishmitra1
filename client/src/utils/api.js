import axios from "axios";

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

// ── User ──────────────────────────────────────────────────────────
export const getUser = () => api.get("/user").then((r) => r.data);

export const onboardUser = (data) =>
  api.post("/user/onboard", data).then((r) => r.data);

export const updateLanguage = (language) =>
  api.patch("/user/language", { language }).then((r) => r.data);

// ── Meals ─────────────────────────────────────────────────────────
export const getMeals = () => api.get("/meals").then((r) => r.data);

export const getMealsRange = (days = 7) =>
  api.get(`/meals/range?days=${days}`).then((r) => r.data);

export const getDaysCount = () =>
  api.get("/meals/days-count").then((r) => r.data);

export const logMeal = (raw_input, parsed_summary = null) =>
  api.post("/meals", { raw_input, parsed_summary }).then((r) => r.data);

export const updateMealSummary = (id, parsed_summary) =>
  api.patch(`/meals/${id}/summary`, { parsed_summary }).then((r) => r.data);

export const deleteMeal = (id) =>
  api.delete(`/meals/${id}`).then((r) => r.data);

// ── Patterns ──────────────────────────────────────────────────────
export const getLatestPattern = () =>
  api.get("/patterns/latest").then((r) => r.data);

export const savePattern = (data) =>
  api.post("/patterns", data).then((r) => r.data);

// ── Chat (AI) ─────────────────────────────────────────────────────
// YOU will implement /api/chat on the server.
// This is just the client-side call.
export const chat = (payload) =>
  api.post("/chat", payload).then((r) => r.data);

export const chatImage = (payload) =>
  api.post("/chat-image", payload).then((r) => r.data);

// payload shape:
// {
//   message: string,
//   context: "log" | "patterns" | "chat",
//   mealHistory: [],
//   userConditions: string,
//   userGoal: string,
//   language: "en" | "hi"
// }
