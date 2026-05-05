import { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

interface StockModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockModal({ productId, productName, onClose, onSuccess }: StockModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'IN',
    quantity: '',
    reason: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:3333/api/products/${productId}/stock`, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao movimentar estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2><ArrowRightLeft size={20} /> Movimentar Estoque</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="text-muted" style={{ marginBottom: '-0.5rem' }}>Produto: <strong>{productName}</strong></p>
          
          <div className="form-group">
            <label>Tipo de Movimentação</label>
            <select name="type" className="glass-input" value={formData.type} onChange={handleChange}>
              <option value="IN">Entrada (IN)</option>
              <option value="OUT">Saída (OUT)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade *</label>
            <input required type="number" step="0.01" name="quantity" className="glass-input" value={formData.quantity} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Motivo / Observação</label>
            <input type="text" name="reason" className="glass-input" placeholder="Ex: Compra de mercadoria" value={formData.reason} onChange={handleChange} />
          </div>

          <div className="modal-footer" style={{ padding: '0', border: 'none', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? '...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
