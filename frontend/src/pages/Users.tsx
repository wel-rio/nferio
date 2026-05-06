import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Edit, Trash2, Mail, User as UserIcon } from 'lucide-react';
import UserModal from '../components/UserModal';

export default function Users() {
  const { company } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!company) return;
    try {
      setLoading(true);
      const res = await api.get('/users', { params: { companyId: company.id } });
      setUsers(res.data);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [company]);

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header">
        <div>
          <h2>Gestão de Equipe</h2>
          <p className="text-muted">Controle quem acessa o seu sistema e quais permissões eles possuem</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Funcionário
        </button>
      </div>

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo / Função</th>
              <th>Acesso desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="empty-state">Carregando usuários...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">Nenhum funcionário cadastrado.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                      <UserIcon size={16} />
                    </div>
                    <span style={{ fontWeight: '600' }}>{u.name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Mail size={14} /> {u.email}
                    </div>
                  </td>
                  <td>
                    <span className={`badge-${u.role === 'OWNER' ? 'accent' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn"><Edit size={16} /></button>
                      {u.role !== 'OWNER' && (
                        <button className="icon-btn text-error"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchUsers} 
        />
      )}
    </div>
  );
}
