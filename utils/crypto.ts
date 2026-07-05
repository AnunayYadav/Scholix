/**
 * RC4 stream cipher for encrypting and decrypting Uint8Array bytes.
 * Since RC4 is symmetric, encryption and decryption are identical operations.
 */
export function rc4(key: string, data: Uint8Array): Uint8Array {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }
  let i = 0;
  j = 0;
  const out = new Uint8Array(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    const t = (s[i] + s[j]) % 256;
    out[k] = data[k] ^ s[t];
  }
  return out;
}

export const SECURE_VAULT_KEY = "scholix_secure_vault_key_secret_2026";

export function encryptBytes(key: string, data: Uint8Array): Uint8Array {
  return rc4(key, data);
}

export function decryptBytes(key: string, data: Uint8Array): Uint8Array {
  return rc4(key, data);
}
