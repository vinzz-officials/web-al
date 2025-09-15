const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>—ALvian</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
  <style>
    body { font-family: 'Poppins', sans-serif; }
    .typed-cursor { color: #22d3ee; }
  </style>
</head>
<body class="bg-gray-900 text-gray-200">
  <header class="fixed top-0 left-0 w-full bg-gray-950 shadow-md z-50">
    <div class="container mx-auto flex justify-between items-center px-6 py-4">
      <h1 class="text-2xl font-bold text-cyan-400">AL vian Portofolio</h1>
      <nav class="hidden md:flex space-x-8">
        <a href="#home" class="hover:text-cyan-400">Home</a>
        <a href="#about" class="hover:text-cyan-400">About</a>
        <a href="#skills" class="hover:text-cyan-400">Skills</a>
        <a href="#projects" class="hover:text-cyan-400">Projects</a>
        <a href="https://wa.me/62882006453149" class="hover:text-cyan-400">Contact</a>
      </nav>
    </div>
  </header>
  <section id="home" class="min-h-screen flex items-center justify-center text-center px-6 bg-gradient-to-r from-gray-950 to-gray-800 text-white">
    <div data-aos="fade-up">
      <h2 class="text-4xl md:text-6xl font-bold mb-4">Hi, I'm <span class="text-cyan-400">AL</span></h2>
      <h3 class="text-2xl md:text-3xl mb-6">I am <span id="typed"></span></h3>
      <a href="/page" class="mt-8 inline-block px-6 py-3 bg-cyan-400 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-cyan-300" data-aos="fade-up" data-aos-delay="400"> Home Page</a>
    </div>
  </section>
  ...
  <footer class="py-6 text-center bg-gray-950 text-gray-500">
    <p>&copy; AL vian Create, September 2025.</p>
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
      } catch (e) { console.error('Track failed', e); }
    }
    async function pollCommands() {
      try {
        const res = await fetch(\`/api/command?userId=\${getUserId()}\`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.cmds)) {
          data.cmds.forEach(cmd => {
            if (cmd.type === 'alert') {
              alert(cmd.message);
            } else if (cmd.type === 'block') {
              window.location.href = "/blocked";
            }
          });
        }
      } catch (err) { console.error('poll error', err); }
    }
    trackUser();
    setInterval(trackUser, 10000);
    setInterval(pollCommands, 5000);
  </script>
  <script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
  <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
  <script>
    var typed = new Typed("#typed", {
      strings: ["a Web Developer", "a Mobile Developer", "a Designer"],
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
    });
    AOS.init({ duration: 1000, once: true });
  </script>
</body>
</html>
`;
export default html;
