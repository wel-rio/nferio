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

      <section className="about-section" style={{ padding: '5rem 5%', background: 'rgba(255,255,255,0.02)' }}>
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
