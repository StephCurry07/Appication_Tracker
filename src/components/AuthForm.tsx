import React, { useState } from 'react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string, fullName?: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSignIn,
  onSignUp,
  loading,
  error
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await onSignUp(formData.email, formData.password, formData.fullName);
    } else {
      await onSignIn(formData.email, formData.password);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Job Application Tracker</h1>
          <p>Track your job applications across all your devices</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name (Optional)</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Your password"
              minLength={6}
            />
            {isSignUp && (
              <small className="form-hint">
                Password must be at least 6 characters long
              </small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <div className="auth-switch">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="link-button"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="link-button"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </form>

        <div className="auth-features">
          <h3>✨ Features</h3>
          <ul>
            <li>🔄 Sync across all your devices</li>
            <li>📊 Track application progress</li>
            <li>🔍 Search and filter applications</li>
            <li>📈 View analytics and insights</li>
            <li>🔒 Secure cloud storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};