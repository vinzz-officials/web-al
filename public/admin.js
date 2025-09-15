// Admin panel front-end
let selectedUser = null;

async function fetchUsers() {
  try {
    const res = await fetch('/api/users', { credentials: 'same-origin' });
    if (!res.ok) {
      console.error('Gagal ambil data user', res.status);
      return;
    }
    const data = await res.json();
    renderTable(data.users || []);
    // fetchBlocked(); // ← kalau mau buang sistem IP, bisa hapus baris ini
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
        <button class="block-btn small" data-id="${u.id}">Block</button>
        <button class="unblock-btn small" data-id="${u.id}">Unblock</button>
      </td>
    `;
    tr.dataset.userid = u.id;
    tr.addEventListener('click', (ev)=>{
      if (ev.target && ev.target.tagName === 'BUTTON') return; // skip kalau klik tombol
      selectUser(u.id, tr);
    });

    const blockBtn = tr.querySelector('.block-btn');
    blockBtn.addEventListener('click', async (e)=>{
      e.stopPropagation();
      if (!confirm('Block user ini?')) return;
      await blockUser();
      await fetchUsers();
    });

    const unblockBtn = tr.querySelector('.unblock-btn');
    unblockBtn.addEventListener('click', async (e)=>{
      e.stopPropagation();
      if (!confirm('Unblock user ini?')) return;
      await unblockUser();
      await fetchUsers();
    });

    tbody.appendChild(tr);
  });
  highlightSelected();
}

function selectUser(id, rowEl) {
  selectedUser = id;
  document.getElementById('selectedUser').innerText = id;
  highlightSelected();
}

function highlightSelected() {
  document.querySelectorAll('#userTable tbody tr').forEach(tr=>{
    if (tr.dataset.userid === selectedUser) tr.classList.add('selected-row'); 
    else tr.classList.remove('selected-row');
  });
}

async function blockUser() {
  const res = await fetch("/api/ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "ban" }),
  });
  const data = await res.json();
  alert(data.success ? "User berhasil diblok!" : "Gagal blokir");
}

async function unblockUser() {
  const res = await fetch("/api/ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "unban" }),
  });
  const data = await res.json();
  alert(data.success ? "User berhasil diunban!" : "Gagal unban");
}

// ⚠️ Opsional: kalau mau hapus semua jejak block-ip lama, buang fungsi ini dan tombol HTML terkait
async function fetchBlocked() {
  console.log("fetchBlocked disabled, sistem block-ip sudah tidak digunakan.");
}

document.getElementById('sendAlertBtn').addEventListener('click', async ()=>{
  const msg = document.getElementById('alertMsg').value.trim();
  if (!selectedUser) return alert('Pilih user aktif dulu (klik baris user)');
  if (!msg) return alert('Tulis pesan alert');

  const res = await fetch('/api/command', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetId: selectedUser, type: 'alert', message: msg })
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
