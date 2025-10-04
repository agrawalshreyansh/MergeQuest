'use client';
import { useEffect } from 'react';

export default function OAuthCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    console.log("OAuth callback received:", { code, error }); // Debug log

    if (error) {
      // Send error back to parent window
      window.opener.postMessage({ error }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // Send code back to parent window
      window.opener.postMessage({ code }, window.location.origin);
      window.close();
    } else {
      console.error("No code or error received from GitHub");
      window.opener.postMessage({ error: "No authorization code received" }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}