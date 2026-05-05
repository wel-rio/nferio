# Guia de Implantação: NFERIO ERP na VPS (API Fiscal Própria)

Como você escolheu a **Opção 2**, aqui estão os passos exatos para configurar sua própria API Fiscal usando ACBrLib sem custos de terceiros.

## 1. Recomendação de Servidor
Para usar ACBrLib com Node.js de forma estável, a recomendação é uma **VPS Windows Server** (2019 ou 2022).
*   **Motivo**: As DLLs do ACBr são nativas de Windows. Rodar em Linux exige Wine, o que torna a configuração muito mais complexa.

## 2. O que instalar na VPS
1.  **Node.js** (Versão 18 ou superior).
2.  **Git** (Para clonar seu repositório).
3.  **ACBrLibNFe** (Baixe a versão C para Windows - 64 bits).
    *   Coloque a `ACBrNFe64.dll` e as dependências (OpenSSL, libxml2, etc.) na pasta raiz do seu backend.
4.  **Ferramentas de Compilação**:
    *   No Windows, execute no PowerShell como Admin:
        `npm install --global --production windows-build-tools`
        (Isso é necessário para a biblioteca `ffi-napi` que comunica o Node com a DLL).

## 3. Preparando o Backend
No seu código do backend, instale as bibliotecas de ponte:
```bash
npm install ffi-napi ref-napi
```

## 4. Configuração do Certificado Digital
O certificado A1 (.pfx) deve ser carregado para o servidor. O sistema que construímos já tem a interface para salvar o caminho e a senha no banco de dados.

## 5. Rodando em Produção
Use o **PM2** para garantir que sua API fique online 24/7:
```bash
npm install -g pm2
pm2 start dist/server.js --name nferio-backend
```

---

### Vantagens desta estrutura:
*   **SaaS Real**: Seus clientes acessam via Web de qualquer lugar.
*   **Custo Fixo**: Você paga apenas a mensalidade da VPS (ex: R$ 50 a R$ 100).
*   **Performance**: O processamento é centralizado e rápido.
*   **Multitenant**: O mesmo servidor atende todas as empresas cadastradas no seu banco de dados.
