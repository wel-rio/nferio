import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileDown, Search, Filter, Calendar, Package, ArrowDownLeft } from 'lucide-react';
import NFeEntryModal from '../components/NFeEntryModal';

export default function Inbound() {
  const { company } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!company) return;
    try {
      setLoading(true);
      // Reutilizando a rota de financeiro para mostrar as notas a pagar
      const res = await api.get('/finance/payables', { params: { companyId: company.id } });
      setHistory(res.data.filter((i: any) => i.nfeKey)); // Filtra apenas as que têm chave de nota
    } catch (error) {
      console.error('Erro ao buscar histórico de entradas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [company]);

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header">
        <div>
          <h2>Entrada de Mercadorias (XML)</h2>
          <p className="text-muted">Importe notas de compra para alimentar estoque e financeiro</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <FileDown size={18} /> Importar Nova NF-e
        </button>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card glass-panel">
          <h3>Notas Importadas (Mês)</h3>
          <p className="stat-value">{history.length}</p>
        </div>
        <div className="stat-card glass-panel">
          <h3>Total em Compras</h3>
          <p className="stat-value text-accent">
            {history.reduce((acc, h) => acc + h.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="table-container glass-panel" style={{ marginTop: '2rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Nº Nota</th>
              <th>Data Emissão</th>
              <th>Valor Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Carregando histórico...</td></tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  <Package size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                  <p>Nenhuma nota de entrada importada ainda.</p>
                </td>
              </tr>
            ) : (
              history.map(h => (
                <tr key={h.id}>
                  <td>{h.description.split('-')[0].replace('Compra NFe', '').trim()}</td>
                  <td>#{h.description.match(/NFe (\d+)/)?.[1] || '-'}</td>
                  <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: '600' }}>{h.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownLeft size={14} /> Processado
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <NFeEntryModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchHistory} 
        />
      )}
    </div>
  );
}
