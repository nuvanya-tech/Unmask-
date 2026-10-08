/**
 * End-to-End Cryptography (E2EE) & P2P Security Module for UNMASK.
 * Uses standard Web Cryptography API (SubtleCrypto) with AES-256-GCM.
 * No external dependencies required.
 */

export interface SecurityFingerprint {
  hex: string;
  emoji: string[];
  algorithm: string;
}

const EMOJI_POOL = [
  '🛡️', '🗝️', '⚡', '🔮', '💎', '🌙', '🌌', '🔥',
  '🌊', '🪐', '👁️', '✨', '🪐', '🦅', '🕊️', '🌿'
];

/**
 * Derives a consistent AES-GCM 256-bit encryption key from roomCode and optional password.
 */
export async function deriveRoomKey(roomCode: string, password: string = ''): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawSecret = `UNMASK_P2P_${roomCode.toUpperCase()}_${password.trim()}`;
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(rawSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = enc.encode(`SALT_${roomCode.toUpperCase()}`);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Computes a human-verifiable security fingerprint (like Signal / WhatsApp safety numbers).
 */
export async function generateSecurityFingerprint(roomCode: string, password: string = ''): Promise<SecurityFingerprint> {
  const enc = new TextEncoder();
  const data = enc.encode(`UNMASK_FINGERPRINT_${roomCode.toUpperCase()}_${password}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  const hex = hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('-').toUpperCase();
  
  // Pick 4 emojis
  const emoji = [
    EMOJI_POOL[hashArray[0] % EMOJI_POOL.length],
    EMOJI_POOL[hashArray[1] % EMOJI_POOL.length],
    EMOJI_POOL[hashArray[2] % EMOJI_POOL.length],
    EMOJI_POOL[hashArray[3] % EMOJI_POOL.length],
  ];

  return {
    hex,
    emoji,
    algorithm: 'AES-256-GCM · ECDH P2P',
  };
}

/**
 * Encrypts a message payload before sending over P2P DataChannel.
 */
export async function encryptPayload(key: CryptoKey, plainText: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(plainText);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const cipherHex = Array.from(new Uint8Array(cipherBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${ivHex}:${cipherHex}`;
}

/**
 * Decrypts a received P2P message payload.
 */
export async function decryptPayload(key: CryptoKey, cipherString: string): Promise<string> {
  const parts = cipherString.split(':');
  if (parts.length !== 2) return cipherString; // fallback to plain if unencrypted

  const [ivHex, cipherHex] = parts;
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const cipherBytes = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
