import React, { useState } from 'react';
import { X, Package, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../services/api';

interface StockModalProps {
  productId: string;
  productName: string;
  currentStock: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockModal({ productId, productName, currentStock, onClose, onSuccess }: StockModalProps) {
  const [formData, setFormData] = useState({
    quantity: 0,
    type: 'ADD', // ADD or REMOVE
    reason: 'Compra'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/products/${productId}/stock`, formData);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao atualizar estoque');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '400px' }}>
        <div className="modal-header">
          <h2>Ajuste Rápido de Estoque</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ marginBottom: '1rem', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Produto: <strong>{productName}</strong></p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Estoque Atual: <strong>{currentStock}</strong></p>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Tipo de Movimentação</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
              <button 
                type="button" 
                className={`btn-secondary ${formData.type === 'ADD' ? 'active' : ''}`}
                style={{ borderColor: formData.type === 'ADD' ? 'var(--success)' : '' }}
                onClick={() => setFormData({...formData, type: 'ADD'})}
              >
                <TrendingUp size={16} color="var(--success)" /> Entrada
              </button>
              <button 
                type="button" 
                className={`btn-secondary ${formData.type === 'REMOVE' ? 'active' : ''}`}
                style={{ borderColor: formData.type === 'REMOVE' ? 'var(--error)' : '' }}
                onClick={() => setFormData({...formData, type: 'REMOVE'})}
              >
                <TrendingDown size={16} color="var(--error)" /> Saída
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Quantidade</label>
            <input type="number" className="glass-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} required />
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
