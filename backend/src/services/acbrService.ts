import path from 'path';
import fs from 'fs';
import koffi from 'koffi';

/**
 * Gateway Fiscal NFERIO - Motor Stateless
 * Gerencia a comunicação com a ACBrLib de forma isolada por request.
 */

// Trava de execução (Mutex simples para garantir 1 request por vez)
let isProcessing = false;
const queue: (() => void)[] = [];

const lock = async () => {
  if (!isProcessing) {
    isProcessing = true;
    return;
  }
  return new Promise<void>((resolve) => queue.push(resolve));
};

const unlock = () => {
  if (queue.length > 0) {
    const next = queue.shift();
    if (next) next();
  } else {
    isProcessing = false;
  }
};

export const acbrService = {
  // Caminho da biblioteca
  dllPath: process.platform === 'win32' 
    ? path.join(process.cwd(), 'acbr', 'ACBrNFe64.dll')
    : '/usr/lib/libacbrnfe64.so',

  lib: null as any,
  functions: {} as any,

  /**
   * Carrega e Inicializa a biblioteca para um uso específico
   */
  async init() {
    if (!this.lib) {
      console.log('📦 Carregando binário ACBrLib...');
      this.lib = koffi.load(this.dllPath);
      this.functions = {
        NFE_Inicializar: this.lib.func('int NFE_Inicializar(const char* eArqConfig, const char* eChaveCrypt)'),
        NFE_Finalizar: this.lib.func('int NFE_Finalizar()'),
        NFE_ConfigGravarValor: this.lib.func('int NFE_ConfigGravarValor(const char* eSessao, const char* eChave, const char* eValor)'),
        NFE_CarregarINI: this.lib.func('int NFE_CarregarINI(const char* eArquivoOuIni)'),
        NFE_Assinar: this.lib.func('int NFE_Assinar()'),
        NFE_Validar: this.lib.func('int NFE_Validar()'),
        NFE_Enviar: this.lib.func('int NFE_Enviar(int ALote, bool AImprimir, bool ASincrono, out Buffer sResposta, out int* esTamanho)'),
        NFE_ObterCertificadoDataVencimento: this.lib.func('int NFE_ObterCertificadoDataVencimento(out Buffer sResposta, out int* esTamanho)'),
        NFE_UltimoRetorno: this.lib.func('int NFE_UltimoRetorno(out Buffer sResposta, out int* esTamanho)')
      };
    }
    
    const res = this.functions.NFE_Inicializar('', '');
    if (res !== 0 && res !== 1) throw new Error(`Erro ao inicializar ACBrLib: ${res}`);
  },

  /**
   * Finaliza a biblioteca limpando a memória
   */
  async finalize() {
    if (this.functions.NFE_Finalizar) {
      this.functions.NFE_Finalizar();
    }
  },

  /**
   * Configura os dados da empresa e certificado em memória (via arquivo temporário rápido)
   */
  async setupContext(company: any, certBuffer?: Buffer) {
    console.log(`🔐 Configurando contexto fiscal: ${company.razaoSocial || 'Empresa'}`);

    // DFe -> SSL Libs (Linux)
    this.functions.NFE_ConfigGravarValor("DFe", "SSLCryptLib", "1");
    this.functions.NFE_ConfigGravarValor("DFe", "SSLHttpLib", "3");
    this.functions.NFE_ConfigGravarValor("DFe", "SSLXmlSignLib", "4");

    // Certificado
    if (certBuffer) {
      const tempCertPath = path.join(process.cwd(), 'acbr', 'temp_cert_' + Date.now() + '.pfx');
      fs.writeFileSync(tempCertPath, certBuffer);
      this.functions.NFE_ConfigGravarValor("DFe", "ArquivoPFX", tempCertPath);
      
      // Armazena o path no objeto para deletar depois
      (company as any)._tempPath = tempCertPath;
    }

    if (company.senhaCertificado || company.certificadoSenha) {
      this.functions.NFE_ConfigGravarValor("DFe", "Senha", company.senhaCertificado || company.certificadoSenha);
    }

    this.functions.NFE_ConfigGravarValor("NFe", "Ambiente", company.tpAmb || "2");
  },

  /**
   * Wrapper Seguro para Execução Fiscal (Garante Fila + Init/Finalize)
   */
  async runSafe<T>(company: any, certBuffer: Buffer | undefined, task: () => Promise<T>): Promise<T> {
    await lock();
    try {
      await this.init();
      await this.setupContext(company, certBuffer);
      const result = await task();
      return result;
    } finally {
      // Limpa rastro do certificado no disco imediatamente
      if ((company as any)._tempPath && fs.existsSync((company as any)._tempPath)) {
        fs.unlinkSync((company as any)._tempPath);
      }
      await this.finalize();
      unlock();
    }
  },

  /**
   * Emissão de NFe
   */
  async emitirNFe(dados: string, company: any, certBuffer?: Buffer): Promise<any> {
    return this.runSafe(company, certBuffer, async () => {
      let res = this.functions.NFE_CarregarINI(dados);
      if (res !== 0) throw new Error(`Erro ao carregar INI: ${res}`);

      res = this.functions.NFE_Assinar();
      if (res !== 0) throw new Error(`Erro ao assinar: ${res}`);

      res = this.functions.NFE_Validar();
      if (res !== 0) throw new Error(`Erro ao validar: ${res}`);

      const buffer = Buffer.alloc(8192);
      const size = new Int32Array([8192]);
      res = this.functions.NFE_Enviar(1, false, true, buffer, size);

      return {
        success: res === 0,
        retorno: buffer.toString('utf8').replace(/\0/g, '').trim()
      };
    });
  },

  /**
   * Consulta Vencimento
   */
  async getCertDate(company: any, certBuffer?: Buffer): Promise<string> {
    return this.runSafe(company, certBuffer, async () => {
      const buffer = Buffer.alloc(256);
      const size = new Int32Array([256]);
      const res = this.functions.NFE_ObterCertificadoDataVencimento(buffer, size);
      if (res !== 0) return "Erro na leitura";
      return buffer.toString('utf8').replace(/\0/g, '').trim();
    });
  }
};
