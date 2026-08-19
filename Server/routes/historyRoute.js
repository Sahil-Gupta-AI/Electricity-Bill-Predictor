const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Bill = require("../models/Bill");
const { memoryBills } = require("./extractRoute");

// GET /api/history/bills - Fetch all extracted bills for the authenticated user
router.get("/bills", auth, async (req, res) => {
  try {
    let bills = [];
    try {
      bills = await Bill.find({ user: req.user.id }).sort({ createdAt: -1 });
    } catch (dbErr) {
      console.warn("MongoDB unavailable for bill history, using in-memory:", dbErr.message);
    }

    if (!bills || bills.length === 0) {
      bills = memoryBills.filter((b) => b.user === req.user.id);
    }

    return res.json(bills || []);
  } catch (error) {
    console.warn("Error fetching bill history:", error.message);
    return res.json([]);
  }
});

// DELETE /api/history/bills - Clear all extracted bills for the authenticated user
router.delete("/bills", auth, async (req, res) => {
  try {
    try {
      await Bill.deleteMany({ user: req.user.id });
    } catch (dbErr) {
      console.warn("MongoDB unavailable for clearing bill history:", dbErr.message);
    }

    for (let i = memoryBills.length - 1; i >= 0; i--) {
      if (memoryBills[i].user === req.user.id) {
        memoryBills.splice(i, 1);
      }
    }

    return res.json({ message: "Bill history cleared successfully" });
  } catch (error) {
    console.warn("Error clearing bill history:", error.message);
    return res.json({ message: "Bill history cleared" });
  }
});

module.exports = router;
