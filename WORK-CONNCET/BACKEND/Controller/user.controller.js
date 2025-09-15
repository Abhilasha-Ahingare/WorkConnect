const User = require("../Model/User.model");
const jwt = require("jsonwebtoken");

// 🔹 Registration
const Registration = async (req, res) => {
  try {
    const { Username, Email, Password, role } = req.body;

    // check if user exists
    const userExists = await User.findOne({ Email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    const newUser = await User.create({
      Username,
      Email,
      Password,
      role,
    });

    if (!newUser) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    // create token
    const payload = { id: newUser._id, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        Username: newUser.Username,
        Email: newUser.Email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message || "Internal server error during registration",
    });
  }
};

// 🔹 Login
const login = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const userExists = await User.findOne({ Email });
    if (!userExists) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await userExists.matchPassword(Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("Entered password:", Password);
    console.log("Hashed password in DB:", userExists.Password);
    // create token
    const payload = { id: userExists._id, role: userExists.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      user: {
        _id: userExists._id,
        Username: userExists.Username,
        Email: userExists.Email,
        role: userExists.role,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Internal server error during login" });
  }
};

// 🔹 Get all users
const GetAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-Password");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }

    res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { Registration, login, GetAllUser, deleteUser };
