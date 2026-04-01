const { encrypt, decrypt } = require("../utils/crypto_utils");

/**
 * Middleware to handle request/response encryption
 */
function encryptionMiddleware(req, res, next) {
  // 1. Decrypt Request Body if present and encrypted
  if (req.body && typeof req.body === "string") {
    const decrypted = decrypt(req.body);
    if (decrypted !== null) {
      req.body = decrypted;
    }
  } else if (req.body && req.body.data && typeof req.body.data === "string") {
    // Alternatively, if the frontend sends { data: "encrypted_string" }
    const decrypted = decrypt(req.body.data);
    if (decrypted !== null) {
      req.body = decrypted;
    }
  }

  // 2. Monkey-patch res.json to encrypt Response Body
  const originalJson = res.json;
  res.json = function (data) {
    if (data && !data.noEncryption) {
      const encryptedData = encrypt(data);
      if (encryptedData) {
        return originalJson.call(this, { encrypted: true, data: encryptedData });
      }
    }
    return originalJson.call(this, data);
  };

  next();
}

module.exports = { encryptionMiddleware };
