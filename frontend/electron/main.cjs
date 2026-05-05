const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "NFERIO PDV",
    backgroundColor: '#09090b',
    // icon: path.join(__dirname, '../public/icon.ico')
  });

  // Em desenvolvimento usa o Vite, em produção usa o build
  const startUrl = isDev 
    ? 'http://localhost:5173/pdv' 
    : `file://${path.join(__dirname, '../dist/index.html#/pdv')}`;

  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Aqui entrarão as integrações com a Balança (SerialPort) e Impressora
ipcMain.on('read-scale', (event) => {
  try {
    // Tenta carregar o serialport. Se não existir (ambiente dev sem install), manda mock.
    const { SerialPort } = require('serialport');
    const { ReadlineParser } = require('@serialport/parser-readline');

    // CONFIGURAÇÃO DA BALANÇA (Exemplo: Porta COM3, 9600 baud)
    // O ideal seria pegar isso das configurações do sistema
    const port = new SerialPort({ path: 'COM3', baudRate: 9600, autoOpen: false });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r' }));

    port.open((err) => {
      if (err) {
        console.error('Erro ao abrir porta da balança:', err.message);
        event.reply('scale-error', err.message);
        return;
      }
      
      parser.once('data', (data) => {
        // Ex: Balança manda "00.550" ou "  0.550kg"
        const weight = parseFloat(data.replace(/[^0-9.]/g, ''));
        event.reply('scale-data', { weight });
        port.close();
      });
    });
  } catch (e) {
    // MOCK PARA TESTE SE NÃO TIVER BIBLIOTECA
    console.log('SerialPort não instalado. Enviando peso simulado...');
    setTimeout(() => {
      event.reply('scale-data', { weight: 1.255 });
    }, 500);
  }
});

ipcMain.on('print-receipt', (event, data) => {
  console.log('Solicitação de impressão recebida:', data);
  event.reply('print-success', true);
});

// INTEGRAÇÃO ACBrLib (Sem APIs de terceiros)
ipcMain.on('emit-nfe', async (event, { txtContent, certificatePath, certificatePassword }) => {
  console.log('Iniciando emissão ACBrLib...');
  
  try {
    // IMPORTANTE: Em um ambiente real, você usaria ffi-napi para carregar a ACBrLib.dll
    // const ffi = require('ffi-napi');
    // const acbr = ffi.Library('ACBrNFe64.dll', { ... });
    
    // 1. Carrega o TXT no ACBr
    console.log('Carregando TXT no componente ACBr...');
    
    // 2. Assina e Transmite
    console.log('Assinando e Transmitindo...');
    
    // Simulando delay de processamento local
    setTimeout(() => {
      // 3. Retorna Sucesso e o XML assinado
      event.reply('nfe-success', { 
        xml: '<?xml ... ?>', 
        protocolo: '13524000... ',
        chave: '352405...'
      });
    }, 2000);

  } catch (error) {
    console.error('Erro ACBrLib:', error);
    event.reply('nfe-error', 'Erro ao processar ACBrLib localmente. Verifique se as DLLs estão na pasta do sistema.');
  }
});
