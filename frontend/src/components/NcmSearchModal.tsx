import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import api from '../services/api';

interface Ncm {
  codigo: string;
  descricao: string;
}

interface NcmSearchModalProps {
  onClose: () => void;
  onSelect: (ncm: string) => void;
}

export default function NcmSearchModal({ onClose, onSelect }: NcmSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ncm[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ncm/search?query=${query}`);
      setResults(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2><Search size={20} /> Assistente de NCM</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>O que você está cadastrando? (Ex: Cadeira, Cerveja, Alumínio)</label>
            <div style={{ position: 'relative' }}>
              <input 
                autoFocus
                type="text" 
                className="glass-input" 
                placeholder="Digite o nome ou código..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && <div className="loading-spinner-small" style={{ position: 'absolute', right: '10px', top: '10px' }}></div>}
            </div>
          </div>

          <div className="ncm-results" style={{ marginTop: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {results.length === 0 && query.length > 2 && !loading && (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>Nenhum NCM encontrado.</p>
            )}
            
            {results.map((ncm) => (
              <div 
                key={ncm.codigo} 
                className="ncm-item" 
                onClick={() => onSelect(ncm.codigo)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    color: 'var(--accent-primary)', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {ncm.codigo}
                  </span>
                  <Check size={16} className="text-success" style={{ opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>{ncm.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Fonte: BrasilAPI / Receita Federal</p>
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>

      <style>{`
        .ncm-item:hover {
          background: rgba(255,255,255,0.02);
        }
        .ncm-item:hover strong {
          color: var(--accent-hover);
        }
      `}</style>
    </div>
  );
}
