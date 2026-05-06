import path from 'path';
import fs from 'fs';
import koffi from 'koffi';

/**
 * Serviço para interfacear com a ACBrLib usando Koffi
 */
export const acbrService = {
  // Caminho da biblioteca
  dllPath: process.platform === 'win32' 
    ? path.resolve(__dirname, '../../acbr/lib/ACBrNFe64.dll')
    : '/home/ubuntu/nferio/backend/acbr/lib/libacbrnfe64.so',

  // Caminho do arquivo de configuração
  iniPath: process.platform === 'win32'
    ? path.resolve(__dirname, '../../acbr/acbrlib.ini')
    : '/home/ubuntu/nferio/backend/acbr/acbrlib.ini',

  private: {
    lib: null as any,
    functions: {} as any
  },

  /**
   * Inicializa a biblioteca ACBrLib
   */
  async init() {
    try {
      if (!fs.existsSync(this.dllPath)) {
        throw new Error(`Biblioteca não encontrada em: ${this.dllPath}`);
      }

      console.log(`📚 Carregando ACBrLib: ${this.dllPath}`);
      this.private.lib = koffi.load(this.dllPath);

      // Definição das funções básicas (Cdecl é o padrão da ACBrLib no Linux e DLLs de 64-bit)
      this.private.functions = {
        NFE_Inicializar: this.private.lib.func('int NFE_Inicializar(const char* eArqConfig, const char* eChaveCrypt)'),
        NFE_Finalizar: this.private.lib.func('int NFE_Finalizar()'),
        NFE_Versao: this.private.lib.func('int NFE_Versao(char* sResposta, int* esTamanho)'),
        NFE_UltimoRetorno: this.private.lib.func('int NFE_UltimoRetorno(char* sResposta, int* esTamanho)'),
        NFE_ConfigGravarValor: this.private.lib.func('int NFE_ConfigGravarValor(const char* sSecao, const char* sChave, const char* sValor)'),
        NFE_CarregarINI: this.private.lib.func('int NFE_CarregarINI(const char* eArquivoOuIni)'),
        NFE_Assinar: this.private.lib.func('int NFE_Assinar()'),
        NFE_Validar: this.private.lib.func('int NFE_Validar()'),
        NFE_Enviar: this.private.lib.func('int NFE_Enviar(int aLote, bool aImprimir, bool aSincrono, char* sResposta, int* esTamanho)'),
      };

      // Inicializa a lib com o arquivo INI
      const res = this.private.functions.NFE_Inicializar(this.iniPath, "");
      if (res !== 0) {
        throw new Error(`Erro ao inicializar ACBrLib: ${res}`);
      }

      console.log('✅ ACBrLib Inicializada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('❌ Falha na ACBrLib:', error.message);
      return false;
    }
  },

  /**
   * Obtém a versão da biblioteca
   */
  async getVersao(): Promise<string> {
    if (!this.private.functions.NFE_Versao) return "Não inicializada";

    // No Koffi, para int* de saída, usamos um Buffer ou TypedArray
    const buffer = Buffer.alloc(256);
    const size = new Int32Array([256]);
    
    const res = this.private.functions.NFE_Versao(buffer, size);
    if (res !== 0) return `Erro ao obter versão: ${res}`;

    return buffer.toString('utf8').replace(/\0/g, '').trim();
  },

  /**
   * Valida o ambiente
   */
  async checkEnvironment() {
    console.log(`🔍 Verificando ambiente: ${process.platform}`);
    const exists = fs.existsSync(this.dllPath);
    if (!exists) {
      console.warn(`⚠️ Aviso: Biblioteca não encontrada em ${this.dllPath}`);
      return false;
    }
    
    // Tenta inicializar de verdade
    return await this.init();
  },

  /**
   * Configura os dados do certificado do cliente dinamicamente
   */
  async configurarEmpresa(company: any) {
    if (!this.private.functions.NFE_ConfigGravarValor) return;

    console.log(`🔐 Configurando certificado para: ${company.razaoSocial}`);

    // DFe -> SSL Libs (Necessário para Linux)
    this.private.functions.NFE_ConfigGravarValor("DFe", "SSLCryptLib", "1");
    this.private.functions.NFE_ConfigGravarValor("DFe", "SSLHttpLib", "3");
    this.private.functions.NFE_ConfigGravarValor("DFe", "SSLXmlSignLib", "4");

    // Certificado
    if (company.certificadoPath) {
      this.private.functions.NFE_ConfigGravarValor("DFe", "ArquivoPFX", company.certificadoPath);
    }
    if (company.certificadoSenha) {
      this.private.functions.NFE_ConfigGravarValor("DFe", "Senha", company.certificadoSenha);
    }

    // Ambiente (1=Produção, 2=Homologação)
    // Por enquanto forçando 2 para segurança, mas pode vir do banco
    this.private.functions.NFE_ConfigGravarValor("NFe", "Ambiente", "2");
  },

  /**
   * Emissão de NFe real
   */
  async emitirNFe(dados: string, company: any): Promise<any> {
    try {
      if (!this.private.functions.NFE_CarregarINI) throw new Error("Biblioteca não inicializada");

      // 1. Configura a lib para este cliente específico
      await this.configurarEmpresa(company);

      // 2. Carrega os dados (INI)
      let res = this.private.functions.NFE_CarregarINI(dados);
      if (res !== 0) throw new Error(`Erro ao carregar dados (NFE_CarregarINI): ${res}`);

      // 2. Assina
      res = this.private.functions.NFE_Assinar();
      if (res !== 0) throw new Error(`Erro ao assinar nota (NFE_Assinar): ${res}`);

      // 3. Valida
      res = this.private.functions.NFE_Validar();
      if (res !== 0) throw new Error(`Erro ao validar nota (NFE_Validar): ${res}`);

      // 4. Envia (Lote: 1, Imprimir: false, Sincrono: true)
      const buffer = Buffer.alloc(4096);
      const size = new Int32Array([4096]);
      res = this.private.functions.NFE_Enviar(1, false, true, buffer, size);

      const resposta = buffer.toString('utf8').replace(/\0/g, '').trim();

      return {
        success: res === 0,
        code: res,
        resposta,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("❌ Erro na emissão ACBr:", error.message);
      
      // Tenta pegar o último erro detalhado da lib
      const bufferErro = Buffer.alloc(1024);
      const sizeErro = new Int32Array([1024]);
      this.private.functions.NFE_UltimoRetorno(bufferErro, sizeErro);
      const msgErro = bufferErro.toString('utf8').replace(/\0/g, '').trim();

      return {
        success: false,
        error: error.message,
        detalhes: msgErro,
        timestamp: new Date().toISOString()
      };
    }
  },
  /**
   * Apenas valida a NFe sem enviar
   */
  async validarNFe(dados: string, company: any): Promise<any> {
    try {
      if (!this.private.functions.NFE_CarregarINI) throw new Error("Biblioteca não inicializada");
      await this.configurarEmpresa(company);

      let res = this.private.functions.NFE_CarregarINI(dados);
      if (res !== 0) throw new Error(`Erro ao carregar dados: ${res}`);

      res = this.private.functions.NFE_Assinar();
      if (res !== 0) throw new Error(`Erro ao assinar: ${res}`);

      res = this.private.functions.NFE_Validar();
      
      const buffer = Buffer.alloc(1024);
      const size = new Int32Array([1024]);
      this.private.functions.NFE_UltimoRetorno(buffer, size);
      const resposta = buffer.toString('utf8').replace(/\0/g, '').trim();

      return {
        success: res === 0,
        code: res,
        message: res === 0 ? "Nota validada com sucesso!" : "Erro na validação",
        detalhes: resposta
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
