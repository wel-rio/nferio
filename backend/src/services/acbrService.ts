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
        NFE_UltimoRetorno: this.private.lib.func('int NFE_UltimoRetorno(char* sResposta, int* esTamanho)')
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

    const buffer = Buffer.alloc(256);
    const size = [256];
    
    this.private.functions.NFE_Versao(buffer, size);
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
   * Emissão de NFe (Ainda em desenvolvimento)
   */
  async emitirNFe(dados: any): Promise<any> {
    const versao = await this.getVersao();
    return {
      success: true,
      status: `ACBrLib carregada nativamente (${versao})`,
      ambiente: process.platform,
      timestamp: new Date().toISOString()
    };
  }
};
