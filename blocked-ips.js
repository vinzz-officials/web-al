// blocked-ips.js (shared simple store)
let blockedIPs = global.__BLOCKED_IPS = global.__BLOCKED_IPS || [];

// Ambil daftar IP yang diblokir
export function getBlocked() {
  return blockedIPs;
}

// Tambah IP ke blocked
export function addBlocked(ip) {
  if (!blockedIPs.includes(ip)) blockedIPs.push(ip);
  global.__BLOCKED_IPS = blockedIPs;
}

// Hapus IP dari blocked
export function removeBlocked(ip) {
  blockedIPs = blockedIPs.filter(i => i !== ip);
  global.__BLOCKED_IPS = blockedIPs;
}
