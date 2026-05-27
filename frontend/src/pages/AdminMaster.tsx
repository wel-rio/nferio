import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  Server,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';

export default function AdminMaster() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [masterPass, setMasterPass] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalCompanies: 0, activeNow: 0, nfeIssued: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMasterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPass === '@Mater2026') {
      setIsAuthorized(true);
      fetchAdminData();
    } else {
      alert('Senha Master Incorreta!');
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar Empresas
      const { data: companiesData, error: compErr } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (compErr) throw compErr;
      setCompanies(companiesData || []);

      // 2. Calcular Stats
      const { count: totalCompanies } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalCompanies: totalCompanies || 0,
        activeNow: 1, // Simulado
        nfeIssued: 0 // Seria uma soma de registros fiscais
      });

    } catch (error) {
      console.error('Erro ao buscar dados do Admin Master:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('TEM CERTEZA? Isso apagará a empresa e TODOS os seus dados permanentemente.')) return;
    try {
      setLoading(true);
      // O ideal aqui seria um ON DELETE CASCADE no banco, ou deletar cada tabela
      const { error } = await supabase.from('empresas').delete().eq('id', id);
      if (error) throw error;
      
      alert('Empresa removida com sucesso!');
      fetchAdminData();
    } catch (error: any) {
      alert('Erro ao remover empresa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFiscalUrl = async (id: string, url: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ fiscal_api_url: url })
        .eq('id', id);
      
      if (error) throw error;
      alert('URL Fiscal atualizada!');
    } catch (error: any) {
      alert('Erro ao atualizar URL: ' + error.message);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
        <div className="glass-panel" style={{ padding: '2rem', width: '400px', textAlign: 'center' }}>
          <div style={{ background: 'var(--accent-primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock color="white" size={30} />
          </div>
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Acesso Restrito</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Digite a senha Master para prosseguir</p>
          <form onSubmit={handleMasterLogin}>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="Senha Master" 
              autoFocus
              value={masterPass}
              onChange={e => setMasterPass(e.target.value)}
              style={{ marginBottom: '1rem', textAlign: 'center' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Entrar no Painel Master</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredCompanies = companies.filter(c => 
    c.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj?.includes(searchTerm)
  );

  return (
    <div className="module-container animate-fade-in" style={{ background: 'rgba(15, 23, 42, 0.95)', minHeight: '100vh' }}>
      <div className="module-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '10px', borderRadius: '12px' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <div>
            <h2 style={{ color: 'white' }}>NFERIO Admin Master</h2>
            <p className="text-muted">Governança Centralizada e Gestão Stateless</p>
          </div>
        </div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card glass-panel" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
          <h3>Total de Empresas</h3>
          <p className="stat-value" style={{ color: 'white' }}>{stats.totalCompanies}</p>
          <span className="text-success" style={{ fontSize: '0.8rem' }}>Monitorando base</span>
        </div>
        <div className="stat-card glass-panel" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
          <h3>Usuários Online</h3>
          <p className="stat-value text-accent">{stats.activeNow}</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sessões ativas</span>
        </div>
        <div className="stat-card glass-panel" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
          <h3>Status Geral</h3>
          <p className="stat-value text-success">OK</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Infraestrutura estável</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por CNPJ ou Razão Social..." 
            className="glass-input" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>CNPJ</th>
              <th>URL API Fiscal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Monitorando ecossistema...</td></tr>
            ) : filteredCompanies.map(company => (
              <tr key={company.id}>
                <td>
                  <div style={{ fontWeight: '600', color: 'white' }}>{company.razao_social}</div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {company.id}</span>
                </td>
                <td style={{ color: '#cbd5e1' }}>{company.cnpj}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Globe size={14} color="#94a3b8" />
                    <input 
                      type="text" 
                      className="glass-input" 
                      style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                      defaultValue={company.fiscal_api_url}
                      onBlur={(e) => handleUpdateFiscalUrl(company.id, e.target.value)}
                      placeholder="https://sua-vps.com/api/fiscal"
                    />
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '5px 10px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)' }}
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h3 style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <AlertTriangle size={20} /> Zona de Perigo (Manutenção Global)
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Estas ações são irreversíveis e afetam a integridade dos dados das empresas selecionadas. Use com cautela.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            onClick={async () => {
              const companyId = prompt('Digite o ID da empresa para LIMPAR PEDIDOS:');
              if (!companyId) return;
              if (confirm('Limpar TODOS os pedidos desta empresa?')) {
                const { error } = await supabase.from('Order').delete().eq('companyId', companyId);
                alert(error ? 'Erro: ' + error.message : 'Pedidos limpos!');
              }
            }}
          >
            Limpar Pedidos (Empresa)
          </button>

          <button 
            className="btn-secondary" 
            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            onClick={async () => {
              const companyId = prompt('Digite o ID da empresa para RESETAR ESTOQUE:');
              if (!companyId) return;
              if (confirm('Zerar o estoque de TODOS os produtos desta empresa?')) {
                const { error } = await supabase.from('Product').update({ stock: 0 }).eq('companyId', companyId);
                alert(error ? 'Erro: ' + error.message : 'Estoque zerado!');
              }
            }}
          >
            Zerar Estoque (Empresa)
          </button>

          <button 
            className="btn-secondary" 
            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            onClick={async () => {
              if (confirm('LIMPAR TODOS OS LOGS DE ACESSO DO SISTEMA?')) {
                const { error } = await supabase.from('CashFlow').delete().neq('id', '0');
                alert(error ? 'Erro: ' + error.message : 'Logs limpos!');
              }
            }}
          >
            Limpar Logs Globais
          </button>
        </div>
      </div>
    </div>
  );
}
