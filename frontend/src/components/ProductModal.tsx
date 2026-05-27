import React, { useState } from 'react';
import { X, Package, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import NcmSearchModal from './NcmSearchModal';

interface ProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ onClose, onSuccess }: ProductModalProps) {
  const { company } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: 0,
    cost: 0,
    stock: 0,
    ncm: '',
    category: 'Móveis'
  });

  const [isNcmModalOpen, setIsNcmModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      const { error } = await supabase
        .from('Product')
        .insert([{
          name: formData.name,
          sku: formData.sku,
          barcode: formData.barcode,
          price: Number(formData.price),
          cost: Number(formData.cost),
          stock: Number(formData.stock),
          ncm: formData.ncm,
          category: formData.category,
          companyId: company.id
        }]);

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Erro ao salvar produto: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '600px' }}>
        <div className="modal-header">
          <h2><Package size={20} /> Novo Produto</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome do Produto</label>
            <input type="text" className="glass-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          
          <div className="form-group">
            <label>SKU / Ref</label>
            <input type="text" className="glass-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Código de Barras (EAN)</label>
            <input type="text" className="glass-input" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Preço de Venda (R$)</label>
            <input type="number" step="0.01" className="glass-input" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
          </div>

          <div className="form-group">
            <label>Estoque Inicial</label>
            <input type="number" className="glass-input" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Classificação Fiscal (NCM)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Ex: 94035000"
                value={formData.ncm} 
                onChange={e => setFormData({...formData, ncm: e.target.value})} 
                required 
              />
              <button 
                type="button" 
                className="btn-secondary" 
                title="Assistente de NCM"
                onClick={() => setIsNcmModalOpen(true)}
              >
                <Search size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Obrigatório para emissão de NF-e</p>
          </div>

          <div className="modal-footer" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Produto</button>
          </div>
        </form>
      </div>

      {isNcmModalOpen && (
        <NcmSearchModal 
          onClose={() => setIsNcmModalOpen(false)} 
          onSelect={(ncm) => {
            setFormData({...formData, ncm});
            setIsNcmModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
