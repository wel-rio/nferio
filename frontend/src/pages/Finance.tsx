import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Finance() {
  const { company } = useAuth();
  const [activeTab, setActiveTab] = useState<'PAYABLE' | 'RECEIVABLE'>('PAYABLE');
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalPayable: 0, totalReceivable: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    if (!company) return;
    try {
      setLoading(true);
      const endpoint = activeTab === 'PAYABLE' ? 'payables' : 'receivables';
      const [resData, resSummary] = await Promise.all([
        api.get(`/finance/${endpoint}`, { params: { companyId: company.id } }),
        api.get('/finance/summary', { params: { companyId: company.id } })
      ]);
      setData(resData.data);
      setSummary(resSummary.data);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const filteredData = data.filter(item => 
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header">
        <div>
          <h2>Gestão Financeira</h2>
          <p className="text-muted">Controle total de entradas e saídas</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setActiveTab('RECEIVABLE')}>
            <ArrowUpCircle size={18} color="var(--success)" /> Novo Recebimento
          </button>
          <button className="btn-primary" style={{ background: 'var(--error)' }} onClick={() => setActiveTab('PAYABLE')}>
            <ArrowDownCircle size={18} /> Novo Pagamento
          </button>
        </div>
      </div>

      {/* Indicadores Principais */}
      <div className="stats-row">
        <div className="stat-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>A Receber</h3>
            <ArrowUpCircle size={16} color="var(--success)" />
          </div>
          <p className="stat-value text-success">R$ {summary.totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pendentes de entrada</span>
        </div>
        
        <div className="stat-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>A Pagar</h3>
            <ArrowDownCircle size={16} color="var(--error)" />
          </div>
          <p className="stat-value text-error">R$ {summary.totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pendentes de saída</span>
        </div>

        <div className="stat-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Saldo Projetado</h3>
            <DollarSign size={16} color="var(--accent-primary)" />
          </div>
          <p className={`stat-value ${summary.balance >= 0 ? 'text-accent' : 'text-error'}`}>
            R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Resultado do mês</span>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          className={`tab-btn ${activeTab === 'PAYABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('PAYABLE')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'PAYABLE' ? 'var(--error)' : '#64748b',
            borderBottom: activeTab === 'PAYABLE' ? '2px solid var(--error)' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Contas a Pagar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'RECEIVABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('RECEIVABLE')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'RECEIVABLE' ? 'var(--success)' : '#64748b',
            borderBottom: activeTab === 'RECEIVABLE' ? '2px solid var(--success)' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Contas a Receber
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-box" style={{ width: '100%' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`Buscar em ${activeTab === 'PAYABLE' ? 'Contas a Pagar' : 'Contas a Receber'}...`} 
              className="glass-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Descrição / Origem</th>
              <th>Vencimento</th>
              <th>Valor (R$)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Carregando dados...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  <AlertCircle size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                  <p>Nenhuma conta {activeTab === 'PAYABLE' ? 'a pagar' : 'a receber'} encontrada.</p>
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'white' }}>{item.description}</div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {item.nfeNumber ? `NFe: ${item.nfeNumber}` : 'Lançamento Manual'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#94a3b8" />
                      {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700', color: activeTab === 'PAYABLE' ? 'var(--error)' : 'var(--success)' }}>
                    {activeTab === 'PAYABLE' ? '- ' : '+ '} 
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background: item.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.status === 'PAID' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {item.status === 'PAID' ? 'LIQUIDADO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn" title="Dar Baixa"><CheckCircle size={16} /></button>
                      <button className="icon-btn"><Edit size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .tab-btn:hover {
          background: rgba(255,255,255,0.02) !important;
        }
      `}</style>
    </div>
  );
}
