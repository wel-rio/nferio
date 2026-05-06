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
  UserCheck,
  Plus,
  Users as UsersIcon,
  Wallet,
  Save,
  ShieldCheck,
  BarChart3,
  Shield,
  FileDown,
  PieChart,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { fiscalApi } from '../services/api';
import ProductModal from '../components/ProductModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import OrderModal from '../components/OrderModal';
import UserModal from '../components/UserModal';
import NFeEntryModal from '../components/NFeEntryModal';
import Customers from './Customers';
import AdminMaster from './AdminMaster';
import Finance from './Finance';
import Reports from './Reports';
import Users from './Users';
import Inbound from './Inbound';
import './Dashboard.css';

import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, company, logout, isExpired } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const hasPermission = (slug: string) => {
    if (!user) return false;
    if (user.role === 'OWNER' || user.role === 'ADMIN') return true;
    const permissions = user.permissions ? user.permissions.split(',') : [];
    return permissions.includes(slug);
  };

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [isNfeEntryOpen, setIsNfeEntryOpen] = useState(false);
  const [selectedNfeData, setSelectedNfeData] = useState<any>(null);

  const fetchUsers = async () => {
    if (!company) return;
    try {
      const res = await api.get('/users', { params: { companyId: company.id } });
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };
  
  // Stock Modal State
  const [stockModalData, setStockModalData] = useState<{ isOpen: boolean, productId: string, productName: string, currentStock: number }>({
    isOpen: false,
    productId: '',
    productName: '',
    currentStock: 0
  });

  const fetchProducts = async () => {
    if (!company) return;
    try {
      const res = await api.get('/products', { params: { companyId: company.id } });
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

// Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchOrders = async () => {
    if (!company) return;
    try {
      const res = await api.get('/orders', { params: { companyId: company.id } });
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const convertOrder = async (id: string) => {
    try {
      await api.post(`/orders/${id}/convert`);
      fetchOrders();
      fetchProducts(); // Update stock in products tab
    } catch (error) {
      alert('Erro ao converter pedido');
    }
  };

  // Finance State
  const [financeSummary, setFinanceSummary] = useState<any>({ totalReceivable: 0, recentMoves: [] });

  const fetchFinance = async () => {
    if (!company) return;
    try {
      const res = await api.get('/finance/summary', { params: { companyId: company.id } });
      setFinanceSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch finance', error);
    }
  };

  // Config State
  const [companyConfig, setCompanyConfig] = useState<any>({
    razaoSocial: '',
    cnpj: '',
    inscricaoEstadual: '',
    municipio: '',
    uf: 'RJ',
    codigoIbge: '',
    crt: '1',
    ambiente: '2',
    senhaCertificado: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cep: '',
    telefone: '',
    cscId: '',
    cscKey: '',
    nfeSerie: 1,
    nfeNextNumber: 1,
    nfceSerie: 1,
    nfceNextNumber: 1
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  const [certExpiration, setCertExpiration] = useState<string>('');

  const fetchConfig = async () => {
    if (!company) return;
    try {
      const res = await fiscalApi.get('/company/setup/current', { params: { companyId: company.id } });
      if (res.data) {
        setCompanyConfig(res.data);
        // Busca data de vencimento
        const certRes = await fiscalApi.get('/company/cert-info', { params: { companyId: company.id } });
        setCertExpiration(certRes.data.vencimento);
      }
    } catch (error) {
      console.error('Failed to fetch config from VPS', error);
    }
  };

  const consultarCNPJ = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      alert('CNPJ inválido para consulta');
      return;
    }

    try {
      setConfigLoading(true);
      // Tentativa 1: BrasilAPI
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyConfig({
            ...companyConfig,
            razaoSocial: data.razao_social || '',
            cnpj: data.cnpj || cleanCnpj,
            municipio: data.municipio || '',
            uf: data.uf || '',
            codigoIbge: data.codigo_municipio?.toString() || '',
            logradouro: data.logradouro || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            cep: data.cep || '',
            telefone: data.ddd_telefone_1 || ''
          });
          alert('Dados consultados com sucesso via BrasilAPI!');
          return;
        }
      } catch (e) {
        console.warn('BrasilAPI falhou, tentando fallback...');
      }

      // Tentativa 2: CNPJ.ws (Fallback)
      const fbResponse = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        // Tenta achar a IE do estado, se não achar pega a primeira da lista
        const ies = fbData.estabelecimento.inscricoes_estaduais || [];
        const ieData = ies.find((ie: any) => ie.estado.sigla === fbData.estabelecimento.estado.sigla) || ies[0];
        
        setCompanyConfig({
          ...companyConfig,
          razaoSocial: fbData.razao_social || '',
          cnpj: fbData.cnpj || cleanCnpj,
          municipio: fbData.estabelecimento.cidade.nome || '',
          uf: fbData.estabelecimento.estado.sigla || '',
          codigoIbge: fbData.estabelecimento.cidade.ibge_id?.toString() || '',
          logradouro: fbData.estabelecimento.logradouro || '',
          numero: fbData.estabelecimento.numero || '',
          bairro: fbData.estabelecimento.bairro || '',
          cep: fbData.estabelecimento.cep || '',
          telefone: fbData.estabelecimento.telefone1 || '',
          inscricaoEstadual: ieData?.inscricao_estadual || ''
        });
        alert('Dados e IE consultados via API Secundária!');
      } else {
        throw new Error('Todas as APIs de consulta falharam.');
      }

    } catch (error: any) {
      console.error('Erro na consulta:', error);
      alert(`Erro ao consultar CNPJ: ${error.message || 'Verifique sua conexão ou o número do CNPJ.'}`);
    } finally {
      setConfigLoading(false);
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
    logout();
  };

  const handleSaveSettings = async () => {
    if (!company) return;
    try {
      setConfigLoading(true);
      const formData = new FormData();
      formData.append('companyId', company.id);
      Object.keys(companyConfig).forEach(key => {
        if (companyConfig[key] !== undefined && companyConfig[key] !== null) {
          formData.append(key, String(companyConfig[key]));
        }
      });
      if (selectedFile) {
        formData.append('certificado', selectedFile);
      }

      await api.post('/company/setup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Configurações salvas com sucesso!');
      // Atualiza o contexto da empresa se necessário
    } catch (error) {
      console.error('Erro ao salvar configurações', error);
      alert('Erro ao salvar configurações. Verifique os dados e tente novamente.');
    } finally {
      setConfigLoading(false);
    }
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
            <PieChart size={20} /> <span>Início / Painel</span>
          </button>
          
          {hasPermission('sales') && (
            <button className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
              <ShoppingCart size={20} /> <span>Vendas / Orçamentos</span>
            </button>
          )}

          {hasPermission('fiscal') && (
            <button className={`nav-item ${activeTab === 'fiscal' ? 'active' : ''}`} onClick={() => setActiveTab('fiscal')}>
              <FileText size={20} /> <span>Fiscal (NF-e/NFC-e)</span>
            </button>
          )}

          {hasPermission('inbound') && (
            <button className={`nav-item ${activeTab === 'inbound' ? 'active' : ''}`} onClick={() => setActiveTab('inbound')}>
              <FileDown size={20} /> <span>Entrada (XML)</span>
            </button>
          )}

          {hasPermission('stock') && (
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <Package size={20} /> <span>Estoque / Produtos</span>
            </button>
          )}

          {hasPermission('finance') && (
            <button className={`nav-item ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>
              <Wallet size={20} /> <span>Financeiro (Contas)</span>
            </button>
          )}

          {hasPermission('customers') && (
            <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
              <UsersIcon size={20} /> <span>Clientes / Fornec.</span>
            </button>
          )}

          {hasPermission('reports') && (
            <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <BarChart3 size={20} /> <span>Relatórios / BI</span>
            </button>
          )}

          {hasPermission('users') && (
            <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              <Shield size={20} /> <span>Gerenciar Equipe</span>
            </button>
          )}

          {user?.role === 'OWNER' && (
            <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} 
              style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}
              onClick={() => setActiveTab('admin')}>
              <ShieldCheck size={20} color="var(--accent-primary)" /> <span>ADMIN MASTER</span>
            </button>
          )}
          
          <button className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            <Settings size={20} /> <span>Configurações</span>
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
          <div className="header-title">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            {isExpired && <span className="badge-error" style={{ marginLeft: '1rem', fontSize: '0.7rem' }}>LICENÇA VENCIDA - Regularize seu acesso</span>}
          </div>
          <div className="user-profile">
            <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="company-name">{company?.razaoSocial || 'NFERIO ERP'}</span>
            </div>
          </div>
        </header>

        <div className="content-area animate-fade-in">
          {activeTab === 'dashboard' && (
            <div className="module-container animate-fade-in">
              <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card glass-panel">
                  <h3>Receitas (Mês)</h3>
                  <p className="stat-value text-success">
                    {financeSummary.totalReceivable?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                  </p>
                </div>
                <div className="stat-card glass-panel">
                  <h3>NFe Emitidas</h3>
                  <p className="stat-value">{orders.filter(o => o.status === 'FATURADO').length}</p>
                </div>
                <div className="stat-card glass-panel">
                  <h3>Despesas (Mês)</h3>
                  <p className="stat-value text-error">
                    {financeSummary.totalPayable?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                  </p>
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
                                onClick={() => setStockModalData({ isOpen: true, productId: product.id, productName: product.name, currentStock: product.stock })}
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
                  <StockAdjustmentModal 
                    productId={stockModalData.productId}
                    productName={stockModalData.productName}
                    currentStock={stockModalData.currentStock}
                    onClose={() => setStockModalData({ isOpen: false, productId: '', productName: '', currentStock: 0 })}
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
                                  <div className="flex gap-2">
                                    <button 
                                      className="btn-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                      onClick={async () => {
                                        try {
                                          const res = await fiscalApi.post('/fiscal/validate-acbr', { order, company: companyConfig });
                                          if (res.data.success) {
                                            alert("✅ Nota Válida! Pronta para emissão.");
                                          } else {
                                            alert(`❌ Erro na Validação: ${res.data.detalhes || res.data.error}`);
                                          }
                                        } catch (e) {
                                          alert('Erro ao comunicar com o Servidor Fiscal.');
                                        }
                                      }}
                                    >
                                      Validar
                                    </button>
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
                                            await api.post(`/orders/${order.id}/convert`);
                                            fetchOrders();
                                          });
                                        } else {
                                          // 2b. Se for WEB, envia para o BACKEND processar com o ACBr do servidor
                                          try {
                                            const res = await fiscalApi.post('/fiscal/emit-acbr', { order, company: companyConfig });
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
                                  </div>
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

          {isNfeEntryOpen && selectedNfeData && (
            <NFeEntryModal 
              nfeData={selectedNfeData}
              onClose={() => setIsNfeEntryOpen(false)}
              onSuccess={() => {
                fetchProducts();
                fetchFinance();
                alert('Entrada processada com sucesso! Estoque e Financeiro atualizados.');
              }}
            />
          )}

          {activeTab === 'customers' && <Customers />}
          {activeTab === 'financeiro' && <Finance />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'inbound' && <Inbound />}
          {activeTab === 'admin' && <AdminMaster />}

          {activeTab === 'config' && (() => {
            const handleSaveConfig = async () => {
              setConfigLoading(true);
              try {
                const formData = new FormData();
                formData.append('companyId', companyConfig.id || '');
                formData.append('razaoSocial', companyConfig.razaoSocial);
                formData.append('cnpj', companyConfig.cnpj);
                formData.append('inscricaoEstadual', companyConfig.inscricaoEstadual);
                formData.append('municipio', companyConfig.municipio);
                formData.append('uf', companyConfig.uf);
                formData.append('codigoIbge', companyConfig.codigoIbge || '');
                formData.append('crt', companyConfig.crt || '1');
                formData.append('senhaCertificado', companyConfig.senhaCertificado || '');
                formData.append('logradouro', companyConfig.logradouro || '');
                formData.append('numero', companyConfig.numero || '');
                formData.append('bairro', companyConfig.bairro || '');
                formData.append('cep', companyConfig.cep || '');
                formData.append('telefone', companyConfig.telefone || '');
                formData.append('cscId', companyConfig.cscId || '');
                formData.append('cscKey', companyConfig.cscKey || '');
                formData.append('nfeSerie', String(companyConfig.nfeSerie || 1));
                formData.append('nfeNextNumber', String(companyConfig.nfeNextNumber || 1));
                formData.append('nfceSerie', String(companyConfig.nfceSerie || 1));
                formData.append('nfceNextNumber', String(companyConfig.nfceNextNumber || 1));
                
                if (selectedFile) {
                  formData.append('certificado', selectedFile);
                }

                // Agora envia para a VPS (fiscalApi)
                await fiscalApi.post('/company/setup', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                alert('Configurações e Certificado salvos com sucesso na VPS!');
                fetchConfig();
              } catch (error) {
                console.error(error);
                alert('Erro ao salvar configurações');
              } finally {
                setConfigLoading(false);
              }
            };

            return (
              <div className="module-container animate-fade-in">
                <div className="module-header">
                  <h2>Configurações da Empresa e Fiscal</h2>
                  <div className="header-actions">
                    <button className="btn-primary" onClick={handleSaveSettings} disabled={configLoading}>
                      <Save size={18} /> {configLoading ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                </div>

                <div className="stats-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {/* Dados da Empresa */}
                  <div className="stat-card glass-panel">
                    <h3>Identificação da Empresa</h3>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Razão Social / Nome Fantasia</label>
                        <input type="text" className="glass-input" value={companyConfig.razaoSocial} 
                          onChange={(e) => setCompanyConfig({...companyConfig, razaoSocial: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>CNPJ</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="text" className="glass-input" value={companyConfig.cnpj} 
                            onChange={(e) => setCompanyConfig({...companyConfig, cnpj: e.target.value})} />
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0 12px' }}
                            onClick={() => consultarCNPJ(companyConfig.cnpj)}
                            disabled={configLoading}
                          >
                            🔍
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Inscrição Estadual</label>
                        <input type="text" className="glass-input" value={companyConfig.inscricaoEstadual} 
                          onChange={(e) => setCompanyConfig({...companyConfig, inscricaoEstadual: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Município</label>
                        <input type="text" className="glass-input" value={companyConfig.municipio} 
                          onChange={(e) => setCompanyConfig({...companyConfig, municipio: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>UF</label>
                        <input type="text" className="glass-input" value={companyConfig.uf} maxLength={2}
                          onChange={(e) => setCompanyConfig({...companyConfig, uf: e.target.value.toUpperCase()})} />
                      </div>
                      <div className="form-group">
                        <label>Código IBGE Município</label>
                        <input type="text" className="glass-input" value={companyConfig.codigoIbge} 
                          onChange={(e) => setCompanyConfig({...companyConfig, codigoIbge: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Regime Tributário (CRT)</label>
                        <select className="glass-input" value={companyConfig.crt || '1'}
                          onChange={(e) => setCompanyConfig({...companyConfig, crt: e.target.value})}>
                          <option value="1">Simples Nacional</option>
                          <option value="2">Simples Nacional (Excesso)</option>
                          <option value="3">Regime Normal</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                         <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Configurações de Emissão</h4>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                              <label>ID Token CSC (NFCe)</label>
                              <input type="text" className="glass-input" value={companyConfig.cscId} placeholder="000001"
                                onChange={(e) => setCompanyConfig({...companyConfig, cscId: e.target.value})} />
                            </div>
                            <div className="form-group">
                              <label>Chave CSC (NFCe)</label>
                              <input type="text" className="glass-input" value={companyConfig.cscKey} placeholder="AAAA-BBBB..."
                                onChange={(e) => setCompanyConfig({...companyConfig, cscKey: e.target.value})} />
                            </div>
                         </div>
                         
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                              <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Série / Próximo Nº NF-e</label>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                                <input type="number" className="glass-input" value={companyConfig.nfeSerie} 
                                  onChange={(e) => setCompanyConfig({...companyConfig, nfeSerie: parseInt(e.target.value)})} />
                                <input type="number" className="glass-input" value={companyConfig.nfeNextNumber} 
                                  onChange={(e) => setCompanyConfig({...companyConfig, nfeNextNumber: parseInt(e.target.value)})} />
                              </div>
                            </div>
                            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                              <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Série / Próximo Nº NFC-e</label>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                                <input type="number" className="glass-input" value={companyConfig.nfceSerie} 
                                  onChange={(e) => setCompanyConfig({...companyConfig, nfceSerie: parseInt(e.target.value)})} />
                                <input type="number" className="glass-input" value={companyConfig.nfceNextNumber} 
                                  onChange={(e) => setCompanyConfig({...companyConfig, nfceNextNumber: parseInt(e.target.value)})} />
                              </div>
                            </div>
                         </div>
                      </div>

                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Endereço Completo</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                          <input type="text" className="glass-input" placeholder="Logradouro / Rua" value={companyConfig.logradouro} 
                            onChange={(e) => setCompanyConfig({...companyConfig, logradouro: e.target.value})} />
                          <input type="text" className="glass-input" placeholder="Nº" value={companyConfig.numero} 
                            onChange={(e) => setCompanyConfig({...companyConfig, numero: e.target.value})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                          <input type="text" className="glass-input" placeholder="Bairro" value={companyConfig.bairro} 
                            onChange={(e) => setCompanyConfig({...companyConfig, bairro: e.target.value})} />
                          <input type="text" className="glass-input" placeholder="CEP" value={companyConfig.cep} 
                            onChange={(e) => setCompanyConfig({...companyConfig, cep: e.target.value})} />
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                          <input type="text" className="glass-input" placeholder="Telefone de Contato" value={companyConfig.telefone} 
                            onChange={(e) => setCompanyConfig({...companyConfig, telefone: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificado Digital */}
                  <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <h3>Certificado Digital e Ambiente</h3>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Ambiente SEFAZ</label>
                        <select className="glass-input" value={companyConfig.ambiente || '2'}
                          onChange={(e) => setCompanyConfig({...companyConfig, ambiente: e.target.value})}>
                          <option value="1">Produção (VALE NOTA)</option>
                          <option value="2">Homologação (TESTES)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Certificado Digital (Arquivo .pfx)</label>
                        <div 
                          style={{ 
                            padding: '2rem', 
                            border: '2px dashed var(--accent-primary)', 
                            borderRadius: '12px', 
                            textAlign: 'center',
                            background: selectedFile ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          <input 
                            type="file" 
                            accept=".pfx" 
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                          {selectedFile ? (
                            <div>
                              <p className="text-success" style={{ fontWeight: '600' }}>✓ {selectedFile.name}</p>
                              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Clique ou arraste para trocar</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-accent" style={{ fontWeight: '500' }}>Selecionar arquivo Certificado A1</p>
                              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Apenas arquivos .pfx</p>
                            </div>
                          )}
                        </div>
                        {companyConfig.certificadoPath && !selectedFile && (
                          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Certificado atual: ...{companyConfig.certificadoPath.split('/').pop()}
                          </p>
                        )}
                      </div>

                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Senha do Certificado</label>
                        <input type="password" name="password" className="glass-input" 
                          value={companyConfig.senhaCertificado} 
                          onChange={(e) => setCompanyConfig({...companyConfig, senhaCertificado: e.target.value})} />
                      </div>

                      {certExpiration && (
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <div className="glass-panel" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                              🗓️ <strong>Vencimento do Certificado:</strong> <span style={{ color: '#fbbf24' }}>{certExpiration}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', border: '1px solid var(--warning)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
                          <strong>Atenção:</strong> O certificado é armazenado de forma segura no servidor Linux para processamento via ACBrLib.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {!['dashboard', 'products', 'sales', 'fiscal', 'inbound', 'customers', 'financeiro', 'reports', 'users', 'admin', 'config'].includes(activeTab) && (
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
