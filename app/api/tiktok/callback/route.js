// GET handler для OAuth callback redirect
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return Response.redirect(`${new URL(req.url).origin}/?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return Response.redirect(`${new URL(req.url).origin}/?error=${encodeURIComponent('Missing authorization code')}`);
    }

    // Редиректим обратно на главную страницу с кодом
    return Response.redirect(`${new URL(req.url).origin}/?code=${encodeURIComponent(code)}`);
  } catch (err) {
    console.error('GET callback error:', err);
    return Response.redirect(`${new URL(req.url).origin}/?error=${encodeURIComponent('Authentication failed')}`);
  }
}

// POST handler для обмена кода на токен
export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    }

    // Отладочная информация
    console.log('Token exchange request:', {
      client_key: process.env.TIKTOK_CLIENT_KEY ? 'SET' : 'MISSING',
      client_secret: process.env.TIKTOK_CLIENT_SECRET ? 'SET' : 'MISSING',
      redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      code: code ? 'SET' : 'MISSING'
    });

    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache"
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log('Token response:', tokenData);

    if (!tokenData.access_token && !tokenData.data?.access_token) {
      return new Response(JSON.stringify({ error: tokenData }), { status: 400 });
    }

    // Используем правильный токен из ответа
    const accessToken = tokenData.access_token || tokenData.data?.access_token;
    const openId = tokenData.open_id || tokenData.data?.open_id;

    const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username", {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
    });

    const userData = await userRes.json();
    console.log('User response:', userData);

    return new Response(
      JSON.stringify({
        access_token: accessToken,
        refresh_token: tokenData.refresh_token || tokenData.data?.refresh_token,
        user: userData.data || userData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error('POST callback error:', err);
    return new Response(JSON.stringify({ error: "Failed to exchange token" }), { status: 500 });
  }
}
