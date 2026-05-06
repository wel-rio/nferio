import React, { useState, useEffect } from 'react';
import { X, FileDown, Search, Check, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface NFeEntryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NFeEntryModal({ onClose, onSuccess }: NFeEntryModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [xmlData, setXmlData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const handleProcessXml = async () => {
    setLoading(true);
    try {
      // Simulação de processamento de XML
      // Na vida real, enviaria o arquivo para o backend processar
      await api.post('/fiscal/process-entry', {
        xmlContent: 'MOCK_XML_CONTENT',
        companyId: 'default-company-id'
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao processar NF-e');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" style={{ width: '700px' }}>
        <div className="modal-header">
          <h2><FileDown size={20} /> Importar NF-e de Entrada</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="upload-zone" style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center', borderRadius: '12px' }}>
            <FileDown size={48} className="text-accent" style={{ margin: '0 auto 1rem' }} />
            <h3>Arraste o arquivo XML ou selecione</h3>
            <input type="file" style={{ marginTop: '1rem' }} />
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertTriangle size={18} color="var(--error)" />
              <p style={{ fontSize: '0.85rem' }}>Ao importar, o sistema buscará produtos pelo SKU ou Nome para atualizar o estoque automaticamente.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleProcessXml} disabled={loading}>
            {loading ? 'Processando...' : 'Processar Entrada e Gerar Contas a Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
}
