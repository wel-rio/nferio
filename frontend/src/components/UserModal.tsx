import { useState } from 'react';
import { X, UserPlus, Shield, Check } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

interface UserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { slug: 'sales', label: 'Vendas' },
  { slug: 'fiscal', label: 'Notas Fiscais (NFe)' },
  { slug: 'inbound', label: 'Recebimentos (Entradas)' },
  { slug: 'stock', label: 'Estoque / Inventário' },
  { slug: 'finance', label: 'Financeiro' },
  { slug: 'customers', label: 'Clientes / Fornecedores' },
  { slug: 'settings', label: 'Configurações' },
  { slug: 'users', label: 'Gestão de Usuários' },
];

export default function UserModal({ onClose, onSuccess }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(['sales']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePermission = (slug: string) => {
    if (permissions.includes(slug)) {
      setPermissions(permissions.filter(p => p !== slug));
    } else {
      setPermissions([...permissions, slug]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/api/users', {
        ...formData,
        permissions: permissions.join(','),
        companyId: 'default-company-id' // Ajustar para pegar do contexto
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2><UserPlus size={20} /> Cadastrar Funcionário</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Nome Completo *</label>
              <input required type="text" name="name" className="glass-input" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>E-mail (Login) *</label>
              <input required type="email" name="email" className="glass-input" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Senha *</label>
              <input required type="password" name="password" className="glass-input" value={formData.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Perfil Base *</label>
              <select name="role" className="glass-input" value={formData.role} onChange={handleChange}>
                <option value="OPERATOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>Telas Autorizadas</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {AVAILABLE_PERMISSIONS.map(p => (
                <div 
                  key={p.slug}
                  onClick={() => togglePermission(p.slug)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: permissions.includes(p.slug) ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: permissions.includes(p.slug) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: permissions.includes(p.slug) ? 'white' : '#94a3b8' }}>{p.label}</span>
                  {permissions.includes(p.slug) && <Check size={14} color="var(--accent-primary)" />}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ gridColumn: 'span 2', padding: '0', border: 'none', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Salvando...' : 'Cadastrar e Autorizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
