import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo-text">NFERIO</div>
        <Link to="/login" className="btn-login">Área do Cliente</Link>
      </nav>

      <section className="hero-section">
        <div className="animate-fade-in">
          <h1>Sua Soberania Fiscal Começa Aqui.</h1>
          <p>
            Emissão de NF-e, NFC-e e ERP Gerencial completo em uma plataforma 
            robusta, nativa e multitenant. Simples para você, potente para o seu negócio.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn-login" style={{ background: 'var(--accent-primary)', border: 'none', padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Começar Agora Gratuitamente
            </Link>
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: '800' }}>Planos que crescem com você</h2>
        <div className="pricing-grid">
          {/* Plano Básico */}
          <div className="price-card">
            <h3>Plano Básico</h3>
            <p>Ideal para microempresas</p>
            <div className="price-value">
              R$ 79,90<span>/mês</span>
            </div>
            <ul className="features-list">
              <li>Até 200 NFEs por mês</li>
              <li>ERP Gerencial Completo</li>
              <li>Suporte via Email</li>
              <li>Certificado Digital A1</li>
            </ul>
            <Link to="/register" className="btn-plan">Escolher Plano</Link>
          </div>

          {/* Plano Pro */}
          <div className="price-card popular">
            <div className="popular-badge">MAIS VENDIDO</div>
            <h3>Plano Pro</h3>
            <p>Para empresas em crescimento</p>
            <div className="price-value">
              R$ 119,90<span>/mês</span>
            </div>
            <ul className="features-list">
              <li>Até 500 NFEs por mês</li>
              <li>ERP Gerencial + Estoque</li>
              <li>Suporte Prioritário</li>
              <li>Multitenant Nativo</li>
            </ul>
            <Link to="/register" className="btn-plan primary">Escolher Plano</Link>
          </div>

          {/* Plano Ilimitado */}
          <div className="price-card">
            <h3>ERP + PDV Ilimitado</h3>
            <p>Faturamento sem limites</p>
            <div className="price-value">
              R$ 199,90<span>/mês</span>
            </div>
            <ul className="features-list">
              <li>NFEs e NFCes Ilimitadas</li>
              <li>PDV Incluso (Frente de Caixa)</li>
              <li>Até 2 Usuários no PDV</li>
              <li>Gestão Financeira Avançada</li>
            </ul>
            <Link to="/register" className="btn-plan">Escolher Plano</Link>
          </div>
        </div>
      </section>

      </section>

      {/* Marketing Section: Features Display */}
      <section className="market-features" style={{ padding: '8rem 5%', background: 'linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.5))' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tecnologia que Impulsiona sua Empresa
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            Não é apenas emissão fiscal. É um ecossistema completo desenhado para máxima performance e facilidade de uso.
          </p>
        </div>

        <div className="market-grid" style={{ display: 'grid', gap: '4rem' }}>
          
          {/* Feature 1: PDV */}
          <div className="market-item" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }}>
            <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <img src="/previews/pdv.png" alt="PDV Moderno" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
            </div>
            <div>
              <div style={{ color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.1em' }}>FRENTE DE CAIXA</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>PDV Blindado e Veloz</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                Venda em segundos com nossa interface otimizada. Sincronização em tempo real com estoque e financeiro, 
                suporte a múltiplas formas de pagamento e emissão instantânea de NFC-e.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Teclas de atalho para produtividade</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Funcionamento Offline com Sincronia</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Integração total com balanças e scanners</li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Clientes (Inverted) */}
          <div className="market-item" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#10b981', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.1em' }}>CRM & GESTÃO</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Cadastro de Clientes Inteligente</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                Conheça seu cliente de verdade. Histórico de compras, limites de crédito automatizados e 
                integração com consulta de CNPJ/CPF direto da nuvem.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Segmentação por perfil de compra</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Controle de inadimplência em tempo real</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Exportação de relatórios para marketing</li>
              </ul>
            </div>
            <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <img src="/previews/customers.png" alt="Gestão de Clientes" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
            </div>
          </div>

          {/* Feature 3: Produtos */}
          <div className="market-item" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }}>
            <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <img src="/previews/products.png" alt="Catálogo de Produtos" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.1em' }}>ESTOQUE & COMPRAS</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Estoque Global e Dinâmico</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                Nunca perca uma venda por falta de produto. Controle de grades, números de série, validade 
                e sugestão automática de compras baseada no giro de estoque.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Leitura de XML de entrada automatizada</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Ajuste de preços em massa</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Relatórios de Curva ABC de produtos</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      <section className="about-section" style={{ padding: '8rem 5%', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Poder de Gigante, Simplicidade de Startup</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.8' }}>
              A NFERIO nasceu para resolver a complexidade fiscal brasileira. Como parte do ecossistema <strong>2SCONECT</strong>, 
              herdamos a tecnologia de ponta e a robustez de sistemas que já processam milhares de transações diariamente. 
              Nossa missão é garantir que você foque em vender, enquanto nós cuidamos da burocracia.
            </p>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', marginBottom: '1rem' }}>2SCONECT Group</div>
            <p style={{ color: '#cbd5e1' }}>Inovação em Automação e Gestão</p>
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed rgba(139, 92, 246, 0.3)', borderRadius: '12px', fontSize: '0.9rem', color: '#94a3b8' }}>
              NFERIO é um software oficial 2SCONECT.
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '5rem 5%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo-text" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>NFERIO</div>
          <p>By 2SCONECT TECHNOLOGY</p>
        </div>
        <p>&copy; 2026 NFERIO - Tecnologia Fiscal e Gerencial. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
