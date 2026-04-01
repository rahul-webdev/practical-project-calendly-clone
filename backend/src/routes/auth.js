const express = require("express");
const router = express.Router();
const env = require("../config/env");
const { sign } = require("../utils/jwt");
const { createUser, findByEmail, verifyPassword, findById, updateUser } = require("../models/users");
const { requireAuth } = require("../middleware/auth");

router.get("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.patch("/auth/me", requireAuth, async (req, res, next) => {
  try {
    const { name, phone, address, bio } = req.body;
    
    // Validation logic
    const errors = [];
    
    // Name validation: Only letters and spaces, 2-50 chars
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
        errors.push("Name must be between 2 and 50 characters.");
      } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        errors.push("Name can only contain letters and spaces.");
      }
    }

    // Phone validation: Indian mobile format (+91 or 91 or 0 prefix followed by 10 digits)
    if (phone !== undefined && phone.trim() !== "" && phone.trim() !== "+91") {
      const phoneRegex = /^(?:\+91|91|0)?[6789]\d{9}$/;
      if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
        errors.push("Invalid Indian mobile number format.");
      }
    }

    // Address validation: Max 200 chars
    if (address !== undefined && address.length > 200) {
      errors.push("Address cannot exceed 200 characters.");
    }

    // Bio validation: Max 500 chars
    if (bio !== undefined && bio.length > 500) {
      errors.push("Bio cannot exceed 500 characters.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const updated = await updateUser(req.user.id, { 
      name: name?.trim(), 
      phone: phone?.trim(), 
      address: address?.trim(), 
      bio: bio?.trim() 
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});

router.post("/auth/signup-email", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await findByEmail(email);
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" });
    const { id } = await createUser({ name, email, password });
    const token = sign({ id });
    res.json({ success: true, data: { token } });
  } catch (e) {
    next(e);
  }
});
router.post("/auth/login-email", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });
    const ok = await verifyPassword(user, password);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid credentials" });
    const token = sign({ id: user.id });
    res.json({ success: true, data: { token } });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
