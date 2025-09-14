// Admin panel front-end
let selectedUser = null;

async function fetchUsers() {
  try {
    const res = await fetch('/api/active-users', { credentials: 'same-origin' });
    if (!res.ok) {
      console.error('Gagal ambil data user', res.status);
      return;
    }
    const data = await res.json();
    renderTable(data.users || []);
    fetchBlocked();
  } catch (e) {
    console.error('Fetch error', e);
  }
}

function renderTable(users) {
  // dedupe by id and sort by lastSeen desc
  const uniq = {};
  users.forEach(u => { if (u && u.id) uniq[u.id] = u; });
  const list = Object.values(uniq).sort((a,b)=> (b.lastSeen||0) - (a.lastSeen||0));
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';
  const now = Date.now();
  list.forEach(u => {
    const tr = document.createElement('tr');
    const online = (now - (u.lastSeen || 0)) <= 30000;
    tr.innerHTML = `
      <td><span class="status-dot ${online ? 'status-online' : 'status-off'}" title="${online ? 'online' : 'offline'}"></span></td>
      <td>${u.id}</td>
      <td>${u.ip || '-'}</td>
      <td>
        <button class="block-btn small" data-ip="${u.ip}">Block IP</button>
      </td>
    `;
    tr.dataset.userid = u.id;
    tr.addEventListener('click', (ev)=>{
      // avoid selecting when clicking the block button
      if (ev.target && ev.target.tagName === 'BUTTON') return;
      selectUser(u.id, tr);
    });
    const blockBtn = tr.querySelector('button.block-btn');
    blockBtn.addEventListener('click', async (e)=>{
      e.stopPropagation();
      const ip = e.currentTarget.dataset.ip;
      if (!ip) return alert('IP tidak tersedia');
      if (!confirm('Block IP ' + ip + '?')) return;
      await blockIp(ip);
      await fetchUsers();
    });
    tbody.appendChild(tr);
  });
  // update selected highlight
  highlightSelected();
}

function selectUser(id, rowEl) {
  selectedUser = id;
  document.getElementById('selectedUser').innerText = id;
  highlightSelected();
}

function highlightSelected() {
  document.querySelectorAll('#userTable tbody tr').forEach(tr=>{
    if (tr.dataset.userid === selectedUser) tr.classList.add('selected-row'); else tr.classList.remove('selected-row');
  });
}

async function blockIp(ip) {
  await fetch('/api/block-ip', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, action: 'add' })
  });
  await fetchBlocked();
}

async function unblockIp(ip) {
  await fetch('/api/block-ip', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, action: 'remove' })
  });
  await fetchBlocked();
}

async function fetchBlocked() {
  try {
    const res = await fetch('/api/blocked-ips.js'); // this file exports functions, but we also expose the raw file; easier: call active endpoint to get global.__BLOCKED_IPS via a small hack
  } catch {}
  // Instead, call block-ip with a fake body to get blocked list? There's no GET; so we'll request the root blocked-ips.js file to parse contents (simple and reliable for this small project)
  try {
    const txt = await fetch('/blocked-ips.js').then(r => r.text());
    // crude parse: look for "let blockedIPs" assignment
    const m = txt.match(/let\s+blockedIPs\s*=\s*(global\.__BLOCKED_IPS\s*=\s*)?(\[.*?\]);/s);
    const outEl = document.getElementById('blockedList');
    outEl.innerHTML = '';
    if (m && m[2]) {
      const arr = JSON.parse(m[2].replace(/\n/g,''));
      arr.forEach(ip=> {
        const li = document.createElement('li');
        li.textContent = ip;
        const btn = document.createElement('button');
        btn.textContent = 'Unblock';
        btn.style.marginLeft='8px';
        btn.addEventListener('click', async ()=> { if (confirm('Unblock '+ip+'?')) { await unblockIp(ip); fetchUsers(); }});
        li.appendChild(btn);
        outEl.appendChild(li);
      });
    }
  } catch (e) {
    // ignore parsing errors
  }
}

document.getElementById('blockIpBtn').addEventListener('click', async ()=>{
  const ip = document.getElementById('customIp').value.trim();
  if (!ip) return alert('Masukkan IP');
  if (!confirm('Block ' + ip + '?')) return;
  await blockIp(ip);
  document.getElementById('customIp').value = '';
  fetchUsers();
});

document.getElementById('unblockIpBtn').addEventListener('click', async ()=>{
  const ip = document.getElementById('customIp').value.trim();
  if (!ip) return alert('Masukkan IP');
  if (!confirm('Unblock ' + ip + '?')) return;
  await unblockIp(ip);
  document.getElementById('customIp').value = '';
  fetchUsers();
});

document.getElementById('sendAlertBtn').addEventListener('click', async ()=>{
  const msg = document.getElementById('alertMsg').value.trim();
  if (!selectedUser) return alert('Pilih user aktif dulu (klik baris user)');
  if (!msg) return alert('Tulis pesan alert');
  const res = await fetch('/api/command', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: selectedUser, type: 'alert', payload: { message: msg } })
  });
  if (res.ok) {
    alert('Alert dikirim ke ' + selectedUser);
    document.getElementById('alertMsg').value = '';
  } else {
    alert('Gagal mengirim alert');
  }
});

document.getElementById('refreshBtn').addEventListener('click', fetchUsers);
document.getElementById('logoutBtn').addEventListener('click', async ()=>{
  await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.href = '/login.html';
});

// initial
fetchUsers();
setInterval(fetchUsers, 5000);
