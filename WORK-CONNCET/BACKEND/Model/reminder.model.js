const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
    reminderDate: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    isNotified: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
