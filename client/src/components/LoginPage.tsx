import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

interface LoginPageProps {
  onLogin: (credential: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential returned from Google');
      }
      // Send credential to backend for verification and login
      await onLogin(credentialResponse.credential);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login to Local Data Lister</h2>
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError('Google login failed')}
        />
        {/* Optionally show loading indicator */}
        {loading && <span style={{ marginLeft: 12 }}>Loading...</span>}
      </div>
    </div>
  );
};

export default LoginPage;