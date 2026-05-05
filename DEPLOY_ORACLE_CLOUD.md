# Deploy Oracle Cloud (Always Free) - NFERIO ERP

Este guia foca na configuração da VPS Gratuita da Oracle (Ubuntu ARM64).

## 1. Preparação do Sistema
```bash
sudo apt update && sudo apt upgrade -y
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. Dependências para ACBrLib (Linux)
O ACBrLib no Linux precisa de algumas bibliotecas básicas para funcionar:
```bash
sudo apt-get install -y libxml2 libxslt1.1 libxmlsec1 openssl libssl-dev
```

## 3. Instalando o Docker (Para Evolution API)
Como você terá 24GB de RAM, rode a Evolution API via Docker para facilitar:
```bash
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

## 4. Configurando o Firewall da VPS
Além do painel da Oracle, o Ubuntu tem seu próprio firewall (iptables):
```bash
# Abrir porta do ERP
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3333 -j ACCEPT
# Abrir porta da Evolution API
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
# Salvar regras
sudo netfilter-persistent save
```

## 5. Download da ACBrLib
1. Baixe o arquivo `libacbrnfe64.so` (Versão Linux ARM64).
2. Coloque na pasta `/home/ubuntu/nferio-backend/`.
3. Adicione o caminho às variáveis de ambiente no seu `.env`:
   `LD_LIBRARY_PATH=/home/ubuntu/nferio-backend/`

---
**Dica**: Use o **PM2** para gerenciar seus processos e o **Nginx** como Proxy Reverso para colocar SSL (HTTPS) nas suas APIs.
