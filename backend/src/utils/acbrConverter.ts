/**
 * Utilitário para converter dados do banco para o formato INI da ACBrLib
 */
export const acbrConverter = {
  /**
   * Converte um pedido completo para o formato INI de NF-e
   */
  orderToIni(order: any, company: any): string {
    let ini = "[infNFe]\nversao=4.00\n\n";

    // Identificação
    ini += "[Identificacao]\n";
    ini += `cNF=${Math.floor(Math.random() * 90000000) + 10000000}\n`;
    ini += `natOp=VENDA DE MERCADORIA\n`;
    ini += `indPag=0\n`;
    ini += `mod=55\n`;
    ini += `serie=1\n`;
    ini += `nNF=${order.orderNumber || 1}\n`;
    ini += `dhEmi=${new Date().toISOString()}\n`;
    ini += `tpNF=1\n`;
    ini += `idDest=1\n`; // 1=Interna, 2=Interestadual
    ini += `cMunFG=${company.codigoIbge || '3304557'}\n`;
    ini += `tpImp=1\n`;
    ini += `tpEmis=1\n`;
    ini += `tpAmb=2\n`; // 2=Homologação, 1=Produção
    ini += `finNFe=1\n`;
    ini += `indFinal=1\n`;
    ini += `indPres=1\n`;
    ini += `procEmi=0\n`;
    ini += `verProc=1.0\n\n`;

    // Emitente
    ini += "[Emitente]\n";
    ini += `CNPJ=${company.cnpj?.replace(/\D/g, '')}\n`;
    ini += `xNome=${company.razaoSocial}\n`;
    ini += `xFant=${company.nomeFantasia || company.razaoSocial}\n`;
    ini += `IE=${company.inscricaoEstadual?.replace(/\D/g, '')}\n`;
    ini += `xLgr=${company.logradouro}\n`;
    ini += `nro=${company.numero || 'S/N'}\n`;
    ini += `xBairro=${company.bairro}\n`;
    ini += `cMun=${company.codigoIbge || '3304557'}\n`;
    ini += `xMun=${company.municipio}\n`;
    ini += `UF=${company.uf}\n`;
    ini += `CEP=${company.cep?.replace(/\D/g, '')}\n`;
    ini += `cPais=1058\n`;
    ini += `xPais=BRASIL\n`;
    ini += `CRT=${company.crt || '1'}\n\n`;

    // Destinatário (Usando campos do Order)
    ini += "[Destinatario]\n";
    ini += `CNPJCPF=${order.customerDoc?.replace(/\D/g, '')}\n`;
    ini += `xNome=${order.customerName}\n`;
    ini += `indIEDest=9\n`;
    ini += `xLgr=Rua nao informada\n`; // Se você tiver endereço no Order, adicione aqui
    ini += `nro=S/N\n`;
    ini += `xBairro=Bairro\n`;
    ini += `cMun=3304557\n`;
    ini += `xMun=Rio de Janeiro\n`;
    ini += `UF=RJ\n`;
    ini += `CEP=00000000\n`;
    ini += `cPais=1058\n`;
    ini += `xPais=BRASIL\n\n`;

    // Itens
    order.items?.forEach((item: any, index: number) => {
      const i = index + 1;
      ini += `[Produto${i.toString().padStart(3, '0')}]\n`;
      ini += `cProd=${item.product?.sku || item.productId}\n`;
      ini += `cEAN=${item.product?.barcode || 'SEM GTIN'}\n`;
      ini += `xProd=${item.product?.name || 'PRODUTO'}\n`;
      ini += `NCM=${item.product?.ncm || '00000000'}\n`;
      ini += `CFOP=${order.uf === company.uf ? '5102' : '6102'}\n`;
      ini += `uCom=${item.product?.unit || 'UN'}\n`;
      ini += `qCom=${item.quantity}\n`;
      ini += `vUnCom=${item.unitPrice}\n`;
      ini += `vProd=${item.totalPrice.toFixed(2)}\n`;
      ini += `cEANTrib=${item.product?.barcode || 'SEM GTIN'}\n`;
      ini += `uTrib=${item.product?.unit || 'UN'}\n`;
      ini += `qTrib=${item.quantity}\n`;
      ini += `vUnTrib=${item.unitPrice}\n`;
      ini += `indTot=1\n\n`;

      // Impostos
      ini += `[ICMS${i.toString().padStart(3, '0')}]\n`;
      ini += `orig=${item.product?.origem || '0'}\n`;
      ini += `CSOSN=400\n\n`;

      ini += `[PIS${i.toString().padStart(3, '0')}]\n`;
      ini += `CST=07\n\n`;

      ini += `[COFINS${i.toString().padStart(3, '0')}]\n`;
      ini += `CST=07\n\n`;
    });

    // Totais
    ini += "[Total]\n";
    ini += `vBC=0.00\n`;
    ini += `vICMS=0.00\n`;
    ini += `vICMSDeson=0.00\n`;
    ini += `vBCST=0.00\n`;
    ini += `vST=0.00\n`;
    ini += `vProd=${order.totalAmount.toFixed(2)}\n`;
    ini += `vFrete=0.00\n`;
    ini += `vSeg=0.00\n`;
    ini += `vDesc=${order.discount.toFixed(2)}\n`;
    ini += `vII=0.00\n`;
    ini += `vIPI=0.00\n`;
    ini += `vPIS=0.00\n`;
    ini += `vCOFINS=0.00\n`;
    ini += `vOutro=0.00\n`;
    ini += `vNF=${order.netAmount.toFixed(2)}\n\n`;

    ini += "[DadosAdicionais]\n";
    ini += `infCpl=Pedido #${order.orderNumber}\n`;

    return ini;
  }
};
