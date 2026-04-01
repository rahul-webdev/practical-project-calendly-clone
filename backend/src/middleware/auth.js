const { verify } = require("../utils/jwt");
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  console.log(`[Auth Check] Path: ${req.path}, Authorization Header: ${header ? "Present" : "Missing"}`);
  
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    console.error(`[Auth] No token provided for path: ${req.path}`);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const decoded = verify(token);
  if (!decoded) {
    console.error(`[Auth] Invalid token: ${token ? token.substring(0, 10) + "..." : "none"}`);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  req.user = decoded;
  next();
}
module.exports = { requireAuth };
