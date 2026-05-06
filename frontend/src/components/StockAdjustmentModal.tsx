import React, { useState } from 'react';
import { X, Edit3, Clipboard } from 'lucide-react';
import api from '../services/api';

interface StockAdjustmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustmentModal({ onClose, onSuccess }: StockAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    newQuantity: 0,
    reason: 'Inventário'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stock/adjust', {
        ...formData,
        companyId: 'default-company-id'
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao realizar ajuste');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '400px' }}>
        <div className="modal-header">
          <h2><Clipboard size={20} /> Ajuste de Inventário</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>ID do Produto</label>
            <input type="text" className="glass-input" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Nova Quantidade Real</label>
            <input type="number" className="glass-input" value={formData.newQuantity} onChange={e => setFormData({...formData, newQuantity: Number(e.target.value)})} required />
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Atualizar Saldo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
