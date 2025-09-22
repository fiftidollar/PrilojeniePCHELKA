"use client";

import React, { useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginWithTikTok = () => {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI);
    const scope = "user.info.basic";
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;

    // редиректим на TikTok
    window.location.href = authUrl;
  };

  const handleCode = async (code) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tiktok/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!data.error) {
        setUser(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ловим code после редиректа
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      handleCode(code);
      // очищаем URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <main className="flex flex-col h-screen items-center justify-center gap-6">
      {!user && !loading && !error && (
        <button
          onClick={loginWithTikTok}
          className="px-6 py-3 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800"
        >
          Login with TikTok
        </button>
      )}

      {loading && <p>Loading profile...</p>}

      {error && (
        <div className="text-red-500 text-center">
          <p>Error: {typeof error === "string" ? error : JSON.stringify(error)}</p>
          <button
            onClick={loginWithTikTok}
            className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      )}

      {user && (
        <div className="flex flex-col items-center gap-4">
          <img
            src={user.avatar_url || user.avatar || "/default-avatar.png"}
            alt={user.display_name || user.nickname}
            className="w-24 h-24 rounded-full object-cover"
          />
          <h2 className="text-xl font-bold">{user.display_name || user.nickname}</h2>
          <p className="text-gray-600">@{user.unique_id || user.open_id}</p>

          <button
            onClick={() => setUser(null)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}
