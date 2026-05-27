import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Receipt, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Criar Empresa no Supabase
      const { data: company, error: companyError } = await supabase
        .from('empresas')
        .insert([{ 
          razao_social: formData.razaoSocial, 
          cnpj: formData.cnpj 
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Criar Usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            company_id: company.id
          }
        }
      });

      if (authError) throw authError;

      // 3. Criar Perfil na tabela usuarios (vinculando ao auth.uid)
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user?.id,
          name: formData.name,
          email: formData.email,
          role: 'OWNER',
          company_id: company.id
        }]);

      if (profileError) throw profileError;

      navigate('/login', { state: { message: 'Conta criada com sucesso! Verifique seu e-mail ou faça login.' } });
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
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
          {error && <div className="error-alert" style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
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
            <label htmlFor="name">Seu Nome</label>
            <input
              id="name"
              type="text"
              className="glass-input"
              placeholder="Nome Completo"
              value={formData.name}
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

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Receipt size={20} />}
            {loading ? 'Processando...' : 'Criar Conta e Configurar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Já possui uma conta? <Link to="/login" className="auth-link">Faça Login</Link></p>
        </div>
      </div>
    </div>
  );
}
