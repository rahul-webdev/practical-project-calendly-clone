const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { listMeetings, deleteMeeting } = require("../models/meetings");
router.get("/meetings", requireAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, status, q } = req.query;
    const data = await listMeetings({
      userId: req.user.id,
      page: Number(page),
      pageSize: Number(pageSize),
      status,
      q,
    });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.delete("/meetings/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await deleteMeeting({ userId: req.user.id, id });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
