const express = require("express");
const router = express.Router();
const {
  CreateClient,
  getClient,
  getClientById,
  updateClient,
  deleteClient,
} = require("../Controller/client.controller");

const { protect } = require("../Middleware/auth.middleware");

router.post("/create-client", protect, CreateClient);
router.get("/get-all-client", protect, getClient);
router.get("/get-client/:id", protect, getClientById);
router.put("/update-client/:id", protect, updateClient);
router.delete("/delete-client/:id", protect, deleteClient);

module.exports = router;
