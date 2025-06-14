import DOMPurify from 'dompurify';
import xss from 'xss';
import CryptoJS from 'crypto-js';

export class Security {
  static sanitizeInput(input: string): string {
    return DOMPurify.sanitize(xss(input));
  }

  static encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  static decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static generateCSRFToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
}