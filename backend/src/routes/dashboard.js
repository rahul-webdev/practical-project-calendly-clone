const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { Meeting } = require("../models/meetings");
const { Booking } = require("../models/bookings");
const { Link } = require("../models/links");

router.get("/dashboard/stats", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const upcomingCount = await Meeting.countDocuments({ user_id: userId, status: "upcoming" });
    const bookingCount = await Booking.countDocuments({ user_id: userId });
    const linkCount = await Link.countDocuments({ user_id: userId });
    const upcomingMeetings = await Meeting.find({ user_id: userId, status: "upcoming" })
      .sort({ date: 1, time: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        upcomingMeetings: upcomingCount,
        totalBookings: bookingCount,
        hoursScheduled: "0h",
        activeLinks: linkCount,
        upcomingList: upcomingMeetings,
      },
    });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
