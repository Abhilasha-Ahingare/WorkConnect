const Client = require("../Model/client.model");
const Task = require("../Model/reminder.model");

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get all necessary data in parallel
    const [clients, tasks] = await Promise.all([
      Client.find().sort({ createdAt: -1 }).lean(),
      Task.find().lean(),
    ]);

    if (!Array.isArray(clients) || !Array.isArray(tasks)) {
      throw new Error("Invalid data format received from database");
    }

    // Calculate stats
    const stats = {
      totalClients: clients.length || 0,
      totalTasks: tasks.length || 0,
      completedTasks: tasks.filter((task) => task?.isCompleted).length || 0,
      pendingTasks: tasks.filter((task) => !task?.isCompleted).length || 0,
      recentClients: (clients || []).slice(0, 5), // Get 5 most recent clients
      upcomingTasks: (tasks || [])
        .filter((task) => !task?.isCompleted && task?.reminderDate)
        .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
        .slice(0, 5), // Get 5 nearest upcoming tasks
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
