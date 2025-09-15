const Client = require("../Model/client.model");
const Task = require("../Model/reminder.model");

// create client

const CreateClient = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    // Capitalize first letter of status if provided, otherwise use default 'Lead'
    const formattedStatus = status
      ? status === "in progress"
        ? "In Progress"
        : status.charAt(0).toUpperCase() + status.slice(1)
      : "Lead";

    const client = await Client.create({
      name,
      email,
      phone,
      status: formattedStatus,
    });

    res.status(201).json({ message: "Client created successfully", client });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create client",
      error: error.message || "Validation error",
    });
  }
};

// get clients (search + filter + recent )

const getClient = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (status) filter.status = status;
    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Clients retrieved successfully", clients });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving clients", error: error.message });
  }
};

// Get single client + recent related tasks

const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const tasks = await Task.find({ assignedClients: client._id }).sort({
      reminderDate: -1,
    });
    res.status(200).json({ message: "get client by id", client, tasks });
  } catch (error) {
    res.status(404).json({ message: "something is wrong clients", error });
  }
};

const updateClient = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client updated successfully", client });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating client", error: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting client", error: error.message });
  }
};

module.exports = {
  CreateClient,
  getClient,
  getClientById,
  updateClient,
  deleteClient,
};
