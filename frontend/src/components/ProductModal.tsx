import { useState } from 'react';
import { X, Package } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

interface ProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    costPrice: '',
    stock: '',
    unit: 'UN',
    ncm: '',
    cest: '',
    cfopPadrao: '',
    origem: '0'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/api/products', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in">
        <div className="modal-header">
          <h2><Package size={20} /> Novo Produto</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <h3>Dados Gerais</h3>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Nome do Produto *</label>
                <input required type="text" name="name" className="glass-input" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>SKU *</label>
                <input required type="text" name="sku" className="glass-input" value={formData.sku} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>EAN/GTIN (Cód. Barras)</label>
                <input type="text" name="barcode" className="glass-input" value={formData.barcode} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Preço de Venda (R$) *</label>
                <input required type="number" step="0.01" name="price" className="glass-input" value={formData.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Preço de Custo (R$)</label>
                <input type="number" step="0.01" name="costPrice" className="glass-input" value={formData.costPrice} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estoque Inicial</label>
                <input type="number" step="0.01" name="stock" className="glass-input" value={formData.stock} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Unidade</label>
                <select name="unit" className="glass-input" value={formData.unit} onChange={handleChange}>
                  <option value="UN">UN - Unidade</option>
                  <option value="KG">KG - Quilograma</option>
                  <option value="CX">CX - Caixa</option>
                  <option value="M">M - Metro</option>
                  <option value="L">L - Litro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Dados Fiscais (NFe / NFCe)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>NCM</label>
                <input type="text" name="ncm" className="glass-input" placeholder="Ex: 00000000" value={formData.ncm} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>CEST</label>
                <input type="text" name="cest" className="glass-input" value={formData.cest} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CFOP Padrão</label>
                <input type="text" name="cfopPadrao" className="glass-input" placeholder="Ex: 5102" value={formData.cfopPadrao} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Origem da Mercadoria</label>
                <select name="origem" className="glass-input" value={formData.origem} onChange={handleChange}>
                  <option value="0">0 - Nacional</option>
                  <option value="1">1 - Estrangeira (Importação Direta)</option>
                  <option value="2">2 - Estrangeira (Adquirida no Mercado Interno)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
