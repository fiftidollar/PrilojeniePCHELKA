// GET handler для OAuth callback redirect
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ error: '${error}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

    if (!code) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ error: 'Missing authorization code' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

    return await exchangeCodeForToken(code);
  } catch (err) {
    console.error('GET callback error:', err);
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ error: 'Authentication failed' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, { 
      status: 200, 
      headers: { 'Content-Type': 'text/html' } 
    });
  }
}

// POST handler для внутренних запросов
export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    }

    return await exchangeCodeForToken(code);
  } catch (err) {
    console.error('POST callback error:', err);
    return new Response(JSON.stringify({ error: "Failed to exchange token" }), { status: 500 });
  }
}

async function exchangeCodeForToken(code) {
  try {
    const tokenRes = await fetch("https://open-api.tiktok.com/oauth/access_token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.data?.access_token) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ error: ${JSON.stringify(tokenData)} }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

    const userRes = await fetch("https://open-api.tiktok.com/user/info/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: tokenData.data.access_token,
        open_id: tokenData.data.open_id,
      }),
    });

    const userData = await userRes.json();

    const result = {
      access_token: tokenData.data.access_token,
      refresh_token: tokenData.data.refresh_token,
      user: userData.data,
    };

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true, data: ${JSON.stringify(result)} }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, { 
      status: 200, 
      headers: { 'Content-Type': 'text/html' } 
    });
  } catch (err) {
    console.error('Exchange token error:', err);
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ error: 'Failed to exchange token' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, { 
      status: 200, 
      headers: { 'Content-Type': 'text/html' } 
    });
  }
}
