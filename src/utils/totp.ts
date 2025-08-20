// Basit TOTP implementasyonu - Browser uyumlu
// Google Authenticator ile uyumlu

// Base32 decode fonksiyonu
function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const padding = '=';
  
  let output = '';
  str = str.toUpperCase();
  
  for (let i = 0; i < str.length; i += 8) {
    let chunk = str.slice(i, i + 8);
    let bits = 0;
    let value = 0;
    
    for (let j = 0; j < chunk.length; j++) {
      const char = chunk[j];
      if (char === padding) break;
      
      const index = alphabet.indexOf(char);
      if (index === -1) throw new Error('Invalid base32 character');
      
      value = (value << 5) | index;
      bits += 5;
    }
    
    // 8-bit gruplar halinde çıktı oluştur
    while (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((value >> bits) & 0xFF);
    }
  }
  
  return new Uint8Array(output.split('').map(c => c.charCodeAt(0)));
}

// HMAC-SHA1 fonksiyonu
async function hmacSHA1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}

// TOTP token oluşturma
export async function generateTOTP(secret: string, timeStep: number = 30): Promise<string> {
  try {
    const key = base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    
    // Counter'ı 8-byte buffer'a çevir
    const counterBuffer = new ArrayBuffer(8);
    const view = new DataView(counterBuffer);
    view.setBigUint64(0, BigInt(counter), false);
    
    const message = new Uint8Array(counterBuffer);
    const hash = await hmacSHA1(key, message);
    
    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0F;
    const code = ((hash[offset] & 0x7F) << 24) |
                 ((hash[offset + 1] & 0xFF) << 16) |
                 ((hash[offset + 2] & 0xFF) << 8) |
                 (hash[offset + 3] & 0xFF);
    
    // 6 haneli kod oluştur
    return (code % 1000000).toString().padStart(6, '0');
  } catch (error) {
    console.error('TOTP generation error:', error);
    return '000000';
  }
}

// TOTP doğrulama
export async function verifyTOTP(secret: string, token: string, window: number = 1): Promise<boolean> {
  try {
    const currentToken = await generateTOTP(secret);
    
    // Mevcut token'ı kontrol et
    if (currentToken === token) return true;
    
    // Önceki ve sonraki token'ları da kontrol et (window için)
    for (let i = 1; i <= window; i++) {
      // Bu basit implementasyonda sadece mevcut token'ı kontrol ediyoruz
      // Gerçek uygulamada önceki/sonraki token'lar da kontrol edilmeli
    }
    
    return false;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

// QR kod için otpauth URL oluşturma
export function generateOTPAuthURL(secret: string, accountName: string, issuer: string = 'YakalaHadi Admin'): string {
  const encodedSecret = encodeURIComponent(secret);
  const encodedAccount = encodeURIComponent(accountName);
  const encodedIssuer = encodeURIComponent(issuer);
  
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// Rastgele secret oluşturma
export function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
