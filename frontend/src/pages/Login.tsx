import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Receipt } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>
      
      <div className="glass-panel auth-card animate-fade-in">
        <div className="auth-header">
          <div className="logo-container">
            <Receipt className="logo-icon" size={32} />
          </div>
          <h1>NFERIO</h1>
          <p>Portal de Gestão e Emissão Fiscal</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Corporativo</label>
            <input
              id="email"
              type="email"
              className="glass-input"
              placeholder="seu@email.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit">
            <LogIn size={20} />
            Entrar no Sistema
          </button>
        </form>

        <div className="auth-footer">
          <p>Não possui uma conta? <Link to="/register" className="auth-link">Cadastre sua empresa</Link></p>
        </div>
      </div>
    </div>
  );
}
