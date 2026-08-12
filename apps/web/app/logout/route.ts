export async function GET(request: Request) {
  // GET /logout is intentionally non-mutating, including RSC/prefetch GETs.
  void request;
  return new Response(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title id="page-title">Sign out from MindPulse</title>
</head>
<body>
  <main style="font-family: system-ui, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 1rem;">
    <h1 id="heading">Sign out from MindPulse</h1>
    <p id="message">For your safety, signing out only happens when you press the logout button inside the app.</p>
    <p><a id="return-link" href="/app">Return to MindPulse</a></p>
  </main>
  <script>
    try {
      const language = JSON.parse(localStorage.getItem('mindpulse-language-v1'));
      const copy = {
        en: ['Sign out from MindPulse', 'For your safety, signing out only happens when you press the logout button inside the app.', 'Return to MindPulse'],
        ru: ['Выйти из MindPulse', 'В целях безопасности выход выполняется только после нажатия кнопки «Выйти» в приложении.', 'Вернуться в MindPulse'],
        kk: ['MindPulse жүйесінен шығу', 'Қауіпсіздік үшін жүйеден шығу тек қолданбадағы «Шығу» түймесін басқанда орындалады.', 'MindPulse-ке оралу'],
        es: ['Cerrar sesión en MindPulse', 'Por tu seguridad, la sesión solo se cierra cuando presionas el botón Cerrar sesión dentro de la aplicación.', 'Volver a MindPulse'],
      }[language];
      if (copy) {
        document.documentElement.lang = language;
        document.title = copy[0];
        document.getElementById('heading').textContent = copy[0];
        document.getElementById('message').textContent = copy[1];
        document.getElementById('return-link').textContent = copy[2];
      }
    } catch {}
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}
