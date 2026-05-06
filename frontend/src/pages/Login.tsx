import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Receipt, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>
      
      <div className="auth-wrapper animate-fade-in">
        {/* Form Side */}
        <div className="auth-side-form">
          <div className="auth-header">
            <div className="logo-container">
              <Receipt className="logo-icon" size={32} />
            </div>
            <h1>NFERIO</h1>
            <p>Portal de Gestão e Emissão Fiscal</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {error && <div className="error-alert" style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
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

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Não possui uma conta? <Link to="/register" className="auth-link">Cadastre sua empresa</Link></p>
          </div>
        </div>

        {/* Preview Side */}
        <div className="auth-side-preview">
          <div className="preview-content">
            <h2>Gestão Inteligente</h2>
            <p>Controle total de vendas, estoque e emissão fiscal em uma única plataforma premium.</p>
            
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)' }}>
                <CheckCircle2 size={18} color="var(--accent-primary)" />
                <span>Multi-Tenancy Nativo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)' }}>
                <CheckCircle2 size={18} color="var(--accent-primary)" />
                <span>Emissão NF-e / NFC-e Ilimitada</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)' }}>
                <CheckCircle2 size={18} color="var(--accent-primary)" />
                <span>Integração Financeira Automática</span>
              </div>
            </div>
          </div>

          <div className="preview-grid">
            <div className="preview-item large">
              <img src="/previews/pdv.png" alt="PDV Checkout" />
            </div>
            <div className="preview-item">
              <img src="/previews/customers.png" alt="Customer Registration" />
            </div>
            <div className="preview-item">
              <img src="/previews/products.png" alt="Product Catalog" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
