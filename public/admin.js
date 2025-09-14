async function fetchUsers() {
  const res = await fetch("/api/active-users");
  if (!res.ok) return console.error("Gagal ambil data user");
  const data = await res.json();
  renderTable(data.users || []);
}

function renderTable(users) {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.ip}</td>
      <td>${u.ua}</td>
      <td>${new Date(u.lastSeen).toLocaleTimeString()}</td>
      <td>
        <button class="action-btn alert-btn" onclick="sendAlert('${u.id}')">Alert</button>
        <button class="action-btn block-btn" onclick="blockIP('${u.ip}')">Block</button>
        <button class="action-btn unblock-btn" onclick="unblockIP('${u.ip}')">Unblock</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function sendAlert(id) {
  const message = prompt("Masukkan pesan alert:");
  if (!message) return;
  await fetch("/api/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type: "alert", message })
  });
  alert("Alert terkirim ke user!");
}

async function blockIP(ip) {
  if (!confirm(`Block IP ${ip}?`)) return;
  await fetch("/api/block-ip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip, action: "add" })
  });
  fetchUsers();
}

async function unblockIP(ip) {
  if (!confirm(`Unblock IP ${ip}?`)) return;
  await fetch("/api/block-ip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip, action: "remove" })
  });
  fetchUsers();
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login.html";
});

setInterval(fetchUsers, 5000);
fetchUsers();
