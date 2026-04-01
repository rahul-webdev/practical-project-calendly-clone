import CryptoJS from "crypto-js";

const API_ENCRYPTION_KEY = import.meta.env?.VITE_API_ENCRYPTION_KEY || "calendly_clone_encryption_key_32";
const KEY = CryptoJS.SHA256(API_ENCRYPTION_KEY);

/**
 * Encrypts data using AES-256-CBC
 */
export function encrypt(data: any): string | null {
  try {
    const text = typeof data === "string" ? data : JSON.stringify(data);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    // Format: IV:EncryptedData
    return `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

/**
 * Decrypts data using AES-256-CBC
 */
export function decrypt(encryptedText: string): any {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) return null;

    const iv = CryptoJS.enc.Base64.parse(parts[0]);
    const encryptedData = parts[1];
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
