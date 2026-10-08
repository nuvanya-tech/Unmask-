/**
 * URL resolution for sharing UNMASK rooms with partners.
 * Ensures the link works seamlessly whether accessed inside Google AI Studio,
 * or as a standalone website on mobile or desktop.
 */

const PUBLIC_SHARED_URL = 'https://ais-pre-bbn3gu5wsuuzdfowyrjsr3-969059506606.asia-southeast1.run.app';

export function getShareableRoomUrl(roomCode: string): string {
  const code = (roomCode || '').trim().toUpperCase();

  try {
    const origin = window.location.origin;

    // If on localhost, allow local testing on same machine / LAN
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return `${origin}/?room=${code}`;
    }

    // If inside development preview (ais-dev-...) or aistudio iframe,
    // ALWAYS provide the public pre-shared URL so partners can open it on their phones without auth walls!
    if (origin.includes('ais-dev') || origin.includes('aistudio') || origin.includes('google.com')) {
      return `${PUBLIC_SHARED_URL}/?room=${code}`;
    }

    // Otherwise use current public host
    const pathname = window.location.pathname.replace(/\/$/, '');
    return `${origin}${pathname}/?room=${code}`;
  } catch {
    return `${PUBLIC_SHARED_URL}/?room=${code}`;
  }
}
