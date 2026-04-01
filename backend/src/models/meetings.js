const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    attendee: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:mm
    status: { type: String, enum: ["upcoming", "cancelled", "completed"], default: "upcoming" },
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

const Meeting = mongoose.model("Meeting", meetingSchema);

async function listMeetings({ userId, page = 1, pageSize = 10, status, q }) {
  const skip = (page - 1) * pageSize;
  const filter = { user_id: userId };

  if (status) {
    filter.status = status;
  }

  if (q) {
    filter.$or = [{ title: new RegExp(q, "i") }, { attendee: new RegExp(q, "i") }];
  }

  const items = await Meeting.find(filter)
    .sort({ date: -1, time: -1 })
    .skip(skip)
    .limit(pageSize);

  const total = await Meeting.countDocuments(filter);

  return { items, total };
}

async function deleteMeeting({ userId, id }) {
  const meeting = await Meeting.findOne({ _id: id, user_id: userId });
  if (meeting) {
    // Delete the corresponding booking to free up the slot
    const Booking = mongoose.model("Booking");
    await Booking.deleteOne({ 
      user_id: userId, 
      date: meeting.date, 
      time: meeting.time, 
      email: meeting.email 
    });
    await Meeting.deleteOne({ _id: id, user_id: userId });
  }
  return { id };
}

module.exports = { Meeting, listMeetings, deleteMeeting };
