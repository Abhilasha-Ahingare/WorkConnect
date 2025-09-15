require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./Database/db");
const User = require("./Model/User.model");
const Client = require("./Model/client.model");
const Task = require("./Model/reminder.model");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    await connectDB();

    // cleanup
    await User.deleteMany({});
    await Client.deleteMany({});
    await Task.deleteMany({});

    // create user
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("password123", salt);
    const user = await User.create({
      Username: "Rinky Tester",
      Email: "rinky@example.com",
      Password: hashed,
      role: "admin",
    });

    // clients
    const c1 = await Client.create({
      name: "Ashutosh",
      email: "ashu@mail.com",
      phone: "9876543210",
      status: "Lead",
    });
    const c2 = await Client.create({
      name: "Priya",
      email: "priya@mail.com",
      phone: "9876501234",
      status: "In Progress",
    });

    // tasks: one today at +7 minutes, one tomorrow at same time
    const now = new Date();
    const plus7 = new Date(now.getTime() + 7 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const t1 = await Task.create({
      title: "Meeting: Ashutosh",
      description: "Discuss property A",
      assignedClients: [c1._id],
      reminderDate: plus7,
      isNotified: false,
      isRead: false,
    });
    const t2 = await Task.create({
      title: "Followup: Priya",
      description: "Paperwork",
      assignedClients: [c2._id],
      reminderDate: tomorrow,
      isNotified: false,
      isRead: false,
    });

    console.log("Seed done. test user => rinky@example.com / password123");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
