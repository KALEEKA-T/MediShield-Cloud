const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/medishield")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// User Schema
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
});

// =======================
// REGISTER API
// =======================
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("User already exists");
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    console.log("User saved to DB");
    res.send("User registered successfully");

  } catch (error) {
    console.log(error);
    res.send("Error registering user");
  }
});

// =======================
// LOGIN API
// =======================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.send("User not found");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send("Invalid password");
    }

    // Generate token
    const token = jwt.sign({ email: user.email }, "secretkey", {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token: token,
    });

  } catch (error) {
    console.log(error);
    res.send("Error logging in");
  }
});

// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// =======================
// START SERVER
// =======================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});