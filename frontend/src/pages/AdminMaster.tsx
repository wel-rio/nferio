import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Building, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Plus, 
  Search,
  CheckCircle,
  AlertTriangle,
  Server
} from 'lucide-react';

export default function AdminMaster() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCompanies: 0, activeNow: 0, nfeIssued: 0 });
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resCompanies, resStats, resHealth] = await Promise.all([
        api.get('/admin/companies'),
        api.get('/admin/stats'),
        api.get('/health')
      ]);
      setCompanies(resCompanies.data);
      setStats(resStats.data);
      setHealth(resHealth.data);
    } catch (error) {
      console.error('Erro ao buscar dados do Admin Master');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="module-container animate-fade-in" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
      <div className="module-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '10px', borderRadius: '12px' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <div>
            <h2 style={{ color: 'white' }}>NFERIO Admin Master</h2>
            <p className="text-muted">Governança Centralizada e Controle de Licenças</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
            <Activity size={18} /> Logs do Sistema
          </button>
          <button className="btn-primary">
            <Plus size={18} /> Nova Licença / Empresa
          </button>
        </div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card glass-panel" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
          <h3>Total de Empresas</h3>
          <p className="stat-value" style={{ color: 'white' }}>{stats.totalCompanies}</p>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>+2 esta semana</span>
        </div>
        <div className="stat-card glass-panel" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
          <h3>Usuários Online</h3>
          <p className="stat-value text-accent">{stats.activeNow}</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sessões ativas</span>
        </div>
        <div className="stat-card glass-panel" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
          <h3>NFes Emitidas (Mês)</h3>
          <p className="stat-value text-success">{stats.nfeIssued}</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Volume total transacionado</span>
        </div>
        <div className="stat-card glass-panel" style={{ 
          border: `1px solid ${health?.acbr?.ready ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          background: health?.acbr?.ready ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
        }}>
          <h3>Motor Fiscal (ACBr)</h3>
          <p className="stat-value" style={{ 
            color: health?.acbr?.ready ? 'var(--success)' : 'var(--error)', 
            fontSize: '1.5rem' 
          }}>
            {health?.acbr?.status || 'VERIFICANDO...'}
          </p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <Server size={12} /> {health?.vps?.platform === 'linux' ? 'Oracle Cloud VPS' : 'Local Host'}
          </span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar por CNPJ, Razão Social ou ID..." className="glass-input" />
        </div>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Empresa / Cliente</th>
              <th>CNPJ</th>
              <th>Licença</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Monitorando ecossistema...</td></tr>
            ) : companies.map(company => (
              <tr key={company.id}>
                <td>
                  <div style={{ fontWeight: '600', color: 'white' }}>{company.razaoSocial}</div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {company.id}</span>
                </td>
                <td style={{ color: '#cbd5e1' }}>{company.cnpj}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'white', fontWeight: '500' }}>Plano Professional</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Expira em 12/2026</span>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--success)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    ATIVO
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                    Gerenciar <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
