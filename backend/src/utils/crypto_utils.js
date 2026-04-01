const crypto = require("crypto");
const env = require("../config/env");

const ALGORITHM = "aes-256-cbc";
const KEY = crypto.createHash("sha256").update(env.encryptionKey).digest();

/**
 * Encrypts data to a base64 string
 */
function encrypt(data) {
  try {
    const text = typeof data === "string" ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    // Format: IV:EncryptedData
    return `${iv.toString("base64")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

/**
 * Decrypts a base64 string back to original data
 */
function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) return null;

    const iv = Buffer.from(parts[0], "base64");
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

module.exports = { encrypt, decrypt };
