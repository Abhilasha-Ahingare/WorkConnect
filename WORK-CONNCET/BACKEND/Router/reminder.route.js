const express = require("express");
const router = express.Router();
const {
  createTask,
  markAsRead,
  getUpcoming,
  getTasks,
  updateTask,
  deleteTask,
} = require("../Controller/reminder.controller");

const { protect } = require("../Middleware/auth.middleware");

router.post("/create-task", protect, createTask);
router.patch("/:id/read", protect, markAsRead);
router.get("/upcoming", protect, getUpcoming);
router.get("/get-all-task", protect, getTasks);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
