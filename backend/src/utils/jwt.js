const jwt = require("jsonwebtoken");
const env = require("../config/env");
function sign(payload, options = {}) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "1h", ...options });
}
function verify(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (e) {
    console.error("[JWT Verify Error]:", e.message);
    return null;
  }
}
module.exports = { sign, verify };
