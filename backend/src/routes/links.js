const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { generateLink, listLinks, Link } = require("../models/links");
router.get("/links", requireAuth, async (req, res, next) => {
  try {
    const items = await listLinks({ userId: req.user.id });
    res.json({ success: true, data: items });
  } catch (e) {
    next(e);
  }
});
router.delete("/links/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await Link.deleteOne({ _id: id, user_id: req.user.id });
    res.json({ success: true, data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post("/links/generate", requireAuth, async (req, res, next) => {
  try {
    const created = await generateLink({ userId: req.user.id });
    res.json({ success: true, data: created });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
