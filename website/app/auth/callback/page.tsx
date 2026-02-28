'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'redirecting' | 'failed'>('redirecting');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('failed');
      return;
    }

    // Redirect to the Electron app via deep link
    const deepLink = `one-percent://callback?code=${encodeURIComponent(code)}`;
    window.location.href = deepLink;

    // If the redirect doesn't work after 2 seconds, show fallback
    const timer = setTimeout(() => setStatus('failed'), 2000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (status === 'failed') {
    return (
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
        background: '#faf9f5',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
          <h1 style={{ fontSize: 48, margin: 0 }}>🔗</h1>
          <h2 style={{ color: '#141413', marginTop: 16 }}>Opening One Percent...</h2>
          <p style={{ color: '#888', lineHeight: 1.6 }}>
            If the app didn&apos;t open automatically, make sure One Percent is installed on your Mac, then try signing in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      margin: 0,
      background: '#faf9f5',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#141413' }}>Redirecting to One Percent...</h2>
        <p style={{ color: '#888' }}>Please wait a moment.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
        background: '#faf9f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#141413' }}>Loading...</h2>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
