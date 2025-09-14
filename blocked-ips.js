// blocked-ips.js
let blockedIPs = [];

export function getBlocked() {
  return blockedIPs;
}

export function addBlocked(ip) {
  if (!blockedIPs.includes(ip)) blockedIPs.push(ip);
}

export function removeBlocked(ip) {
  blockedIPs = blockedIPs.filter(i => i !== ip);
}
