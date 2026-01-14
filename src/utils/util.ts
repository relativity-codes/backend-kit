import * as crypto from 'crypto';

export function generateUniqueRealId(): string {
  const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `URB${timestamp}${random}`; // e.g., URB7212344567
}

export function generatePin(digits: number): string {
  if (digits <= 0) {
    throw new Error('Number of digits must be greater than zero');
  }

  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function encryptWithRSA(publicKey: string, data: string): string {
  const formattedKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: formattedKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer,
  );
  return encrypted.toString('base64');
}

export function decryptWithRSA(privateKey: string, encrypted: string): string {
  const formattedKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  const buffer = Buffer.from(encrypted, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: formattedKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer,
  );
  return decrypted.toString('utf8');
}
