const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    start_time: { type: String, required: true }, // Format: HH:mm
    end_time: { type: String, required: true }, // Format: HH:mm
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

const Availability = mongoose.model("Availability", availabilitySchema);

async function createAvailability({ userId, date, startTime, endTime }) {
  // Time selection validation
  if (startTime >= endTime) {
    throw Object.assign(new Error("Start time must be earlier than end time"), { status: 400 });
  }

  // Check for overlapping availability
  const overlapping = await Availability.findOne({
    user_id: userId,
    date,
    $or: [
      {
        start_time: { $lt: endTime },
        end_time: { $gt: startTime },
      },
    ],
  });

  if (overlapping) {
    throw Object.assign(new Error("This time slot overlaps with an existing availability"), { status: 400 });
  }

  const availability = new Availability({
    user_id: userId,
    date,
    start_time: startTime,
    end_time: endTime,
  });
  const saved = await availability.save();
  return { id: saved.id };
}

async function deleteAvailability({ userId, id }) {
  const availability = await Availability.findOne({ _id: id, user_id: userId });
  if (availability) {
    // Delete any bookings and meetings that fall within this availability slot
    const Booking = mongoose.model("Booking");
    const Meeting = mongoose.model("Meeting");

    const filter = {
      user_id: userId,
      date: availability.date,
      time: { $gte: availability.start_time, $lt: availability.end_time }
    };

    await Booking.deleteMany(filter);
    await Meeting.deleteMany(filter);
    await Availability.deleteOne({ _id: id, user_id: userId });
  }
  return { id };
}

async function listAvailability({ userId }) {
  return await Availability.find({ user_id: userId }).sort({ date: 1, start_time: 1 });
}

module.exports = { Availability, createAvailability, deleteAvailability, listAvailability };
