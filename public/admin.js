async function api(path, opts){
  const token = document.getElementById('token').value.trim();
  const headers = token ? { 'Authorization': token } : {};
  const res = await fetch(path, Object.assign({ headers }, opts || {}));
  return res.json();
}

async function refreshUsers(){
  const data = await api('/api/active-users', { method: 'GET' });
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  if (!data.users) return;
  data.users.forEach(u => {
    const tr = document.createElement('tr');
    const last = new Date(u.lastSeen).toLocaleString();
    tr.innerHTML = `<td>${u.id}</td><td>${u.ip||''}</td><td>${last}</td><td>${u.pendingCmds}</td>
      <td>
        <button class="btnAlert" data-id="${u.id}">Alert</button>
        <button class="btnBlockIp" data-ip="${u.ip}">Block IP</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('btnRefresh').addEventListener('click', refreshUsers);

document.addEventListener('click', async (e) => {
  if (e.target.matches('.btnAlert')) {
    const id = e.target.dataset.id;
    await api('/api/command', { method: 'POST', body: JSON.stringify({ userId: id, type: 'alert', payload: { message: 'Admin alert' } }) });
    alert('Sent alert to ' + id);
  }
  if (e.target.matches('.btnBlockIp')) {
    const ip = e.target.dataset.ip;
    if (!ip) return alert('No ip');
    await api('/api/block', { method: 'POST', body: JSON.stringify({ ip }) });
    alert('Blocked ' + ip);
  }
});

document.getElementById('btnBlock').addEventListener('click', async () => {
  const ip = document.getElementById('blockIpInput').value.trim();
  if (!ip) return alert('enter ip');
  await api('/api/block', { method: 'POST', body: JSON.stringify({ ip }) });
  alert('Blocked ' + ip);
});

document.getElementById('btnUnblock').addEventListener('click', async () => {
  const ip = document.getElementById('blockIpInput').value.trim();
  if (!ip) return alert('enter ip');
  await api('/api/block', { method: 'DELETE', body: JSON.stringify({ ip }) });
  alert('Unblocked ' + ip);
});

document.getElementById('btnListBlocked').addEventListener('click', async () => {
  const data = await api('/api/block', { method: 'GET' });
  const ul = document.getElementById('blockedList');
  ul.innerHTML = '';
  (data.blocked || []).forEach(ip => {
    const li = document.createElement('li');
    li.textContent = ip;
    ul.appendChild(li);
  });
});

// auto refresh
setInterval(refreshUsers, 5000);
refreshUsers();
