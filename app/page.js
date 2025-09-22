"use client";

import React, { useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginWithTikTok = () => {
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI;
    
    // Отладочная информация
    console.log('Environment variables check:', {
      clientKey: clientKey ? 'Set' : 'MISSING',
      redirectUri: redirectUri ? 'Set' : 'MISSING',
      clientKeyValue: clientKey,
      redirectUriValue: redirectUri
    });

    if (!clientKey || !redirectUri) {
      setError(`Missing environment variables: ${!clientKey ? 'NEXT_PUBLIC_TIKTOK_CLIENT_KEY ' : ''}${!redirectUri ? 'NEXT_PUBLIC_TIKTOK_REDIRECT_URI' : ''}`);
      return;
    }

    setLoading(true);
    setError(null);

    const scope = "user.info.basic";
    const state = Math.random().toString(36).substring(7);
    const encodedRedirectUri = encodeURIComponent(redirectUri);

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${encodedRedirectUri}&state=${state}`;

    console.log('Generated auth URL:', authUrl);

    // Открываем popup для OAuth
    const popup = window.open(authUrl, 'tiktok-oauth', 'width=600,height=700,scrollbars=yes,resizable=yes');

    // Слушаем сообщения от popup
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      console.log('Received message from popup:', event.data);
      
      if (event.data.success && event.data.data) {
        setUser(event.data.data.user);
        setLoading(false);
      } else if (event.data.error) {
        setError(event.data.error);
        setLoading(false);
      }
      
      window.removeEventListener('message', handleMessage);
      if (popup) popup.close();
    };

    window.addEventListener('message', handleMessage);

    // Проверяем, не закрыл ли пользователь popup
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setLoading(false);
        setError('Авторизация была отменена');
      }
    }, 1000);
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

  // Очищаем URL от OAuth параметров при загрузке (если остались)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("code") || urlParams.has("error")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <main className="flex flex-col h-screen items-center justify-center gap-6">
      {!user && !loading && !error && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={loginWithTikTok}
            className="px-6 py-3 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800"
          >
            Login with TikTok
          </button>
          <div className="text-sm text-gray-500 text-center max-w-md">
            <p>Нужно настроить переменные окружения в Vercel:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• NEXT_PUBLIC_TIKTOK_CLIENT_KEY</li>
              <li>• NEXT_PUBLIC_TIKTOK_REDIRECT_URI</li>
            </ul>
          </div>
        </div>
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
