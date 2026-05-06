import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Plus, MapPin, Phone, Mail, Building2, Trash2, Edit, X } from 'lucide-react';

export default function Customers() {
  const { company } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    document: '',
    email: '',
    phone: '',
    type: 'CUSTOMER',
    ie: '',
    address: '',
    city: '',
    uf: ''
  });

  const fetchCustomers = async () => {
    if (!company) return;
    try {
      setLoading(true);
      const res = await api.get('/customers', {
        params: { companyId: company.id }
      });
      setCustomers(res.data);
    } catch (error) {
      console.error('Erro ao buscar clientes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCnpjLookup = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    try {
      const res = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      const data = res.data;
      setFormData({
        ...formData,
        name: data.razao_social,
        document: cleanCnpj,
        address: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
        city: data.municipio,
        uf: data.uf,
        phone: data.ddd_telefone_1 || ''
      });
    } catch (e) {
      console.error('CNPJ Lookup failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      if (formData.id) {
        await api.put(`/customers/${formData.id}`, { ...formData, companyId: company.id });
      } else {
        await api.post('/customers', { ...formData, companyId: company.id });
      }
      setIsModalOpen(false);
      setFormData({ id: '', name: '', document: '', email: '', phone: '', type: 'CUSTOMER', ie: '', address: '', city: '', uf: '' });
      fetchCustomers();
    } catch (error) {
      alert('Erro ao salvar cliente');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm)
  );

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header">
        <div>
          <h2>Cadastro de Clientes e Fornecedores</h2>
          <p className="text-muted">Gerencie sua base de contatos multi-tenant</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Cadastro
        </button>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card glass-panel">
          <h3>Total de Clientes</h3>
          <p className="stat-value">{customers.filter(c => c.type !== 'SUPPLIER').length}</p>
        </div>
        <div className="stat-card glass-panel">
          <h3>Fornecedores</h3>
          <p className="stat-value text-accent">{customers.filter(c => c.type === 'SUPPLIER' || c.type === 'BOTH').length}</p>
        </div>
        <div className="stat-card glass-panel">
          <h3>Novos este Mês</h3>
          <p className="stat-value text-success">12</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou CNPJ..." 
            className="glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome / Razão Social</th>
              <th>Documento</th>
              <th>Contato</th>
              <th>Cidade/UF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Carregando...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">Nenhum registro encontrado.</td></tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'white' }}>{customer.name}</div>
                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                      {customer.type}
                    </span>
                  </td>
                  <td>{customer.document}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} /> {customer.phone || '-'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} /> {customer.email || '-'}</span>
                    </div>
                  </td>
                  <td>{customer.city} / {customer.uf}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn" onClick={() => { setFormData(customer); setIsModalOpen(true); }}><Edit size={16} /></button>
                      <button className="icon-btn text-error"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-scale-up" style={{ width: '600px' }}>
            <div className="modal-header">
              <h2>{formData.id ? 'Editar' : 'Novo'} Cadastro</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Tipo de Cadastro</label>
                <select className="glass-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="CUSTOMER">Cliente</option>
                  <option value="SUPPLIER">Fornecedor</option>
                  <option value="BOTH">Ambos (Cliente/Fornecedor)</option>
                </select>
              </div>

              <div className="form-group">
                <label>CPF / CNPJ</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={formData.document} 
                  onChange={e => {
                    setFormData({...formData, document: e.target.value});
                    if (e.target.value.length === 14) handleCnpjLookup(e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Inscrição Estadual</label>
                <input type="text" className="glass-input" value={formData.ie} onChange={e => setFormData({...formData, ie: e.target.value})} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nome / Razão Social</label>
                <input type="text" className="glass-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input type="email" className="glass-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input type="text" className="glass-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Endereço Completo</label>
                <input type="text" className="glass-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Cidade</label>
                <input type="text" className="glass-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>

              <div className="form-group">
                <label>UF</label>
                <input type="text" className="glass-input" value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value})} />
              </div>

              <div className="modal-footer" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
