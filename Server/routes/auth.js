const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "ElectricityAnalyser";

// In-memory fallback user store when MongoDB is unavailable
const memoryUsers = [];

router.post("/register", async (req, res) => {
  try {
    const { fname, lname, email, password } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ fname, lname, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

      console.log(`New user registered (MongoDB): ${email}`);
      return res.json({ message: "Registration successful!", token });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using in-memory registration fallback:", dbErr.message);
      const existingMem = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingMem) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const memUser = {
        _id: "mem_" + Date.now(),
        fname,
        lname,
        email,
        password: hashedPassword
      };
      memoryUsers.push(memUser);
      const token = jwt.sign({ id: memUser._id, email: memUser.email }, JWT_SECRET, { expiresIn: "30d" });
      console.log(`New user registered (In-Memory): ${email}`);
      return res.json({ message: "Registration successful!", token });
    }

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

        console.log(`User logged in (MongoDB): ${email}`);
        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                name: user.fname + " " + user.lname,
                initials: user.fname.charAt(0).toUpperCase() + user.lname.charAt(0).toUpperCase()
            }
        });
      }
    } catch (dbErr) {
      console.warn("MongoDB unavailable, checking in-memory user store:", dbErr.message);
    }

    const memUser = memoryUsers.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
    if (!memUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatchMem = await bcrypt.compare(password, memUser.password);
    if (!isMatchMem) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: memUser._id, email: memUser.email }, JWT_SECRET, { expiresIn: "30d" });

    console.log(`User logged in (In-Memory): ${email}`);
    return res.status(200).json({
        message: "Login successful!",
        token,
        user: {
            name: memUser.fname + " " + memUser.lname,
            initials: memUser.fname.charAt(0).toUpperCase() + memUser.lname.charAt(0).toUpperCase()
        }
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
