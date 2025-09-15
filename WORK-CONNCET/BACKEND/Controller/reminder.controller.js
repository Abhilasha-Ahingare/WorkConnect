const Task = require("../Model/reminder.model");
const Client = require("../Model/client.model");
const dayjs = require("dayjs");

// Create a task/reminder
const createTask = async (req, res) => {
  try {
    const { title, description, assignedClients, reminderDate } = req.body;
    // Find clients by their email addresses
    const clients = await Client.find({ email: { $in: assignedClients } });

    if (clients.length !== assignedClients.length)
      return res
        .status(400)
        .json({ message: "One or more client emails are invalid" });

    // Extract client IDs from the found clients
    const clientIds = clients.map((client) => client._id);

    const task = await Task.create({
      title,
      description,
      assignedClients: clientIds, // Use the extracted client IDs
      reminderDate: new Date(reminderDate),
      isNotified: false,
      isRead: false,
    });
    res.status(201).json({ message: "task created sucessfully", task });
  } catch (error) {
    res.status(404).json({ message: " not created task", error });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  task.isRead = true;
  await task.save();
  res.status(201).json(task);
};

// Get upcoming reminders grouped by today/tomorrow
const getUpcoming = async (req, res) => {
  const now = dayjs();
  const startToday = now.startOf("day").toDate();
  const endToday = now.endOf("day").toDate();
  const startTomorrow = now.add(1, "day").startOf("day").toDate();
  const endTomorrow = now.add(1, "day").endOf("day").toDate();

  const today = await Task.find({
    reminderDate: { $gte: startToday, $lte: endToday },
  })
    .populate("assignedClients")
    .sort({ reminderDate: 1 });
  const tomorrow = await Task.find({
    reminderDate: { $gte: startTomorrow, $lte: endTomorrow },
  })
    .populate("assignedClients")
    .sort({ reminderDate: 1 });

  // also return others (upcoming after tomorrow) if needed
  res.json({ today, tomorrow });
};

// Get all tasks (optional)
const getTasks = async (req, res) => {
  const tasks = await Task.find()
    .populate("assignedClients")
    .sort({ reminderDate: 1 });
  res.json(tasks);
};

module.exports = { createTask, markAsRead, getUpcoming, getTasks };
