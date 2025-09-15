const express = require("express");
const router = express.Router();
const {
  createTask,
  markAsRead,
  getUpcoming,
  getTasks,
} = require("../Controller/reminder.controller");

const { protect } = require("../Middleware/auth.middleware");

router.post("/create-task", protect, createTask);
router.patch("/:id/read", protect, markAsRead);
router.get("/upcoming", protect, getUpcoming);
router.get("/get-all-task", protect, getTasks);

module.exports = router;
