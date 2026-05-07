/**
 * Gerador de DANFE simplificado para o navegador
 * Recebe o XML da NFe e gera um HTML imprimível
 */
export const danfeGenerator = {
  generate(xml: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    // Helper para buscar dados no XML
    const getVal = (path: string) => {
      const el = xmlDoc.querySelector(path);
      return el ? el.textContent : '';
    };

    const chave = getVal('chNFe') || 'CHAVE NÃO ENCONTRADA';
    const numero = getVal('nNF');
    const serie = getVal('serie');
    const emitente = getVal('emit xNome');
    const cnpjEmit = getVal('emit CNPJ');
    const destinatario = getVal('dest xNome');
    const valorTotal = getVal('vNF');

    const htmlContent = `
      <html>
        <head>
          <title>DANFE - ${chave}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
            .danfe-box { border: 1px solid #000; padding: 10px; margin-bottom: 10px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .title { font-weight: bold; font-size: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
            .footer { margin-top: 20px; font-size: 10px; color: #666; text-align: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()">Imprimir DANFE</button>
          </div>
          <div class="danfe-box">
            <div class="header">
              <div>
                <div class="title">DANFE</div>
                <div>Documento Auxiliar da Nota Fiscal Eletrônica</div>
              </div>
              <div style="text-align: right;">
                <div>Nº: ${numero}</div>
                <div>Série: ${serie}</div>
              </div>
            </div>
            
            <div class="grid">
              <div>
                <strong>EMITENTE</strong><br/>
                ${emitente}<br/>
                CNPJ: ${cnpjEmit}
              </div>
              <div>
                <strong>CHAVE DE ACESSO</strong><br/>
                ${chave}
              </div>
            </div>

            <div class="danfe-box" style="margin-top: 20px;">
              <strong>DESTINATÁRIO</strong><br/>
              ${destinatario}
            </div>

            <div style="margin-top: 20px; text-align: right; font-size: 18px;">
              <strong>VALOR TOTAL: R$ ${valorTotal}</strong>
            </div>
          </div>
          <div class="footer">Este é um DANFE simplificado gerado pelo NFERIO</div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
    }
  }
};
