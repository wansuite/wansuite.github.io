// Hard-block mainland China (CN) visitors from xuhuwan.pages.dev.
// Runs on every request via Cloudflare Pages Functions.
//
// Country codes that are NOT blocked:
//   HK (Hong Kong), TW (Taiwan), MO (Macau)
//
// Visitors using non-CN VPN exits bypass this block (unavoidable).

export async function onRequest(context) {
  const country = context.request.cf?.country;
  if (country === 'CN') {
    return new Response(BLOCKED_HTML, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
  return context.next();
}

const BLOCKED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page not available</title>
<meta name="robots" content="noindex">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; background: #fbfaf6; color: #1c1917; margin: 0; }
  .wrap { max-width: 480px; margin: 18vh auto; padding: 2rem; text-align: center; }
  h1 { font-weight: 600; font-size: 1.75rem; margin-bottom: 1rem; color: #1e3a5f; letter-spacing: -0.01em; }
  p { color: #57534e; line-height: 1.6; }
  a { color: #1e3a5f; }
  .hr { border: 0; border-top: 1px solid #e7e5e0; margin: 2rem 0; }
  .small { font-size: 0.85rem; color: #a8a29e; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Page not available</h1>
  <p>This site is not available in your region.</p>
  <hr class="hr">
  <p class="small">If you believe this is an error, please contact <a href="mailto:xuhu.wan@gmail.com">xuhu.wan@gmail.com</a>.</p>
</div>
</body>
</html>`;
