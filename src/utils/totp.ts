import { authenticator } from 'otplib';

// TOTP token oluşturma
export async function generateTOTP(secret: string): Promise<string> {
  try {
    return authenticator.generate(secret);
  } catch (error) {
    console.error('TOTP generation error:', error);
    return '000000';
  }
}

// TOTP doğrulama
export async function verifyTOTP(secret: string, token: string): Promise<boolean> {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

// QR kod için otpauth URL oluşturma
export function generateOTPAuthURL(secret: string, accountName: string, issuer: string = 'YakalaHadi Admin'): string {
  return authenticator.keyuri(accountName, issuer, secret);
}

// Rastgele secret oluşturma
export function generateSecret(): string {
  return authenticator.generateSecret();
}
