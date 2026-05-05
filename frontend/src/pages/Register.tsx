import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Receipt } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate register
    navigate('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>
      
      <div className="glass-panel auth-card animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="logo-container">
            <Building2 className="logo-icon" size={32} />
          </div>
          <h1>Cadastro de Empresa</h1>
          <p>Inicie sua gestão fiscal inteligente</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input
              id="cnpj"
              type="text"
              className="glass-input"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="razaoSocial">Razão Social</label>
            <input
              id="razaoSocial"
              type="text"
              className="glass-input"
              placeholder="Sua Empresa LTDA"
              value={formData.razaoSocial}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Corporativo</label>
            <input
              id="email"
              type="email"
              className="glass-input"
              placeholder="contato@empresa.com.br"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha de Acesso</label>
            <input
              id="password"
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit">
            <Receipt size={20} />
            Criar Conta e Configurar
          </button>
        </form>

        <div className="auth-footer">
          <p>Já possui uma conta? <Link to="/login" className="auth-link">Faça Login</Link></p>
        </div>
      </div>
    </div>
  );
}
