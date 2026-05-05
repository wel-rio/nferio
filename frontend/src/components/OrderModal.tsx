import { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

interface OrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ onClose, onSuccess }: OrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    status: 'ORCAMENTO',
    customerName: '',
    customerDoc: '',
    discount: 0
  });

  const [items, setItems] = useState<{ productId: string, quantity: number, price: number, name: string }[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3333/api/products').then(res => setProducts(res.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItem = (productId: string) => {
    if (!productId) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = items.find(i => i.productId === productId);
    if (existing) {
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { productId, quantity: 1, price: product.price, name: product.name }]);
    }
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setItems(items.map(i => i.productId === productId ? { ...i, quantity } : i));
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const netTotal = total - Number(formData.discount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Adicione pelo menos um produto');
    
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/api/orders', {
        ...formData,
        discount: Number(formData.discount),
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2><ShoppingCart size={20} /> Novo Pedido / Orçamento</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Cliente</label>
              <input type="text" name="customerName" className="glass-input" placeholder="Consumidor Final" value={formData.customerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>CPF / CNPJ</label>
              <input type="text" name="customerDoc" className="glass-input" value={formData.customerDoc} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="glass-input" value={formData.status} onChange={handleChange}>
                <option value="ORCAMENTO">Orçamento</option>
                <option value="PEDIDO">Pedido (Baixar Estoque)</option>
              </select>
            </div>
          </div>

          <div className="divider"></div>

          <div className="form-row" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Adicionar Produto</label>
              <select className="glass-input" onChange={(e) => { addItem(e.target.value); e.target.value = ''; }}>
                <option value="">Selecione um produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="data-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Produto</th>
                <th width="100">Valor Un.</th>
                <th width="120">Quantidade</th>
                <th width="120">Subtotal</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-4">Nenhum item adicionado.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>
                      <input 
                        type="number" 
                        className="glass-input" 
                        style={{ padding: '4px 8px', height: '32px' }} 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                      />
                    </td>
                    <td>{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>
                      <button className="icon-btn text-error" onClick={() => removeItem(item.productId)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="form-row" style={{ marginTop: '1rem', justifyContent: 'flex-end', gap: '2rem' }}>
            <div className="form-group" style={{ maxWidth: '150px' }}>
              <label>Desconto (R$)</label>
              <input type="number" step="0.01" name="discount" className="glass-input" value={formData.discount} onChange={handleChange} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="text-muted" style={{ marginBottom: '0.25rem' }}>Subtotal: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <h2 className="text-accent" style={{ fontSize: '1.75rem' }}>
                {netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h2>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading || items.length === 0}>
            {loading ? 'Salvando...' : 'Confirmar ' + (formData.status === 'ORCAMENTO' ? 'Orçamento' : 'Pedido')}
          </button>
        </div>
      </div>
    </div>
  );
}
