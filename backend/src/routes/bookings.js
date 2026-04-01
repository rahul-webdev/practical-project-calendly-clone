const express = require("express");
const router = express.Router();
const { createBooking, Booking } = require("../models/bookings");
const { Link } = require("../models/links");
const { Availability } = require("../models/availability");

router.get("/bookings/available/:linkId", async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const { date } = req.query; // Expecting YYYY-MM-DD
    const link = await Link.findOne({ link_id: linkId });
    if (!link) throw Object.assign(new Error("Invalid link"), { status: 404 });

    // 1. Get user's availability for that date
    const availabilities = await Availability.find({ user_id: link.user_id, date });
    
    // 2. Get existing bookings for that date on this specific link
    const bookings = await Booking.find({ link_id: linkId, date });
    const bookedTimes = bookings.map(b => b.time);

    // 3. Generate time slots based on availability and exclude booked ones
    const availableSlots = [];
    for (const avail of availabilities) {
      let current = avail.start_time;
      while (current < avail.end_time) {
        if (!bookedTimes.includes(current)) {
          availableSlots.push(current);
        }
        // Increment by 30 mins (hardcoded for now, could be dynamic)
        const [h, m] = current.split(":").map(Number);
        const nextM = (m + 30) % 60;
        const nextH = h + Math.floor((m + 30) / 60);
        current = `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
      }
    }

    res.json({ success: true, data: availableSlots });
  } catch (e) {
    next(e);
  }
});

router.post("/bookings", async (req, res, next) => {
  try {
    const { linkId, date, time, name, email } = req.body;
    const created = await createBooking({ linkId, date, time, name, email });
    res.json({ success: true, data: created });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
