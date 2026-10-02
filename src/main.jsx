import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import './styles.css';

const operators = {
  algar: { slug: 'algar', name: 'Algar', logo: '/assets/images/algar.png' },
  claro: { slug: 'claro', name: 'Claro', logo: '/assets/images/claro.png' },
  correios: { slug: 'correios', name: 'Correios Celular', logo: '/assets/images/correios.png' },
  surf: { slug: 'surf', name: 'Surf Telecom', logo: '/assets/images/surf.png' },
  tim: { slug: 'tim', name: 'TIM', logo: '/assets/images/tim.png' },
  vivo: { slug: 'vivo', name: 'Vivo', logo: '/assets/images/vivo.png' },
};
const values = [20, 25, 30, 35, 40, 50, 60, 70, 100];
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const onlyDigits = value => value.replace(/\D/g, '').slice(0, 11);
const formatPhone = value => { const d = onlyDigits(value); if (d.length <= 2) return d ? `(${d}` : ''; if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`; return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; };
const formatCPF = value => { const d = value.replace(/\D/g, '').slice(0, 11); if (d.length <= 3) return d; if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`; if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`; return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`; };
const isValidCPF = value => { const d = value.replace(/\D/g, ''); if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false; let sum=0; for(let i=0;i<9;i++) sum += Number(d[i])*(10-i); let r=(sum*10)%11; if(r===10)r=0; if(r!==Number(d[9])) return false; sum=0; for(let i=0;i<10;i++) sum += Number(d[i])*(11-i); r=(sum*10)%11; if(r===10)r=0; return r===Number(d[10]); };
function path() { return window.location.pathname.replace(/\/$/, '') || '/'; }
function go(to) { window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); }

function Header() {
  const openOperators = () => {
    go('/recarga');
  };
  return <header className="topbar">
    <button className="brand" onClick={() => go('/')} aria-label="Movvia - início"><img src="/assets/images/movvia.png" alt="Movvia" /></button>
    <nav><a href="/recarga">Recarga</a><a href="/#como-funciona">Como funciona</a><a href="/sobre-nos.html">Sobre Nós</a><a href="/#duvidas">Dúvidas</a></nav>
    <button className="header-cta" onClick={openOperators}>Fazer recarga <span>→</span></button>
  </header>;
}
function Footer() {
  return <footer>
    <div>
      <img className="footer-brand-logo" src="/assets/images/movvia.png" alt="Movvia" />
      <p>Plataforma digital para consulta e solicitação de recargas pré-pagas.</p>
      <p>Confirme operadora, número e valor antes de pagar.</p>
    </div>
    <div>
      <strong>Institucional</strong>
      <a href="/sobre-nos.html">Sobre Nós</a>
      <a href="/contato.html">Contato</a>
      <a href="/recarga">Fazer recarga</a>
      <a href="/#como-funciona">Como funciona</a>
      <a href="/#duvidas">Dúvidas frequentes</a>
    </div>
    <div>
      <strong>Responsável pela plataforma</strong>
      <p>MOOVNG SERVICOS E TECNOLOGIA LTDA</p>
      <p>CNPJ: 47.952.562/0001-07</p>
      <p>R. Apotribu, 150, APT 112 — Parque Imperial<br/>São Paulo/SP — CEP 04302-000</p>
      <a href="mailto:abertura@contabilizei.com.br">abertura@contabilizei.com.br</a>
      <a href="tel:+554197880145">(41) 9788-0145</a>
    </div>
    <div className="footer-legal">
      <strong>Informações legais</strong>
      <a href="/termos-de-uso.html">Termos de Uso</a>
      <a href="/politica-de-privacidade.html">Política de Privacidade</a>
      <a href="/politica-de-reembolso.html">Política de Reembolso</a>
      <small>As marcas e logotipos das operadoras pertencem aos respectivos titulares. A presença delas na plataforma não implica afiliação, controle ou endosso.</small>
    </div>
    <small>© {new Date().getFullYear()} Movvia. Todos os direitos reservados.</small>
  </footer>;
}
function Home() {
  const [faq, setFaq] = useState(null);
  const faqs = [
    ['Posso recarregar o celular de outra pessoa?', 'Sim. Você pode informar o número de outra pessoa, escolher a operadora correspondente e selecionar o valor da recarga.'],
    ['Preciso criar uma conta?', 'Não. O processo foi pensado para ser simples e não exige criação de conta para iniciar a recarga.'],
    ['Quais operadoras aparecem?', 'A plataforma apresenta opções para Vivo, Claro, TIM, Surf Telecom, Correios Celular e Algar. A disponibilidade da recarga depende da linha e da operadora.'],
    ['Quais valores estão disponíveis?', 'Estão disponíveis recargas de R$20, R$25, R$30, R$35, R$40, R$50, R$60, R$70 e R$100.'],
    ['Como faço o pagamento?', 'Depois de informar o número e escolher o valor, você segue para a etapa de pagamento via Pix. O valor é mostrado antes da confirmação.'],
    ['A recarga é para celular pré-pago?', 'Sim. A plataforma é destinada a recargas de linhas pré-pagas nas operadoras disponíveis.']
  ];

  return <>
    <Header/>
    <main className="home home-new">
      <section className="top-banner">
        <div className="home-banner home-banner-top text-banner">
          <span className="eyebrow">RECARGA PRÉ-PAGA ONLINE</span>
          <h1>Recarga pré-paga online de forma simples e transparente.</h1>
          <p>Escolha sua operadora, informe o número que receberá a recarga, selecione o valor e confira os dados antes de realizar o pagamento via Pix.</p>
          <button className="banner-cta" onClick={() => go('/recarga')}>Fazer recarga <span>→</span></button>
        </div>
      </section>



      <section className="content-section why-section">
        <div className="content-heading">
          <span className="eyebrow">SIMPLES DO COMEÇO AO FIM</span>
          <h2>Por que utilizar a Movvia?</h2>
        </div>
        <div className="feature-list">
          <div><span>✓</span><strong>Processo simples e transparente.</strong></div>
          <div><span>✓</span><strong>Escolha a operadora e o valor da sua recarga.</strong></div>
          <div><span>✓</span><strong>Pagamento via Pix.</strong></div>
          <div><span>✓</span><strong>Informações da operação apresentadas antes do pagamento.</strong></div>
          <div><span>✓</span><strong>Recarga para o seu próprio número ou para outra pessoa.</strong></div>
          <div><span>✓</span><strong>Valores disponíveis apresentados antes da confirmação.</strong></div>
          
          <div><span>✓</span><strong>Experiência simples, sem necessidade de criar conta.</strong></div>
        </div>
      </section>

      <section id="como-funciona" className="content-section info-section">
        <div className="content-heading centered-heading">
          <span className="eyebrow">INFORMAÇÕES SOBRE RECARGA PRÉ-PAGA</span>
          <h2>Entenda como funciona.</h2>
        </div>
        <div className="info-cards">
          <article><span className="info-number">01</span><h3>Pagamento via Pix</h3><p>Escolha sua recarga e realize o pagamento pelo Pix. O valor da operação deve ser apresentado claramente antes da confirmação.</p></article>
          <article><span className="info-number">02</span><h3>Valores de R$20 a R$100</h3><p>Confira os valores disponíveis para cada opção de recarga.</p></article>
          <article><span className="info-number">03</span><h3>Opções de operadora</h3><p>A plataforma apresenta Vivo, Claro, TIM, Surf Telecom, Correios Celular e Algar. Informe o número que receberá a recarga — pode ser o seu celular ou o de outra pessoa.</p></article>
        </div>
      </section>

      <section className="content-section everything-section">
        <div className="content-heading">
          <span className="eyebrow">TUDO SOBRE SUA RECARGA PRÉ-PAGA</span>
          <h2>Recarga de celular pré-pago online.</h2>
        </div>
        <div className="article-grid">
          <article><h3>Recarga de celular pré-pago online</h3><p>Fazer uma recarga pré-paga pela Movvia é simples: informe o número que receberá a recarga, escolha a operadora, selecione o valor disponível e siga para o pagamento via Pix.</p></article>
          <article><h3>Crédito para o celular de outra pessoa</h3><p>A recarga não precisa ser para o seu próprio número. Basta informar o número que receberá a recarga, escolher a operadora da linha e o valor desejado.</p></article>
          <article><h3>Valores de R$20 a R$100</h3><p>Na Movvia, estão disponíveis recargas de R$20, R$25, R$30, R$35, R$40, R$50, R$60, R$70 e R$100. A disponibilidade e as condições da recarga dependem da operadora e serão informadas antes do pagamento.</p></article>
          <article><h3>Pagamento via Pix</h3><p>O pagamento é realizado via Pix. O valor da operação é apresentado claramente antes da confirmação.</p></article>
        </div>
      </section>

      <section id="duvidas" className="faq home-faq">
        <span className="eyebrow">PERGUNTAS FREQUENTES</span>
        <h2>Perguntas frequentes sobre recarga pré-paga</h2>
        {faqs.map(([question, answer], i) => <div className={`faq-row ${faq === i ? 'open' : ''}`} key={question}>
          <button onClick={() => setFaq(faq === i ? null : i)}><span>{question}</span><b>{faq === i ? '−' : '+'}</b></button>
          {faq === i && <p>{answer}</p>}
        </div>)}
      </section>
    </main>
    <Footer/>
  </>;
}

function RechargePage() {
  const [operatorSlug, setOperatorSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [selected, setSelected] = useState(40);
  const [error, setError] = useState('');
  const [faq, setFaq] = useState(null);

  const operator = operators[operatorSlug];

  const submit = e => {
    e.preventDefault();
    const phoneDigits = onlyDigits(phone);
    if (!operator) return setError('Escolha a operadora da linha que receberá a recarga.');
    if (phoneDigits.length !== 11 || phoneDigits[2] !== '9') return setError('Informe um celular válido com DDD (11 dígitos).');
    if (name.trim().length < 2) return setError('Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Informe um e-mail válido.');
    if (!isValidCPF(cpf)) return setError('Informe um CPF válido.');
    if (!selected) return setError('Escolha um valor para continuar.');
    const data = {
      phone: formatPhone(phone),
      operator: operator.slug,
      operatorName: operator.name,
      amount: selected,
      customer: { name: name.trim(), email: email.trim(), cpf: cpf.replace(/\D/g, '') },
      utm: (() => {
        const params = new URLSearchParams(window.location.search);
        return { utm_source: params.get('utm_source') || '', utm_medium: params.get('utm_medium') || '', utm_campaign: params.get('utm_campaign') || '', utm_content: params.get('utm_content') || '', utm_term: params.get('utm_term') || '' };
      })()
    };
    sessionStorage.setItem('recargaData', JSON.stringify(data));
    go(`/pagamento?operadora=${operator.slug}&valor=${selected}`);
  };

  return <>
    <Header/>
    <main className="recharge-page generic-recharge-page">
      <section className="generic-recharge-hero">
        <span className="eyebrow">RECARGA PRÉ-PAGA</span>
        <h1>Faça sua recarga de celular</h1>
        <p>Escolha a operadora, informe o número e selecione o valor da recarga. Confira tudo antes de seguir para o pagamento via Pix.</p>
      </section>

      <form className="operator-main-card generic-recharge-card" onSubmit={submit}>
        <div className="operator-form-section">
          <div className="operator-step-title"><span>1</span><div><strong>Escolha a operadora</strong><small>Selecione a operadora da linha que receberá a recarga.</small></div></div>
          <div className="generic-operator-grid">
            {Object.values(operators).map(op => <button type="button" key={op.slug} className={`generic-operator-option ${operatorSlug === op.slug ? 'active' : ''}`} aria-pressed={operatorSlug === op.slug} onClick={() => { setOperatorSlug(op.slug); setError(''); }}>
              <span className="operator-logo"><img src={op.logo} alt=""/></span><span className="operator-option-name"><strong>{op.name}</strong></span><span className="operator-selection-state">{operatorSlug === op.slug ? <><i aria-hidden="true">✓</i> Selecionada</> : 'Selecionar'}</span>
            </button>)}
          </div>
          <p className="helper">A Movvia é uma plataforma independente. As marcas e serviços de telecomunicações pertencem aos respectivos titulares.</p>
        </div>

        <div className="operator-form-section">
          <div className="operator-step-title"><span>2</span><div><strong>Informe o número</strong><small>Digite o celular que receberá a recarga.</small></div></div>
          <label className="field-label" htmlFor="phone">Número do celular</label>
          <input id="phone" className="phone-input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength="16" required placeholder="(00) 00000-0000" value={phone} onChange={e => { setPhone(formatPhone(e.target.value)); setError(''); }}/>
          <div className="helper">Você pode recarregar o seu número ou o celular de outra pessoa.</div>
        </div>

        <div className="operator-customer-section">
          <div className="operator-step-title"><span>3</span><div><strong>Informe seus dados</strong><small>Necessários para identificação do pagamento Pix.</small></div></div>
          <div className="customer-fields">
            <div className="customer-field customer-field-full"><label className="field-label" htmlFor="customer-name">Nome completo</label><input id="customer-name" className="text-input" type="text" autoComplete="name" maxLength="100" required placeholder="Seu nome completo" value={name} onChange={e => { setName(e.target.value); setError(''); }}/></div>
            <div className="customer-field"><label className="field-label" htmlFor="customer-email">E-mail</label><input id="customer-email" className="text-input" type="email" autoComplete="email" maxLength="120" required placeholder="voce@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}/></div>
            <div className="customer-field"><label className="field-label" htmlFor="customer-cpf">CPF</label><input id="customer-cpf" className="text-input" type="text" inputMode="numeric" autoComplete="off" maxLength="14" required placeholder="000.000.000-00" value={cpf} onChange={e => { setCpf(formatCPF(e.target.value)); setError(''); }}/></div>
          </div>
          <p className="helper">Os dados são enviados ao gateway de pagamento para identificação da transação.</p>
        </div>

        <div className="operator-values-section">
          <div className="operator-step-title"><span>4</span><div><strong>Escolha o valor da recarga</strong><small>Selecione um dos valores disponíveis.</small></div></div>
          <div className="modern-value-grid">
            {values.map(value => <button type="button" key={value} className={`modern-value-option ${selected === value ? 'active' : ''}`} onClick={() => { setSelected(value); setError(''); }}><div className="value-price"><span>VALOR DA RECARGA</span><strong>{money(value)}</strong></div></button>)}
          </div>
          <p className="value-note">O valor selecionado corresponde ao valor da recarga. Antes do pagamento, confira a operadora, o número e o valor total.</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        <div className="modern-checkout">
          <div><small>Total da recarga</small><strong>{money(selected)}</strong><span>Valor a pagar via Pix</span></div>
          <button className="primary" type="submit">Revisar e continuar <span>→</span></button>
        </div>
      </form>

      <section className="operator-trust-row">
        <div><b>Confira os dados</b><span>Verifique a operadora, o telefone e o valor antes do pagamento.</span></div>
        <div><b>Plataforma independente</b><span>A Movvia não representa as operadoras de telefonia.</span></div>
        <div><b>Atendimento</b><span>abertura@contabilizei.com.br · (41) 9788-0145</span></div>
      </section>

      <section className="faq operator-faq">
        <span className="eyebrow">DÚVIDAS FREQUENTES</span>
        <h2>Sobre a recarga</h2>
        {['Posso recarregar o celular de outra pessoa?','Preciso criar uma conta?','Quais valores estão disponíveis?','Como faço o pagamento?'].map((q, i) => <div className={`faq-row ${faq === i ? 'open' : ''}`} key={q}>
          <button onClick={() => setFaq(faq === i ? null : i)}><span>{q}</span><b>{faq === i ? '−' : '+'}</b></button>
          {faq === i && <p>{i === 0 ? 'Sim. Informe o número que receberá a recarga e selecione a operadora correspondente.' : i === 1 ? 'Não. O fluxo de recarga não exige criação de conta.' : i === 2 ? 'Os valores disponíveis são apresentados nesta página; confirme o resumo antes de pagar.' : 'O pagamento é realizado via Pix, após a conferência dos dados.'}</p>}
        </div>)}
      </section>
    </main>
    <Footer/>
  </>;
}

function PaymentPage() {
  const saved = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('recargaData') || '{}'); }
    catch { return {}; }
  }, []);
  const operator = operators[saved.operator];
  const amount = Number(saved.amount);
  const phoneDigits = onlyDigits(String(saved.phone || ''));
  const [pix, setPix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');

  useEffect(() => {
    if (!operator || !values.includes(amount) || phoneDigits.length !== 11 || phoneDigits[2] !== '9') {
      setError('Os dados desta solicitação não são válidos. Volte e revise o número e o valor.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch('/api/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        operator: operator.slug,
        phone: phoneDigits,
        customer: saved.customer,
        ...(saved.utm || {})
      })
    }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'O pagamento está indisponível no momento.');
      if (!cancelled) setPix(data.data);
    }).catch(() => {
      if (!cancelled) setError('Não foi possível iniciar o pagamento. Nenhuma cobrança foi confirmada. Tente novamente mais tarde ou fale com o atendimento.');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('qr-code');
    if (canvas && pix?.paymentData?.copyPaste) QRCode.toCanvas(canvas, pix.paymentData.copyPaste, { width: 220, margin: 1 }).catch(() => {});
  }, [pix]);
  useEffect(() => {
    const transactionId = pix?.transactionId;
    if (!transactionId) return;
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      try {
        const response = await fetch(`/api/status?transaction=${encodeURIComponent(transactionId)}`, { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && data.success && data.status) {
          setPaymentStatus(data.status);
          if (data.status === 'PAID' || data.status === 'CANCELLED' || data.status === 'REFUNDED') return;
        }
      } catch {}
      attempts += 1;
      if (!cancelled && attempts < 60) window.setTimeout(check, 5000);
    };
    check();
    return () => { cancelled = true; };
  }, [pix?.transactionId]);

  const copy = async () => {
    if (!pix?.paymentData?.copyPaste) return;
    try {
      await navigator.clipboard.writeText(pix.paymentData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar o código. Selecione e copie o código Pix manualmente.');
    }
  };

  if (!operator) return <><Header/><main className="payment-page"><section className="payment-card"><h1>Solicitação inválida</h1><p>Volte à página inicial e inicie uma nova solicitação.</p><button className="secondary" onClick={() => go('/')}>Voltar ao início</button></section></main><Footer/></>;
  return <><Header/><main className="payment-page">
    <button className="back" onClick={() => go('/recarga')}>← Voltar e editar</button>
    <div className="payment-layout">
      <section className="payment-card">
        <div className="payment-header"><span className="eyebrow">REVISÃO DO PAGAMENTO</span><h1>Pagamento via Pix</h1><p>Confira o resumo ao lado antes de pagar.</p></div>
        {loading && <div className="loading"><span className="spinner"/> Preparando pagamento...</div>}
        {error && <div className="api-error" role="alert"><strong>Pagamento indisponível</strong><p>{error}</p><button className="secondary" onClick={() => window.location.reload()}>Tentar novamente</button></div>}
        {pix && <><div className="qr-wrap"><canvas id="qr-code"/><span>Abra o aplicativo do seu banco e escaneie o código.</span></div>
          <div className="pix-copy"><label htmlFor="pix-code">Código Pix copia e cola</label><div><input id="pix-code" readOnly value={pix.paymentData.copyPaste}/><button onClick={copy}>{copied ? 'Copiado!' : 'Copiar'}</button></div></div>
          <div className={`payment-status status-${String(paymentStatus).toLowerCase()}`}>
            {paymentStatus === 'PAID' ? '✓ Pagamento confirmado' :
             paymentStatus === 'CANCELLED' ? 'Pagamento expirado ou cancelado' :
             paymentStatus === 'REFUNDED' ? 'Pagamento estornado' :
             'Aguardando confirmação do Pix'}
          </div>
          <div className="waiting">A confirmação é consultada automaticamente após o pagamento.</div></>}
      </section>
      <aside className="order-summary"><span className="eyebrow">RESUMO DA SOLICITAÇÃO</span>
        <div className="summary-operator"><img src={operator.logo} alt=""/><div><strong>Recarga {operator.name}</strong><small>{saved.phone}</small></div></div>
        <div className="summary-line"><span>Número</span><strong>{saved.phone}</strong></div>
        <div className="summary-line"><span>Valor</span><strong>{money(amount)}</strong></div>
        <div className="summary-line"><span>Pagamento</span><strong>Pix</strong></div><hr/>
        <div className="summary-total"><span>Total</span><strong>{money(amount)}</strong></div>
        <p>Antes de pagar, confira cuidadosamente o número e a operadora. A recarga poderá não ser reversível após o processamento.</p>
      </aside>
    </div>
  </main><Footer/></>;
}
function App() { const [, refresh] = useState(0); useEffect(() => { const fn = () => refresh(x => x + 1); window.addEventListener('popstate', fn); return () => window.removeEventListener('popstate', fn); }, []); const p = path().replace(/\.html$/, ''); if (p === '/pagamento') return <PaymentPage/>; if (p === '/recarga') return <RechargePage/>; if (p === '/') return <Home/>; return <><Header/><main className="payment-page"><section className="payment-card"><h1>Página não encontrada</h1><p>Confira o endereço ou volte ao início.</p><button className="secondary" onClick={() => go('/')}>Ir para o início</button></section></main><Footer/></>; }

createRoot(document.getElementById('root')).render(<App/>);
