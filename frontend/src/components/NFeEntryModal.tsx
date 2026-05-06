import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import axios from 'axios';

interface NFeEntryModalProps {
  nfeData: any; // { nfeKey, nfeNumber, supplier, items: [{externalName, quantity, price, productId?}], installments: [{number, dueDate, amount}] }
  onClose: () => void;
  onSuccess: () => void;
}

export default function NFeEntryModal({ nfeData, onClose, onSuccess }: NFeEntryModalProps) {
  const [items, setItems] = useState(nfeData.items);
  const [installments, setInstallments] = useState(nfeData.installments);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Carregar produtos para o "match"
  React.useEffect(() => {
    axios.get('http://localhost:3333/api/products').then(res => setProducts(res.data));
  }, []);

  const handleMatchProduct = (index: number, productId: string) => {
    const newItems = [...items];
    newItems[index].productId = productId;
    setItems(newItems);
  };

  const handleAddInstallment = () => {
    setInstallments([...installments, { number: installments.length + 1, dueDate: '', amount: 0 }]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/api/fiscal/process-entry', {
        companyId: 'default-company-id',
        nfeData: {
          ...nfeData,
          items,
          installments
        }
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao processar entrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '90%', maxWidth: '1000px', height: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <h2>Conferência de Entrada - NF-e <span style={{ color: 'var(--accent-primary)' }}>#{nfeData.nfeNumber}</span></h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>Fornecedor: {nfeData.supplier.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', padding: '2rem' }}>
          {/* Itens da Nota */}
          <section>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '1.5rem' }}>
              <CheckCircle size={20} color="var(--accent-primary)" /> Itens da Nota vs. Seu Estoque
            </h3>
            <div className="table-container" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produto (Fornecedor)</th>
                    <th>Qtd</th>
                    <th>Seu Produto (Vínculo)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ maxWidth: '200px' }}>{item.externalName}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <select 
                          className="glass-input" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          value={item.productId || ''}
                          onChange={(e) => handleMatchProduct(idx, e.target.value)}
                        >
                          <option value="">-- Selecione ou Cadastre --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Financeiro */}
          <section>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '1.5rem' }}>
              <AlertCircle size={20} color="var(--warning)" /> Contas a Pagar (Faturas)
            </h3>
            <div className="installments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {installments.map((inst: any, idx: number) => (
                <div key={idx} className="glass-panel" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '50px 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: '#94a3b8' }}>#{inst.number}</span>
                  <input 
                    type="date" 
                    className="glass-input" 
                    value={inst.dueDate} 
                    onChange={(e) => {
                      const newInst = [...installments];
                      newInst[idx].dueDate = e.target.value;
                      setInstallments(newInst);
                    }} 
                  />
                  <input 
                    type="number" 
                    className="glass-input" 
                    value={inst.amount} 
                    onChange={(e) => {
                      const newInst = [...installments];
                      newInst[idx].amount = e.target.value;
                      setInstallments(newInst);
                    }} 
                  />
                </div>
              ))}
              <button className="btn-secondary" style={{ width: '100%' }} onClick={handleAddInstallment}>
                <Plus size={18} /> Adicionar Parcela
              </button>
            </div>
          </section>
        </div>

        <div className="modal-footer" style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8' }}>
            Total NF: <span style={{ color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>R$ {nfeData.totalAmount?.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Entrada e Financeiro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
