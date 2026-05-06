import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Trash2, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ onClose, onSuccess }: OrderModalProps) {
  const { company } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (company) {
      api.get('/products', { params: { companyId: company.id } }).then(res => setProducts(res.data));
    }
  }, [company]);

  const addItem = (product: any) => {
    const existing = selectedItems.find(i => i.productId === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(i => i.productId !== id));
  };

  const total = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    if (selectedItems.length === 0) return alert('Adicione pelo menos um item');
    
    try {
      await api.post('/orders', {
        customerName,
        items: selectedItems,
        total,
        status: 'ORCAMENTO',
        companyId: company.id
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao salvar pedido');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '800px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="modal-header">
            <h2><Search size={20} /> Selecionar Produtos</h2>
          </div>
          <div className="search-box" style={{ marginBottom: '1rem' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar produto..." 
              className="glass-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', cursor: 'pointer', borderRadius: '8px', marginBottom: '4px' }} onClick={() => addItem(p)}>
                <div>
                  <div style={{ fontWeight: '600' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estoque: {p.stock} {p.unit}</div>
                </div>
                <span className="text-accent">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header">
            <h2><ShoppingCart size={20} /> Carrinho</h2>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Nome do Cliente</label>
            <input type="text" className="glass-input" value={customerName} onChange={e => setCustomerName(e.target.value)} required placeholder="Ex: Consumidor Final" />
          </div>
          <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
            {selectedItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span>{item.name} x {item.quantity}</span>
                <div className="flex gap-2">
                  <span>R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <button className="icon-btn text-error" onClick={() => removeItem(item.productId)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {selectedItems.length === 0 && <p className="empty-state">Carrinho vazio</p>}
          </div>
          <div className="modal-footer" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <span className="text-muted">Total: </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit}>Salvar Pedido</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
