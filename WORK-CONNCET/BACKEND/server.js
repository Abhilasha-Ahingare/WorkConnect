const http = require("http");
const { Server: IOServer } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./Database/db.js");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const Task = require("./Model/reminder.model");

const clientRoutes = require("./Router/client.routes.js");
const taskRoutes = require("./Router/reminder.route.js");
const userRoutes = require("./Router/user.route.js");
const dashboardRoutes = require("./Router/dashboard.route.js");

const app = express();

// Load environment variables
dotenv.config();

// Configure CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/", (req, res) => res.json({ ok: true }));

// HTTP + Socket.IO server
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// map of userId/clientId -> socketId
const onlineUsers = new Map();
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Client or user should emit 'register' with their ID after login
  socket.on("register", (entityId) => {
    if (entityId) {
      onlineUsers.set(String(entityId), socket.id);
      console.log("📌 Registered online:", entityId, socket.id);
    }
  });

  socket.on("disconnect", () => {
    // remove disconnected socket
    for (const [id, sid] of onlineUsers.entries()) {
      if (sid === socket.id) onlineUsers.delete(id);
    }
    console.log("❌ Socket disconnected:", socket.id);
  });
});


// 🔔 CRON JOB → check every second for upcoming reminders
cron.schedule("* * * * * *", async () => {
  const now = new Date();
  const in5s = new Date(now.getTime() + 5000);

  try {
    const tasks = await Task.find({
      reminderDate: { $gte: now, $lte: in5s },
      isCompleted: false,
      isNotified: false,
    })
      .populate("createdBy")
      .populate("assignedClients");

    if (tasks.length > 0) {
      console.log(`⏰ Found ${tasks.length} task(s) due soon`);
    }

    tasks.forEach(async (task) => {
      const onlineUsers = app.get("onlineUsers");
      const io = app.get("io");

      // Send reminder to creator/admin
      if (task.createdBy?._id) {
        const creatorId = String(task.createdBy._id);
        const socketId = onlineUsers.get(creatorId);
        if (socketId) {
          io.to(socketId).emit("new-reminder", task);
          console.log(`🔔 Reminder sent to creator ${creatorId} for task "${task.title}"`);
        }
      }

      // Send reminder to all assigned clients
      task.assignedClients.forEach((client) => {
        const clientId = String(client._id);
        const socketId = onlineUsers.get(clientId);
        if (socketId) {
          io.to(socketId).emit("new-reminder", task);
          console.log(`📩 Reminder sent to client ${clientId} for task "${task.title}"`);
        }
      });

      // Mark task as notified
      task.isNotified = true;
      await task.save();
    });
  } catch (err) {
    console.error("❌ Cron reminder check failed:", err);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    console.log("📦 Database connected successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
