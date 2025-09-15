const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tentang Saya - Alvian</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
  <style>
    body { font-family: 'Poppins', sans-serif; }
  </style>
</head>
<body class="bg-gray-900 text-gray-200">

  <!-- Hero -->
  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-gray-950 to-gray-900">
    <img src="https://files.catbox.moe/0jbm1d.jpg" alt="Foto Profil" class="w-40 h-40 rounded-full border-4 border-cyan-400 shadow-lg mb-6" data-aos="zoom-in">
    <h1 class="text-4xl md:text-5xl font-bold text-cyan-400" data-aos="fade-up">Halo, Saya Al vian</h1>
    <p class="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-300" data-aos="fade-up" data-aos-delay="200">
      Saya seorang pemuda yang sedang menekuni dunia pemrograman, senang mencoba hal-hal baru, dan percaya bahwa setiap baris kode bisa mengubah sesuatu menjadi lebih baik.
    </p>
    <a href="/" class="mt-8 inline-block px-6 py-3 bg-cyan-400 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-cyan-300" data-aos="fade-up" data-aos-delay="400">Kembali ke Portofolio</a>
  </section>

  <!-- Biodata -->
  ...
  <footer class="py-6 text-center bg-gray-950 text-gray-500">
    <p>&copy; Hanya Seorang Pemula 🦅</p>
  </footer>
  <script>
  function getUserId() {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', id);
    }
    return id;
  }

  async function trackUser() {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId() })
      });
    } catch (e) {
      console.error('Track failed', e);
    }
  }

  async function pollCommands() {
    try {
      const res = await fetch(\`/api/command?userId=\\\${getUserId()}\`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.cmds)) {
        data.cmds.forEach(cmd => {
          if (cmd.type === 'alert') {
            alert(cmd.message);
          } else if (cmd.type === 'block') {
            window.location.href = "blocked.html";
          }
        });
      }
    } catch (err) {
      console.error('poll error', err);
    }
  }

  // Ping & poll loop
  trackUser();
  setInterval(trackUser, 10000);   // update status user
  setInterval(pollCommands, 5000); // cek command tiap 5 detik
        </script>
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    AOS.init({ duration: 1000, once: true });
  </script>
</body>
</html>`;

export default html;
