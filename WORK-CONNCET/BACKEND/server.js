const http = require("http");
const { Server: IOServer } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./Database/db.js");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const clientRoutes = require("./Router/client.routes.js");
const taskRoutes = require("./Router/reminder.route.js");
const userRoutes = require("./Router/user.route.js");

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

app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/task", taskRoutes);

// basic health
app.get("/", (req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

// map userId -> socketId (string keys)
const onlineUsers = new Map();
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  // client should emit 'register' after login with userId
  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers.set(String(userId), socket.id);
      console.log("user online:", userId, socket.id);
    }
  });

  socket.on("disconnect", () => {
    // remove socket from map
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) onlineUsers.delete(uid);
    }
    console.log("socket disconnected", socket.id);
  });
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
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
