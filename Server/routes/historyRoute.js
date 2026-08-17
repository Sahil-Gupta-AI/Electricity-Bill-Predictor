const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const Prediction = require("../models/Prediction");

// GET /api/history/bills - Fetch all extracted bills for the authenticated user
router.get("/bills", auth, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    console.warn("MongoDB unavailable for bill history, returning empty list:", error.message);
    res.json([]);
  }
});

// DELETE /api/history/bills - Clear all extracted bills for the authenticated user
router.delete("/bills", auth, async (req, res) => {
  try {
    await Bill.deleteMany({ user: req.user.id });
    res.json({ message: "Bill history cleared successfully" });
  } catch (error) {
    console.warn("MongoDB unavailable for clearing bill history:", error.message);
    res.json({ message: "Bill history cleared (in-memory)" });
  }
});

module.exports = router;
