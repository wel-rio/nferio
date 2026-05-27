import { acbrService } from '../src/services/acbrService';

async function test() {
  console.log('Testando ACBrLib localmente...');
  try {
    await acbrService.init();
    console.log('Ambiente de DLL/SO pronto e inicializado.');
  } catch(e) {
    console.error('Falha:', (e as any).message);
  } finally {
    await acbrService.finalize();
  }
}
test();
