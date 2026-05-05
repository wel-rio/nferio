/**
 * Serviço para geração de arquivos TXT no padrão SEFAZ (utilizado pelo ACBr e Integradores Cloud)
 */
export const sefazService = {
  generateNFeTxt(order: any, company: any, items: any[]) {
    const lines: string[] = [];

    // NOTA FISCAL (Capa)
    // NOTA FISCAL|Versão do Layout
    lines.push('NOTAFISCAL|1.00');

    // A|Versão do Esquema|ID
    lines.push('A|4.00|');

    // B|cUF|cNF|natOp|mod|serie|nNF|dhEmi|dhSaiEnt|tpNF|idDest|cMunFG|tpImp|tpEmis|cDV|tpAmb|finNFe|indFinal|indPres|procEmi|verProc|dhCont|xJust
    const dhEmi = new Date().toISOString();
    lines.push(`B|${company.cUF || 35}|${order.orderNumber}|VENDA DE MERCADORIA|55|${company.serieNfe || 1}|${order.orderNumber}|${dhEmi}||1|1|${company.cMun || 3550308}|1|1||${company.ambiente}|1|1|1|0|NFERIO_ERP||`);

    // C|xNome|xLgr|nro|xCpl|xBairro|cMun|xMun|UF|CEP|cPais|xPais|fone|IE|IEST|IM|CNAE|CRT
    lines.push(`C|${company.razaoSocial}|${company.logradouro}|${company.numero}||${company.bairro}|${company.cMun}|${company.municipio}|${company.uf}|${company.cep}|1058|BRASIL||${company.ie}||||${company.crt || 1}`);

    // E|xNome|indIEDest|IE|ISUF|IM|email
    lines.push(`E|${order.customerName || 'CONSUMIDOR FINAL'}|9||||`);

    // ITENS
    items.forEach((item, index) => {
      const nItem = index + 1;
      // H|nItem|infAdProd
      lines.push(`H|${nItem}|`);
      
      // I|cProd|cEAN|xProd|NCM|CEST|indEscala|CNPJFab|cBenef|EXTIPI|CFOP|uCom|qCom|vUnCom|vProd|cEANTrib|uTrib|qTrib|vUnTrib|vFrete|vSeg|vDesc|vOutro|indTot|xPed|nItemPed|nFCI
      lines.push(`I|${item.sku || item.id}||${item.name}|${item.ncm || '00000000'}||||||5102|${item.unit || 'UN'}|${item.quantity}|${item.price}|${(item.price * item.quantity).toFixed(2)}||${item.unit || 'UN'}|${item.quantity}|${item.price}||||1|||`);
      
      // M|vTotTrib (Impostos aproximados)
      lines.push(`M|0.00`);
      
      // N|ICMS (Exemplo Simples Nacional - CSOSN 102)
      lines.push(`N02|0|102`);
      
      // Q|PIS
      lines.push(`Q04|08`);
      
      // S|COFINS
      lines.push(`S04|08`);
    });

    // W|Total da Nota
    const totalVprod = items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2);
    lines.push(`W|0.00|0.00|0.00|0.00|${totalVprod}|0.00|0.00|0.00|0.00|0.00|0.00|0.00|0.00|${totalVprod}|0.00|`);

    // X|Informações de Transporte (9 = Sem frete)
    lines.push(`X|9||||||`);

    // YA|Informações de Pagamento
    lines.push(`YA|01|${totalVprod}||`);

    return lines.join('\r\n');
  }
};
