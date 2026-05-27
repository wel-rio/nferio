import React, { useState, useEffect } from 'react';
import { X, FileDown, Search, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
      const content = await selectedFile.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "text/xml");

      // 1. Extrair Dados Básicos
      const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent;
      const xNome = xmlDoc.getElementsByTagName("xNome")[0]?.textContent;
      const cnpjEmit = xmlDoc.getElementsByTagName("CNPJ")[0]?.textContent;
      const vNF = xmlDoc.getElementsByTagName("vNF")[0]?.textContent;

      // 2. Extrair Itens
      const detTags = xmlDoc.getElementsByTagName("det");
      const items = Array.from(detTags).map(det => {
        const prod = det.getElementsByTagName("prod")[0];
        return {
          sku: prod.getElementsByTagName("cProd")[0]?.textContent,
          name: prod.getElementsByTagName("xProd")[0]?.textContent,
          qCom: Number(prod.getElementsByTagName("qCom")[0]?.textContent),
          vUnCom: Number(prod.getElementsByTagName("vUnCom")[0]?.textContent),
          vProd: Number(prod.getElementsByTagName("vProd")[0]?.textContent),
        };
      });

      // 3. Extrair Duplicatas (Financeiro)
      const dupTags = xmlDoc.getElementsByTagName("dup");
      const payables = Array.from(dupTags).map(dup => ({
        nDup: dup.getElementsByTagName("nDup")[0]?.textContent,
        dVenc: dup.getElementsByTagName("dVenc")[0]?.textContent,
        vDup: Number(dup.getElementsByTagName("vDup")[0]?.textContent),
      }));

      // 4. Salvar Financeiro (AccountPayable)
      const payableEntries = payables.length > 0 ? payables.map(p => ({
        description: `Compra NFe ${nNF} - ${xNome}`,
        amount: p.vDup,
        dueDate: p.dVenc,
        status: 'PENDENTE',
        companyId: company.id
      })) : [{
        description: `Compra NFe ${nNF} - ${xNome}`,
        amount: Number(vNF),
        dueDate: new Date().toISOString(),
        status: 'PENDENTE',
        companyId: company.id
      }];

      const { error: payableError } = await supabase
        .from('AccountPayable')
        .insert(payableEntries);

      if (payableError) throw payableError;

      // 5. Atualizar Estoque (Simplificado: Tenta achar por SKU ou Nome)
      for (const item of items) {
        // Tenta achar produto
        const { data: existingProd } = await supabase
          .from('Product')
          .select('id, stock')
          .eq('companyId', company.id)
          .or(`sku.eq.${item.sku},name.eq.${item.name}`)
          .single();

        if (existingProd) {
          await supabase
            .from('Product')
            .update({ stock: existingProd.stock + item.qCom })
            .eq('id', existingProd.id);
        } else {
          // Opcional: Criar produto se não existe
          await supabase
            .from('Product')
            .insert([{
              name: item.name,
              sku: item.sku,
              price: item.vUnCom * 1.5, // Markup sugerido de 50%
              stock: item.qCom,
              companyId: company.id
            }]);
        }
      }

      alert('NF-e Processada! Estoque e Financeiro atualizados.');
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error(error);
      alert('Erro ao processar NF-e: ' + error.message);
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
