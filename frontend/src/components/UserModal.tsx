import React, { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import api from '../services/api';

interface UserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({ onClose, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    permissions: [] as string[]
  });

  const permissionOptions = [
    { label: 'Vendas', value: 'sales' },
    { label: 'Fiscal', value: 'fiscal' },
    { label: 'Estoque', value: 'stock' },
    { label: 'Financeiro', value: 'finance' },
    { label: 'Clientes', value: 'customers' },
    { label: 'Usuários', value: 'users' },
    { label: 'Configurações', value: 'settings' }
  ];

  const handleTogglePermission = (val: string) => {
    if (formData.permissions.includes(val)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== val) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, val] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...formData,
        permissions: formData.permissions.join(','),
        companyId: 'default-company-id'
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao criar usuário');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '500px' }}>
        <div className="modal-header">
          <h2><UserPlus size={20} /> Novo Funcionário</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" className="glass-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>E-mail (Login)</label>
            <input type="email" className="glass-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Senha Provisória</label>
            <input type="password" placeholder="Mínimo 6 caracteres" className="glass-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          
          <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Shield size={16} color="var(--accent-primary)" /> Telas Autorizadas
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {permissionOptions.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.permissions.includes(opt.value)}
                    onChange={() => handleTogglePermission(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Criar Acesso</button>
          </div>
        </form>
      </div>
    </div>
  );
}
