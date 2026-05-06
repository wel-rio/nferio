import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface StockAdjustmentModalProps {
  productId: string;
  productName: string;
  currentStock: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustmentModal({ productId, productName, currentStock, onClose, onSuccess }: StockAdjustmentModalProps) {
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/api/stock/adjust', {
        productId,
        quantity,
        type,
        reason,
        companyId: 'default-company-id' // Ajustar para pegar do contexto no futuro
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao ajustar estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '450px' }}>
        <div className="modal-header">
          <h2>Ajustar Estoque: <span style={{ color: 'var(--accent-primary)' }}>{productName}</span></h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <span style={{ color: '#94a3b8' }}>Estoque Atual:</span>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>{currentStock}</span>
          </div>

          <div className="form-group">
            <label>Tipo de Ajuste</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button 
                type="button"
                className={`btn-secondary ${type === 'IN' ? 'active-success' : ''}`}
                style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}
                onClick={() => setType('IN')}
              >
                <ArrowUpCircle size={20} /> Entrada
              </button>
              <button 
                type="button"
                className={`btn-secondary ${type === 'OUT' ? 'active-error' : ''}`}
                style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}
                onClick={() => setType('OUT')}
              >
                <ArrowDownCircle size={20} /> Saída
              </button>
              <button 
                type="button"
                className={`btn-secondary ${type === 'ADJUST' ? 'active-accent' : ''}`}
                style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}
                onClick={() => setType('ADJUST')}
              >
                <RefreshCw size={20} /> Balanço
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Quantidade</label>
            <input 
              type="number" 
              className="glass-input" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Motivo / Justificativa</label>
            <input 
              type="text" 
              className="glass-input" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Quebra, Inventário, Perda..."
              required
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar Ajuste'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .active-success { border-color: var(--success) !important; background: rgba(16, 185, 129, 0.1) !important; color: var(--success) !important; }
        .active-error { border-color: var(--error) !important; background: rgba(239, 68, 68, 0.1) !important; color: var(--error) !important; }
        .active-accent { border-color: var(--accent-primary) !important; background: rgba(139, 92, 246, 0.1) !important; color: var(--accent-primary) !important; }
      `}</style>
    </div>
  );
}
