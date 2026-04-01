const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    password_hash: { type: String },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String, trim: true },
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

// Map common methods to maintain compatibility with existing code
const User = mongoose.model("User", userSchema);

async function createUser({ name, email, password }) {
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    password_hash: hashed,
  });
  const saved = await user.save();
  return { id: saved.id };
}

async function findByEmail(email) {
  return User.findOne({ email });
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

async function findById(id) {
  return User.findById(id);
}

async function updateUser(id, updates) {
  return User.findByIdAndUpdate(id, updates, { new: true });
}

module.exports = { User, createUser, findByEmail, verifyPassword, findById, updateUser };
