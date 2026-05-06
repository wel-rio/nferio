import React, { useState, useEffect } from 'react';
import { X, FileDown, Search, Check, AlertTriangle } from 'lucide-react';
import api, { fiscalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NFeEntryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NFeEntryModal({ onClose, onSuccess }: NFeEntryModalProps) {
  const { company } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessXml = async () => {
    if (!company) return;
    if (!selectedFile) return alert('Selecione um arquivo XML');

    setLoading(true);
    try {
      // Em uma implementação real, leríamos o XML aqui ou enviaríamos via FormData
      // Para manter a fluidez, vamos simular o envio da estrutura que o backend espera
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          // Aqui poderíamos parsear o XML no frontend se necessário
          // Mas vamos enviar para a rota que processa a entrada
          
          await fiscalApi.post('/fiscal/process-entry', {
            xmlContent: content,
            companyId: company.id
          });
          
          onSuccess();
          onClose();
        } catch (err) {
          alert('Erro ao processar conteúdo do XML');
        }
      };
      reader.readAsText(selectedFile);

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
          <div className="upload-zone" style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center', borderRadius: '12px', background: selectedFile ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
            <FileDown size={48} className={selectedFile ? "text-success" : "text-accent"} style={{ margin: '0 auto 1rem' }} />
            {selectedFile ? (
              <h3>Arquivo selecionado: <span className="text-success">{selectedFile.name}</span></h3>
            ) : (
              <h3>Arraste o arquivo XML ou selecione</h3>
            )}
            <input type="file" accept=".xml" onChange={handleFileChange} style={{ marginTop: '1rem' }} />
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertTriangle size={18} color="var(--accent-primary)" />
              <p style={{ fontSize: '0.85rem' }}>O sistema importará os itens, atualizará o estoque e gerará as contas a pagar conforme as duplicatas da nota.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleProcessXml} disabled={loading || !selectedFile}>
            {loading ? 'Processando...' : 'Processar Entrada e Gerar Contas a Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
}
