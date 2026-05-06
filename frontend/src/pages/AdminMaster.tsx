import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Search, 
  ShieldCheck, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

const AdminMaster: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', password: '' });
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [compRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3333/api/admin/companies'),
        axios.get('http://localhost:3333/api/admin/stats')
      ]);
      setCompanies(compRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados administrativos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [authorized]);

  const handleMasterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'Master' && loginForm.password === '@Master2026') {
      setAuthorized(true);
    } else {
      alert('Credenciais Master inválidas!');
    }
  };

  if (!authorized) {
    return (
      <div style={{ 
        height: '100vh', 
        background: '#020617', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <form className="glass-panel" onSubmit={handleMasterLogin} style={{ padding: '3rem', borderRadius: '24px', width: '400px', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ color: 'white', marginBottom: '2rem' }}>Acesso Restrito Master</h2>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8' }}>Usuário</label>
            <input 
              type="text" 
              className="glass-input" 
              value={loginForm.user}
              onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ color: '#94a3b8' }}>Senha</label>
            <input 
              type="password" 
              className="glass-input" 
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Entrar no Painel</button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Carregando Painel Master...</div>;

  return (
    <div className="dashboard-container" style={{ background: '#020617', minHeight: '100vh', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '800' }}>Meu Controle <span style={{ color: 'var(--accent-primary)' }}>NFERIO</span></h1>
          <p style={{ color: '#94a3b8' }}>Gestão Administrativa do Negócio</p>
        </div>
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }}>
          <ShieldCheck color="var(--success)" size={20} />
          <span style={{ marginLeft: '0.5rem', color: 'white', fontWeight: '600' }}>Acesso Master</span>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card glass-panel animate-fade-in">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Empresas</span>
            <span className="stat-value">{stats?.totalCompanies || 0}</span>
          </div>
        </div>

        <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Clientes Pagantes</span>
            <span className="stat-value">{stats?.activeCompanies || 0}</span>
          </div>
        </div>

        <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Empresas em Trial</span>
            <span className="stat-value">{stats?.trialCompanies || 0}</span>
          </div>
        </div>

        <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">MRR Estimado</span>
            <span className="stat-value">{(stats?.monthlyRevenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
      </div>

      {/* System Health & Updates Control */}
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <ShieldCheck color="var(--success)" size={24} />
            </div>
            <div>
              <h3 style={{ color: 'white', margin: 0 }}>Integridade da ACBrLib</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Lógica Fiscal: <span style={{ color: 'var(--success)' }}>V. 2.0.26 (Estável)</span></p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', color: 'white', fontWeight: '600' }}>Auto-Update ACBr</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Atualizar lógica automaticamente</span>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem' }}>Lista de Empresas</h2>
          <div className="search-box" style={{ width: '300px' }}>
            <Search size={18} />
            <input type="text" placeholder="Buscar empresa ou CNPJ..." className="glass-input" />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>CNPJ</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Expira em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>
                  <div style={{ fontWeight: '600', color: 'white' }}>{company.razaoSocial}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{company._count?.users} usuários</div>
                </td>
                <td style={{ color: '#94a3b8' }}>{company.cnpj}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6'
                  }}>
                    {company.plan}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: company.subscriptionStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: company.subscriptionStatus === 'ACTIVE' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {company.subscriptionStatus}
                  </span>
                </td>
                <td style={{ color: '#94a3b8' }}>
                  {new Date(company.trialEndsAt).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Gerenciar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMaster;
