import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  ShoppingCart, 
  ReceiptText, 
  LogOut,
  Menu,
  X,
  ArrowRightLeft,
  Inbox,
  Users,
  Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductModal from '../components/ProductModal';
import StockModal from '../components/StockModal';
import OrderModal from '../components/OrderModal';
import UserModal from '../components/UserModal';
import './Dashboard.css';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };
  
  // Stock Modal State
  const [stockModalData, setStockModalData] = useState<{ isOpen: boolean, productId: string, productName: string }>({
    isOpen: false,
    productId: '',
    productName: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

// Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const convertOrder = async (id: string) => {
    try {
      await axios.post(`http://localhost:3333/api/orders/${id}/convert`);
      fetchOrders();
      fetchProducts(); // Update stock in products tab
    } catch (error) {
      alert('Erro ao converter pedido');
    }
  };

  // Finance State
  const [financeSummary, setFinanceSummary] = useState<any>({ totalReceivable: 0, recentMoves: [] });

  const fetchFinance = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/finance/summary');
      setFinanceSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch finance', error);
    }
  };

  // Config State
  const [companyConfig, setCompanyConfig] = useState<any>(null);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('http://localhost:3333/api/config');
      setCompanyConfig(res.data);
    } catch (error) {
      console.error('Failed to fetch config', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'sales') {
      fetchOrders();
      fetchProducts(); // Need products for the modal
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'financeiro') {
      fetchFinance();
    } else if (activeTab === 'config') {
      fetchConfig();
    }
  }, [activeTab]);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <ReceiptText size={28} className="text-accent" />
            {sidebarOpen && <h2>NFERIO</h2>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            {sidebarOpen && <span>Início</span>}
          </button>
          <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={20} />
            {sidebarOpen && <span>Produtos</span>}
          </button>
          <button className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
            <ShoppingCart size={20} />
            {sidebarOpen && <span>Vendas & PDV</span>}
          </button>
          <button className={`nav-item ${activeTab === 'recebimentos' ? 'active' : ''}`} onClick={() => setActiveTab('recebimentos')}>
            <Inbox size={20} />
            {sidebarOpen && <span>Recebimentos (Entradas)</span>}
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} />
            {sidebarOpen && <span>Usuários</span>}
          </button>
          <button className={`nav-item ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>
            <Wallet size={20} />
            {sidebarOpen && <span>Financeiro</span>}
          </button>
          <button className={`nav-item ${activeTab === 'fiscal' ? 'active' : ''}`} onClick={() => setActiveTab('fiscal')}>
            <ReceiptText size={20} />
            {sidebarOpen && <span>Notas Fiscais (Saídas)</span>}
          </button>
          <div className="nav-divider"></div>
          <button className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            <Settings size={20} />
            {sidebarOpen && <span>Configurações</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item text-error" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header glass-panel">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="company-name">Sua Empresa LTDA</span>
            </div>
          </div>
        </header>

        <div className="content-area animate-fade-in">
          {activeTab === 'dashboard' && (
            <div className="module-container animate-fade-in">
              <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card glass-panel">
                  <h3>Vendas Hoje</h3>
                  <p className="stat-value">R$ 4.250,00</p>
                </div>
                <div className="stat-card glass-panel">
                  <h3>NFe Emitidas</h3>
                  <p className="stat-value">12</p>
                </div>
                <div className="stat-card glass-panel">
                  <h3>Recebimentos</h3>
                  <p className="stat-value text-accent">R$ 8.900,00</p>
                </div>
                <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
                  <h3>Lucratividade</h3>
                  <p className="stat-value text-success">32%</p>
                </div>
              </div>

              <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-muted">Gráfico de Vendas Semanais (Implementar Chart.js)</p>
              </div>
            </div>
          )}
          
          {activeTab === 'products' && (() => {
            const totalProducts = products.length;
            const lowStock = products.filter(p => p.stock < 5).length;
            const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Gestão de Produtos e Estoque</h2>
                  <button className="btn-primary" onClick={() => setIsProductModalOpen(true)}>
                    <Package size={18} /> Novo Produto
                  </button>
                </div>

                <div className="stats-row">
                  <div className="stat-card glass-panel">
                    <h3>Total de Produtos</h3>
                    <p className="stat-value">{totalProducts}</p>
                  </div>
                  <div className="stat-card glass-panel">
                    <h3>Estoque Baixo</h3>
                    <p className="stat-value text-warning">{lowStock}</p>
                  </div>
                  <div className="stat-card glass-panel">
                    <h3>Valor em Estoque</h3>
                    <p className="stat-value text-accent">
                      {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>

                <div className="table-container glass-panel">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Código (SKU)</th>
                        <th>Produto</th>
                        <th>NCM</th>
                        <th>Preço (R$)</th>
                        <th>Estoque</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="empty-state">
                            <Package size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                            <p>Nenhum produto cadastrado ainda.</p>
                          </td>
                        </tr>
                      ) : (
                        products.map(product => (
                          <tr key={product.id}>
                            <td>{product.sku}</td>
                            <td>{product.name}</td>
                            <td>{product.ncm || '-'}</td>
                            <td>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                background: product.stock < 5 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: product.stock < 5 ? 'var(--warning)' : 'var(--success)'
                              }}>
                                {product.stock} {product.unit}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="icon-btn" 
                                title="Movimentar Estoque"
                                onClick={() => setStockModalData({ isOpen: true, productId: product.id, productName: product.name })}
                              >
                                <ArrowRightLeft size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Modals */}
                {isProductModalOpen && (
                  <ProductModal 
                    onClose={() => setIsProductModalOpen(false)} 
                    onSuccess={fetchProducts} 
                  />
                )}
                
                {stockModalData.isOpen && (
                  <StockModal 
                    productId={stockModalData.productId}
                    productName={stockModalData.productName}
                    onClose={() => setStockModalData({ isOpen: false, productId: '', productName: '' })}
                    onSuccess={fetchProducts}
                  />
                )}
              </div>
            );
          })()}

          {activeTab === 'sales' && (() => {
            const orcamentos = orders.filter(o => o.status === 'ORCAMENTO').length;
            const pedidos = orders.filter(o => o.status === 'PEDIDO' || o.status === 'FATURADO').length;

            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Vendas e Orçamentos</h2>
                  <div className="header-actions">
                    <button className="btn-secondary" onClick={() => window.open('/pdv', '_blank')}>
                      <LayoutDashboard size={18} /> Abrir PDV Desktop
                    </button>
                    <button className="btn-primary" onClick={() => setIsOrderModalOpen(true)}>
                      <ShoppingCart size={18} /> Novo Orçamento / Pedido
                    </button>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-card glass-panel">
                    <h3>Total de Vendas Realizadas</h3>
                    <p className="stat-value text-success">{pedidos}</p>
                  </div>
                  <div className="stat-card glass-panel">
                    <h3>Orçamentos Pendentes</h3>
                    <p className="stat-value text-warning">{orcamentos}</p>
                  </div>
                </div>

                <div className="table-container glass-panel">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nº</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Total (R$)</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="empty-state">
                            <ShoppingCart size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                            <p>Nenhuma venda ou orçamento encontrado.</p>
                          </td>
                        </tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.orderNumber}</td>
                            <td>{order.customerName || 'Consumidor Final'}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td>{order.netAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                background: order.status === 'ORCAMENTO' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: order.status === 'ORCAMENTO' ? 'var(--warning)' : 'var(--success)'
                              }}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                {order.status === 'ORCAMENTO' && (
                                  <button 
                                    className="btn-secondary" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    onClick={() => convertOrder(order.id)}
                                  >
                                    Aprovar
                                  </button>
                                )}
                                {order.status === 'PEDIDO' && (
                                  <button 
                                    className="btn-primary" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    onClick={async () => {
                                      const { sefazService } = await import('../services/sefazService');
                                      const items = order.items.map((i: any) => ({ ...i.product, quantity: i.quantity }));
                                      const txt = sefazService.generateNFeTxt(order, companyConfig, items);
                                      const isElectron = window.hasOwnProperty('process');
                                      if (isElectron) {
                                        const ipc = (window as any).require('electron').ipcRenderer;
                                        ipc.send('emit-nfe', { txtContent: txt });
                                        ipc.once('nfe-success', async (event: any, res: any) => {
                                          alert(`Nota Autorizada via ACBrLib LOCAL! Chave: ${res.chave}`);
                                          await axios.post(`http://localhost:3333/api/orders/${order.id}/convert`);
                                          fetchOrders();
                                        });
                                      } else {
                                        // 2b. Se for WEB, envia para o BACKEND processar com o ACBr do servidor
                                        try {
                                          const res = await axios.post('http://localhost:3333/api/fiscal/emit-acbr', { orderId: order.id });
                                          alert(`Nota Autorizada via SERVIDOR ACBrLib! Chave: ${res.data.chave}`);
                                          fetchOrders();
                                        } catch (e) {
                                          alert('Erro ao emitir via Servidor ACBr. Certifique-se que o servidor possui as DLLs instaladas.');
                                        }
                                      }
                                    }}
                                  >
                                    Emitir NFe (ACBrLib)
                                  </button>
                                )}
                                {order.status === 'FATURADO' && (
                                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Nota Emitida</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {isOrderModalOpen && (
                  <OrderModal 
                    onClose={() => setIsOrderModalOpen(false)} 
                    onSuccess={fetchOrders} 
                  />
                )}
              </div>
            );
          })()}

          {activeTab === 'fiscal' && (() => {
            const faturadas = orders.filter(o => o.status === 'FATURADO');

            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Notas Fiscais Emitidas (Saídas)</h2>
                </div>

                <div className="stats-row">
                  <div className="stat-card glass-panel">
                    <h3>Notas Emitidas</h3>
                    <p className="stat-value">{faturadas.length}</p>
                  </div>
                </div>

                <div className="table-container glass-panel">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nº Pedido</th>
                        <th>Cliente</th>
                        <th>Tipo</th>
                        <th>Data Emissão</th>
                        <th>Total</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faturadas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="empty-state">
                            <ReceiptText size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                            <p>Nenhuma nota fiscal emitida ainda.</p>
                          </td>
                        </tr>
                      ) : (
                        faturadas.map(note => (
                          <tr key={note.id}>
                            <td>#{note.orderNumber}</td>
                            <td>{note.customerName || 'Consumidor Final'}</td>
                            <td>NF-e</td>
                            <td>{new Date(note.updatedAt).toLocaleDateString('pt-BR')}</td>
                            <td>{note.netAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td>
                              <button className="icon-btn" title="Visualizar DANFE">
                                <ReceiptText size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {activeTab === 'recebimentos' && (
            <div className="module-container animate-fade-in">
              <div className="module-header">
                <h2>Notas Fiscais Recebidas (Entradas)</h2>
                <div className="header-actions">
                  <button className="btn-secondary">
                    <ArrowRightLeft size={18} /> Sincronizar Nuvem
                  </button>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card glass-panel">
                  <h3>Notas este Mês</h3>
                  <p className="stat-value">12</p>
                </div>
                <div className="stat-card glass-panel">
                  <h3>Aguardando Manifesto</h3>
                  <p className="stat-value text-warning">3</p>
                </div>
                <div className="stat-card glass-panel">
                  <h3>Total em Compras</h3>
                  <p className="stat-value text-accent">R$ 15.420,00</p>
                </div>
              </div>

              <div className="table-container glass-panel">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Emissor / Fornecedor</th>
                      <th>CNPJ</th>
                      <th>Data Emissão</th>
                      <th>Valor (R$)</th>
                      <th>Status SEFAZ</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '1', emitter: 'DISTRIBUIDORA DE BEBIDAS ALFA', cnpj: '11.222.333/0001-44', date: '2026-04-28', value: 2450.00, status: 'Ciência da Operação' },
                      { id: '2', emitter: 'SUPERMERCADO BETA LTDA', cnpj: '55.666.777/0001-88', date: '2026-04-29', value: 890.50, status: 'Aguardando' },
                      { id: '3', emitter: 'ATACADO GAMA S/A', cnpj: '99.000.111/0001-22', date: '2026-05-01', value: 5600.00, status: 'Confirmada' },
                    ].map(nfe => (
                      <tr key={nfe.id}>
                        <td>{nfe.emitter}</td>
                        <td>{nfe.cnpj}</td>
                        <td>{new Date(nfe.date).toLocaleDateString('pt-BR')}</td>
                        <td>{nfe.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            background: nfe.status === 'Aguardando' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: nfe.status === 'Aguardando' ? 'var(--warning)' : 'var(--success)'
                          }}>
                            {nfe.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="icon-btn" title="Manifestar Ciência">
                              <ReceiptText size={18} />
                            </button>
                            <button className="icon-btn" title="Baixar XML">
                              <Inbox size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (() => {
            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Gestão de Funcionários e Acessos</h2>
                  <button className="btn-primary" onClick={() => setIsUserModalOpen(true)}>
                    <Users size={18} /> Novo Funcionário
                  </button>
                </div>

                <div className="stats-row">
                  <div className="stat-card glass-panel">
                    <h3>Total de Usuários</h3>
                    <p className="stat-value">{users.length}</p>
                  </div>
                </div>

                <div className="table-container glass-panel">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th>Data Cadastro</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-state">
                            <Users size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                            <p>Nenhum funcionário cadastrado.</p>
                          </td>
                        </tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                background: user.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: user.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--success)'
                              }}>
                                {user.role}
                              </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td>
                              <button className="icon-btn" title="Editar Permissões">
                                <Settings size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {isUserModalOpen && (
                  <UserModal 
                    onClose={() => setIsUserModalOpen(false)} 
                    onSuccess={fetchUsers} 
                  />
                )}
              </div>
            );
          })()}

          {activeTab === 'financeiro' && (() => {
            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Gestão Financeira</h2>
                  <div className="header-actions">
                    <button className="btn-secondary">
                      <Wallet size={18} /> Novo Lançamento
                    </button>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-card glass-panel">
                    <h3>Contas a Receber (Pendente)</h3>
                    <p className="stat-value text-accent">
                      {financeSummary.totalReceivable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="stat-card glass-panel">
                    <h3>Saldo em Caixa (PDV)</h3>
                    <p className="stat-value text-success">R$ 1.250,00</p>
                  </div>
                </div>

                <div className="table-container glass-panel">
                  <h3>Fluxo de Caixa Recente (PDV + Retaguarda)</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Operação</th>
                        <th>Valor</th>
                        <th>Usuário</th>
                        <th>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeSummary.recentMoves.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-state">
                            <Wallet size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                            <p>Nenhuma movimentação financeira registrada.</p>
                          </td>
                        </tr>
                      ) : (
                        financeSummary.recentMoves.map((move: any) => (
                          <tr key={move.id}>
                            <td>{new Date(move.createdAt).toLocaleString('pt-BR')}</td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                background: move.type === 'IN' || move.type === 'OPEN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: move.type === 'IN' || move.type === 'OPEN' ? 'var(--success)' : 'var(--error)'
                              }}>
                                {move.type}
                              </span>
                            </td>
                            <td>{move.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td>{move.user?.name || 'Sistema'}</td>
                            <td>{move.description || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {activeTab === 'config' && companyConfig && (() => {
            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Configurações da Empresa e Fiscal</h2>
                  <button className="btn-primary" onClick={async () => {
                    await axios.post('http://localhost:3333/api/config', companyConfig);
                    alert('Configurações salvas!');
                  }}>
                    Salvar Alterações
                  </button>
                </div>

                <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  <div className="stat-card glass-panel">
                    <h3>Dados Empresariais</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Razão Social</label>
                        <input type="text" className="glass-input" value={companyConfig.razaoSocial} 
                          onChange={(e) => setCompanyConfig({...companyConfig, razaoSocial: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>CNPJ</label>
                        <input type="text" className="glass-input" value={companyConfig.cnpj} 
                          onChange={(e) => setCompanyConfig({...companyConfig, cnpj: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <h3>Configurações Fiscais (NFe/NFCe)</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Ambiente</label>
                        <select className="glass-input" value={companyConfig.ambiente}
                          onChange={(e) => setCompanyConfig({...companyConfig, ambiente: e.target.value})}>
                          <option value="1">Produção</option>
                          <option value="2">Homologação (Testes)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Série NFe</label>
                        <input type="number" className="glass-input" value={companyConfig.serieNfe || 1} 
                          onChange={(e) => setCompanyConfig({...companyConfig, serieNfe: parseInt(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Certificado Digital (A1)</label>
                        <div style={{ padding: '1rem', border: '2px dashed #27272a', borderRadius: '8px', textAlign: 'center' }}>
                          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Arraste o arquivo .pfx aqui ou clique para selecionar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
                  <h3>Endereço</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Logradouro</label>
                      <input type="text" className="glass-input" value={companyConfig.logradouro} 
                        onChange={(e) => setCompanyConfig({...companyConfig, logradouro: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Nº</label>
                      <input type="text" className="glass-input" value={companyConfig.numero} 
                        onChange={(e) => setCompanyConfig({...companyConfig, numero: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Bairro</label>
                      <input type="text" className="glass-input" value={companyConfig.bairro} 
                        onChange={(e) => setCompanyConfig({...companyConfig, bairro: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab !== 'config' && activeTab !== 'products' && activeTab !== 'sales' && activeTab !== 'recebimentos' && activeTab !== 'fiscal' && activeTab !== 'users' && activeTab !== 'financeiro' && (
            <div className="placeholder-card glass-panel">
              <Settings size={48} className="text-muted" />
              <h3>Módulo em Desenvolvimento</h3>
              <p>O módulo {activeTab} será implementado na próxima fase.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
