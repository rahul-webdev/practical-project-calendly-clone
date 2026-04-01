const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { createAvailability, deleteAvailability, listAvailability } = require("../models/availability");
router.get("/availability", requireAuth, async (req, res, next) => {
  try {
    const items = await listAvailability({ userId: req.user.id });
    res.json({ success: true, data: items });
  } catch (e) {
    next(e);
  }
});
router.post("/availability", requireAuth, async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;
    const created = await createAvailability({ userId: req.user.id, date, startTime, endTime });
    res.json({ success: true, data: created });
  } catch (e) {
    next(e);
  }
});
router.delete("/availability/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteAvailability({ userId: req.user.id, id });
    res.json({ success: true, data: deleted });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
