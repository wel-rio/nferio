import { useState, useEffect, useRef } from 'react';
import { 
  Barcode, 
  ShoppingCart, 
  Scale, 
  Printer, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  X
} from 'lucide-react';
import axios from 'axios';
import { pdvService } from '../services/pdvService';
import './Pdv.css';

export default function Pdv() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentModal, setPaymentModal] = useState(false);
  const [cashModal, setCashModal] = useState(true); // Começa pedindo abertura
  const [cashAmount, setCashAmount] = useState('0');
  const [cashStatus, setCashStatus] = useState<'OPEN' | 'CLOSED'>('CLOSED');
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOfflineCount(pdvService.getOfflineCount());
    // ... rest of effect ...
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const result = await pdvService.syncOfflineSales();
    setOfflineCount(result.remaining || 0);
    setSyncing(false);
    if (result.synced > 0) alert(`${result.synced} vendas sincronizadas!`);
  };

  // Electron IPC (if running in Electron)
  const isElectron = window.hasOwnProperty('process');
  const ipcRenderer = isElectron ? (window as any).require('electron').ipcRenderer : null;

  useEffect(() => {
    axios.get('http://localhost:3333/api/products').then(res => setProducts(res.data));
    searchInputRef.current?.focus();

    if (ipcRenderer) {
      ipcRenderer.on('scale-data', (_: any, data: any) => {
        alert(`Peso capturado: ${data.weight}kg`);
        // Aqui você poderia aplicar o peso no item selecionado se for produto de peso
      });
      ipcRenderer.on('scale-error', (_: any, err: any) => {
        alert('Erro na Balança: ' + err);
      });
    }

    return () => {
      if (ipcRenderer) {
        ipcRenderer.removeAllListeners('scale-data');
        ipcRenderer.removeAllListeners('scale-error');
      }
    };
  }, []);

  useEffect(() => {
    const newTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [items]);

  const addToCart = (product: any) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      setItems(items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
    setSearch('');
  };

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === search || p.barcode === search);
    if (product) {
      addToCart(product);
    }
  };

  const readScale = () => {
    if (ipcRenderer) {
      ipcRenderer.send('read-scale');
    } else {
      alert('Funcionalidade disponível apenas na versão Desktop (.exe)');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); readScale(); }
      if (e.key === 'F5') { e.preventDefault(); setPaymentModal(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  const finalizeSale = async (method: string) => {
    try {
      const saleData = {
        status: 'PEDIDO',
        customerName: 'Consumidor PDV',
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod: method
      };

      const result = await pdvService.saveSale(saleData);

      // Solicita impressão via Electron
      if (ipcRenderer) {
        ipcRenderer.send('print-receipt', { orderId: result.data.id, items, total });
      }

      setOfflineCount(pdvService.getOfflineCount());
      alert(result.offline ? 'Venda salva offline. Sincronize quando houver internet.' : 'Venda Finalizada com Sucesso!');
      setItems([]);
      setPaymentModal(false);
    } catch (error) {
      alert('Erro ao finalizar venda');
    }
  };

  return (
    <div className="pdv-container">
      {/* Left side: Search and Items */}
      <div className="pdv-main">
        <header className="pdv-header">
          <div className="pdv-brand">
            <ShoppingCart className="text-accent" />
            <h1>NFERIO <span>PDV</span></h1>
          </div>
          <form className="pdv-search-bar" onSubmit={handleBarcodeSearch}>
            <Barcode size={24} className="text-muted" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Bipe o código ou digite o SKU (F1)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </header>

        <div className="pdv-items-list">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd</th>
                <th>V. Unit</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="animate-slide-in">
                  <td>
                    <span className="item-index">{index + 1}</span>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-sku">{item.sku}</span>
                    </div>
                  </td>
                  <td className="qty-cell">
                    <button onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}><Minus size={14}/></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}><Plus size={14}/></button>
                  </td>
                  <td>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="item-total">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <button className="delete-btn" onClick={() => setItems(items.filter(i => i.id !== item.id))}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="pdv-empty">
              <Barcode size={64} />
              <p>Aguardando bipa de produtos...</p>
            </div>
          )}
        </div>

        <footer className="pdv-actions">
          <div className="pdv-shortcuts">
            <span><strong>F1</strong> Buscar</span>
            <span><strong>F2</strong> Balança</span>
            <span><strong>F3</strong> CPF na Nota</span>
            <span><strong>ESC</strong> Cancelar</span>
          </div>
        </footer>
      </div>

      {/* Right side: Summary and Payment */}
      <div className="pdv-sidebar">
        <div className="summary-card glass-panel">
          <label>Total da Venda</label>
          <h2 className="total-value">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
          <div className="summary-details">
            <div className="detail-row">
              <span>Itens:</span>
              <span>{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
            </div>
          </div>
        </div>

        <div className="pdv-hardware-status">
          <div className="status-item online">
            <Printer size={16} /> Impressora OK
          </div>
          <div className="status-item offline">
            <Scale size={16} /> Balança (Desconectada)
          </div>
        </div>

        <button 
          className="btn-pay" 
          disabled={items.length === 0}
          onClick={() => setPaymentModal(true)}
        >
          <CreditCard size={24} /> FINALIZAR (F5)
        </button>
      </div>

      {/* Cash Flow Opening Modal */}
      {cashModal && cashStatus === 'CLOSED' && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px', padding: '2rem' }}>
            <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Abertura de Caixa</h2>
            <div className="form-group">
              <label>Valor em Fundo de Caixa (R$)</label>
              <input 
                type="number" 
                className="glass-input" 
                style={{ fontSize: '2rem', textAlign: 'center' }} 
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
              />
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '2rem', padding: '1.5rem' }}
              onClick={() => { setCashStatus('OPEN'); setCashModal(false); }}
            >
              ABRIR CAIXA
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel pdv-payment-modal">
            <div className="modal-header">
              <h2><Banknote size={24} /> Forma de Pagamento</h2>
              <button className="icon-btn" onClick={() => setPaymentModal(false)}><X size={24}/></button>
            </div>
            <div className="payment-grid">
              <button className="payment-btn" onClick={() => finalizeSale('DINHEIRO')}>
                <Banknote size={32} />
                <span>Dinheiro (F6)</span>
              </button>
              <button className="payment-btn" onClick={() => finalizeSale('CARTAO')}>
                <CreditCard size={32} />
                <span>Cartão (F7)</span>
              </button>
              <button className="payment-btn" onClick={() => finalizeSale('PIX')}>
                <div className="pix-icon">PIX</div>
                <span>PIX (F8)</span>
              </button>
            </div>
            <div className="payment-total">
              <label>A pagar</label>
              <h1>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h1>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
