const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    link_id: { type: String, unique: true, required: true },
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

const Link = mongoose.model("Link", linkSchema);

async function generateLink({ userId }) {
  const uid = Math.random().toString(36).slice(2, 10);
  const link = new Link({
    user_id: userId,
    link_id: uid,
  });
  const saved = await link.save();
  return {
    link: `${process.env.FRONTEND_URL || "http://localhost:5173"}/book/${uid}`,
    id: saved.id,
  };
}

async function listLinks({ userId }) {
  const items = await Link.find({ user_id: userId }).sort({ createdAt: -1 });
  return items.map(item => ({
    id: item.id,
    link_id: item.link_id,
    link: `${process.env.FRONTEND_URL || "http://localhost:5173"}/book/${item.link_id}`,
  }));
}

module.exports = { Link, generateLink, listLinks };
