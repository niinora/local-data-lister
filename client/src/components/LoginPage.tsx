import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email);
      setEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Login to Local Data Lister</h1>
      {error && (
        <div className="no-results" style={{ color: 'var(--text-primary)', background: '#ffe5e5' }}>
          Error: {error}
        </div>
      )}
      <form className="filter-container" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)]">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="filter-button"
          style={{ width: '100%' }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;