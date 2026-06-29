export async function GET(request: Request) {
  // GET /logout is intentionally non-mutating, including RSC/prefetch GETs.
  void request;
  return new Response(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sign out from MindPulse</title>
</head>
<body>
  <main style="font-family: system-ui, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 1rem;">
    <h1>Sign out from MindPulse</h1>
    <p>For your safety, signing out only happens when you press the logout button inside the app.</p>
    <p><a href="/app">Return to MindPulse</a></p>
  </main>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}
