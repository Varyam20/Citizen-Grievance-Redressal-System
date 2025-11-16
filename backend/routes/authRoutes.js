import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Email validation helper
const isValidEmail = (email) => {
  const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com', 'protonmail.com', 'cgrs.in'];
  const domain = email.split('@')[1];
  return validDomains.includes(domain?.toLowerCase());
};

// Citizen Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please use a valid email domain (gmail.com, yahoo.com, outlook.com, hotmail.com, aol.com, mail.com, or protonmail.com)" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "citizen" });
    res.status(201).json({ message: "Citizen account created" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
});

// Common Login (both roles)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please use a valid email domain (gmail.com, yahoo.com, outlook.com, hotmail.com, aol.com, mail.com, or protonmail.com)" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Incorrect password" });
  const token = jwt.sign({ id: user._id, role: user.role, department: user.department }, process.env.JWT_SECRET);
  res.json({ token, role: user.role, name: user.name, department: user.department, id: user._id });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

export default router;
