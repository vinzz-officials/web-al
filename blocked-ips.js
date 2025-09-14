// blocked-ips.js
let blockedIPs = [];

// Ambil daftar IP yang diblokir
export function getBlocked() {
  return blockedIPs;
}

// Tambah IP ke blocked
export function addBlocked(ip) {
  if (!blockedIPs.includes(ip)) blockedIPs.push(ip);
}

// Hapus IP dari blocked
export function removeBlocked(ip) {
  blockedIPs = blockedIPs.filter(i => i !== ip);
}
