import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Search, Filter, ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar, TrendingUp, Edit } from 'lucide-react';

export default function Finance() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3333/api/finance/payables', {
        params: { companyId: 'default-company-id' }
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Erro ao buscar financeiro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const totalPayable = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = transactions.filter(t => t.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header">
        <div>
          <h2>Gestão Financeira e Fluxo de Caixa</h2>
          <p className="text-muted">Controle de contas a pagar, receber e conciliação</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary"><ArrowUpCircle size={18} /> Nova Receita</button>
          <button className="btn-primary" style={{ background: 'var(--error)' }}><ArrowDownCircle size={18} /> Nova Despesa</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total a Pagar</h3>
            <TrendingUp size={16} color="var(--error)" />
          </div>
          <p className="stat-value">R$ {totalPayable.toLocaleString('pt-BR')}</p>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pendentes: R$ {totalPending.toLocaleString('pt-BR')}</span>
        </div>
        <div className="stat-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total Pago</h3>
            <CheckCircle size={16} color="var(--success)" />
          </div>
          <p className="stat-value text-success">R$ {totalPaid.toLocaleString('pt-BR')}</p>
        </div>
        <div className="stat-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Saldo Projetado</h3>
            <DollarSign size={16} color="var(--accent-primary)" />
          </div>
          <p className="stat-value text-accent">R$ {(15000 - totalPending).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-box" style={{ width: '400px' }}>
            <Search size={18} />
            <input type="text" placeholder="Buscar por fornecedor ou descrição..." className="glass-input" />
          </div>
          <div className="flex gap-2">
            <button className={`btn-secondary ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Todos</button>
            <button className={`btn-secondary ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>Pendentes</button>
            <button className={`btn-secondary ${filter === 'PAID' ? 'active' : ''}`} onClick={() => setFilter('PAID')}>Pagos</button>
          </div>
        </div>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Descrição / Fornecedor</th>
              <th>Vencimento</th>
              <th>Valor (R$)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Carregando...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">Nenhuma conta encontrada.</td></tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'white' }}>{t.description}</div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ref: {t.nfeNumber || 'Manual'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="#94a3b8" />
                      {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td style={{ fontWeight: '700' }}>R$ {t.amount.toLocaleString('pt-BR')}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background: t.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: t.status === 'PAID' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {t.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
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
    </div>
  );
}

// Re-using CheckCircle from lucide-react if needed or defining here
function CheckCircle({ size, color }: { size: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
