const crypto = require('crypto');
const base64url = require('base64url');
require('dotenv').config()

const secretKey = process.env.SUB_SECRET;;
const algorithm = 'aes-256-cbc';

function encryptAndEncodeUUID(uuid) {
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(uuid, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return base64url.fromBase64(encrypted);
}
function decodeAndDecryptCode(encryptedCode) {
  const decoded = base64url.toBase64(encryptedCode);
  const decipher = crypto.createDecipher(algorithm, secretKey);
  let decrypted = decipher.update(decoded, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
module.exports = {encryptAndEncodeUUID , decodeAndDecryptCode}
