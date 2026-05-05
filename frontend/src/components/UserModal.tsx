import { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

interface UserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({ onClose, onSuccess }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CAIXA'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/api/users', formData);
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
      <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2><UserPlus size={20} /> Cadastrar Funcionário</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
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
            <label>Nível de Acesso (Perfil) *</label>
            <select name="role" className="glass-input" value={formData.role} onChange={handleChange}>
              <option value="CAIXA">Caixa (Somente PDV)</option>
              <option value="OPERATOR">Operador (Estoque e Vendas)</option>
              <option value="ADMIN">Administrador (Acesso Total)</option>
            </select>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              <Shield size={12} /> Perfis definem o que o funcionário pode ver no sistema.
            </p>
          </div>

          <div className="modal-footer" style={{ padding: '0', border: 'none', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
