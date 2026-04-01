const mongoose = require("mongoose");
const { Link } = require("./links");
const { Meeting } = require("./meetings");
const { Availability } = require("./availability");

const bookingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    link_id: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:mm
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

async function createBooking({ linkId, date, time, name, email }) {
  const link = await Link.findOne({ link_id: linkId });
  if (!link) throw Object.assign(new Error("Invalid link"), { status: 400 });

  // Check if the time slot is within user's availability
  const availability = await Availability.findOne({
    user_id: link.user_id,
    date,
    start_time: { $lte: time },
    end_time: { $gt: time },
  });

  if (!availability) {
    throw Object.assign(new Error("This time slot is not available for booking"), { status: 400 });
  }

  // Check if this person (email) already booked for this specific link
  const emailAlreadyBooked = await Booking.findOne({
    link_id: linkId,
    email,
  });

  if (emailAlreadyBooked) {
    throw Object.assign(new Error("You have already booked a meeting using this link."), { status: 400 });
  }

  const existingBooking = await Booking.findOne({
    user_id: link.user_id,
    date,
    time,
  });

  if (existingBooking) {
    throw Object.assign(new Error("This time slot is already booked"), { status: 400 });
  }

  const booking = new Booking({
    user_id: link.user_id,
    link_id: linkId,
    date,
    time,
    name,
    email,
  });

  const saved = await booking.save();

  // Create a meeting record as well
  const meeting = new Meeting({
    user_id: link.user_id,
    title: `Meeting with ${name}`,
    attendee: name,
    email: email,
    date,
    time,
    status: "upcoming",
  });
  await meeting.save();

  return { id: saved.id };
}

module.exports = { Booking, createBooking };
