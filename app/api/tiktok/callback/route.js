export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    }

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
      return new Response(JSON.stringify({ error: tokenData }), { status: 400 });
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

    return new Response(
      JSON.stringify({
        access_token: tokenData.data.access_token,
        refresh_token: tokenData.data.refresh_token,
        user: userData.data,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to exchange token" }), { status: 500 });
  }
}
