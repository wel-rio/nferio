import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Package, 
  Search,
  ChevronDown
} from 'lucide-react';

export default function Reports() {
  const { company } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Filtros
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'ALL',
    type: 'ALL',
    productId: ''
  });

  const fetchReport = async () => {
    if (!company) return;
    try {
      setLoading(true);
      const endpoint = activeTab === 'sales' ? '/reports/sales' : '/reports/stock';
      const res = await api.get(endpoint, {
        params: { 
          companyId: company.id,
          ...filters
        }
      });
      setData(res.data);
    } catch (error) {
      console.error('Erro ao buscar relatório', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, company]);

  const handleExport = () => {
    if (!data || !data.data) return;
    
    // Simples exportação CSV
    const headers = activeTab === 'sales' 
      ? ['Nº Pedido', 'Cliente', 'Data', 'Valor Líquido', 'Status']
      : ['Produto', 'Tipo', 'Qtd', 'Motivo', 'Data'];
    
    const rows = data.data.map((item: any) => {
      if (activeTab === 'sales') {
        return [item.orderNumber, item.customerName || 'Consumidor', new Date(item.createdAt).toLocaleDateString(), item.netAmount, item.status];
      } else {
        return [item.product.name, item.type, item.quantity, item.reason, new Date(item.createdAt).toLocaleDateString()];
      }
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${activeTab}_${filters.startDate}_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header">
        <div>
          <h2>Central de Relatórios</h2>
          <p className="text-muted">Analise o desempenho e movimentações do seu negócio</p>
        </div>
        <button className="btn-secondary" onClick={handleExport} disabled={!data}>
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      <div className="tabs-container glass-panel" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`} 
          onClick={() => setActiveTab('sales')}
        >
          <BarChart3 size={18} /> Vendas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`} 
          onClick={() => setActiveTab('stock')}
        >
          <Package size={18} /> Movimentação de Estoque
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fiscal' ? 'active' : ''}`} 
          onClick={() => setActiveTab('fiscal')}
        >
          <FileText size={18} /> Livro Fiscal
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div className="form-group">
            <label><Calendar size={14} /> Data Inicial</label>
            <input type="date" className="glass-input" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label><Calendar size={14} /> Data Final</label>
            <input type="date" className="glass-input" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          
          {activeTab === 'sales' && (
            <div className="form-group">
              <label><Filter size={14} /> Status</label>
              <select className="glass-input" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="ALL">Todos os Status</option>
                <option value="ORCAMENTO">Orçamentos</option>
                <option value="PEDIDO">Pedidos</option>
                <option value="FATURADO">Faturados</option>
              </select>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="form-group">
              <label><Filter size={14} /> Tipo</label>
              <select className="glass-input" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                <option value="ALL">Entradas e Saídas</option>
                <option value="IN">Apenas Entradas</option>
                <option value="OUT">Apenas Saídas</option>
              </select>
            </div>
          )}

          <button className="btn-primary" onClick={fetchReport} style={{ height: '42px' }}>
            <Search size={18} /> Filtrar
          </button>
        </div>
      </div>

      {data && (
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
          {activeTab === 'sales' ? (
            <>
              <div className="stat-card glass-panel">
                <h3>Total de Pedidos</h3>
                <p className="stat-value">{data.summary.count}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Valor Bruto</h3>
                <p className="stat-value text-accent">{data.summary.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Ticket Médio</h3>
                <p className="stat-value text-success">
                  {(data.summary.totalAmount / (data.summary.count || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card glass-panel">
                <h3>Movimentações</h3>
                <p className="stat-value">{data.summary.count}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Entradas (Volume)</h3>
                <p className="stat-value text-success">{data.summary.in}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Saídas (Volume)</h3>
                <p className="stat-value text-error">{data.summary.out}</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            {activeTab === 'sales' ? (
              <tr>
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor Líquido</th>
                <th>Status</th>
              </tr>
            ) : (
              <tr>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Motivo</th>
                <th>Data</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Gerando relatório...</td></tr>
            ) : !data || data.data.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">Nenhum dado encontrado para o filtro selecionado.</td></tr>
            ) : (
              data.data.map((item: any) => (
                <tr key={item.id}>
                  {activeTab === 'sales' ? (
                    <>
                      <td>#{item.orderNumber}</td>
                      <td>{item.customerName || 'Consumidor'}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{item.netAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td>
                        <span className={`badge-${item.status === 'FATURADO' ? 'success' : 'warning'}`}>
                          {item.status}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.product.name}</td>
                      <td>
                        {item.type === 'IN' ? 
                          <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowDownLeft size={14} /> Entrada</span> : 
                          <span className="text-error" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={14} /> Saída</span>
                        }
                      </td>
                      <td>{item.quantity} {item.product.unit}</td>
                      <td>{item.reason}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
