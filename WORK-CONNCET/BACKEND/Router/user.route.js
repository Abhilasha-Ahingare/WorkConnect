const express = require("express");

const router = express.Router();

const {
  Registration,
  login,
 GetAllUser,
 deleteUser,
} = require("../Controller/user.controller");
// const {
//   registerSchema,
//   loginSchema,
// } = require("../Validations/user.validation");
// const { zodValidate } = require("../Middleware/validate.middleware");
const { protect } = require("../Middleware/auth.middleware");

router.post("/registration", Registration);
router.post("/login", login);

router.get("/get-all-user", protect, GetAllUser);

router.delete("/delete-user/:id", protect, deleteUser);

module.exports = router;
