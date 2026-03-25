// === Platform - Auth Guard ===
const session = requireAuth();
if (!session) throw new Error('Unauthorized');

// === Populate user info ===
document.getElementById('userName').textContent = session.nome;

const planoNomes = {
  avulso: 'Relatório Avulso',
  anual: 'Plano Anual',
  consultoria: 'Consultoria'
};
document.getElementById('userPlan').textContent = planoNomes[session.plano] || 'Plano Anual';

// Expiry date
if (session.expiraEm) {
  const expDate = new Date(session.expiraEm);
  document.getElementById('statExpira').textContent = expDate.toLocaleDateString('pt-BR');
}

document.getElementById('statPlano').textContent = planoNomes[session.plano] || 'Anual';

// === Welcome banner ===
const params = new URLSearchParams(window.location.search);
if (params.get('bemvindo') === '1') {
  document.getElementById('welcomeBanner').style.display = 'flex';
}

document.getElementById('closeWelcome').addEventListener('click', () => {
  document.getElementById('welcomeBanner').style.display = 'none';
  // Clean URL
  window.history.replaceState({}, '', 'plataforma.html');
});

// === Logout ===
document.getElementById('btnLogout').addEventListener('click', () => {
  if (confirm('Deseja realmente sair?')) {
    logout();
  }
});

// === Report History ===
function getUserReports() {
  const all = JSON.parse(localStorage.getItem('ipva_reports') || '[]');
  return all.filter(r => r.userId === session.userId);
}

function saveReport(report) {
  const all = JSON.parse(localStorage.getItem('ipva_reports') || '[]');
  all.unshift(report);
  localStorage.setItem('ipva_reports', JSON.stringify(all));
}

function updateStats() {
  const reports = getUserReports();
  document.getElementById('statRelatorios').textContent = reports.length;
}

function renderHistory() {
  const reports = getUserReports();
  const container = document.getElementById('reportHistory');
  const empty = document.getElementById('historyEmpty');

  if (reports.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  container.innerHTML = '';

  reports.forEach(report => {
    const date = new Date(report.criadoEm).toLocaleDateString('pt-BR');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-info">
        <div class="history-icon"><i class="fas fa-file-alt"></i></div>
        <div class="history-text">
          <strong>${report.estadoNome} — ${report.condicaoNome}</strong>
          <span>Gerado em ${date}</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn btn-outline-dark btn-sm btn-view-report" data-id="${report.id}">
          <i class="fas fa-eye"></i> Ver
        </button>
      </div>
    `;
    container.appendChild(item);
  });

  // View buttons
  container.querySelectorAll('.btn-view-report').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const report = getUserReports().find(r => r.id === id);
      if (report) displayReport(report);
    });
  });
}

// === Report Data ===
const estados = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
  'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
  'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
  'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
  'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
};

const condicoes = {
  'paraplegia': 'Paraplegia / Tetraplegia',
  'amputacao': 'Amputação ou ausência de membros',
  'paralisia_cerebral': 'Paralisia cerebral',
  'nanismo': 'Nanismo',
  'coluna': 'Problemas graves na coluna',
  'avc': 'Sequelas de AVC',
  'ler_dort': 'LER/DORT grave',
  'artrodese': 'Artrodese ou próteses',
  'cegueira': 'Cegueira total',
  'baixa_visao': 'Baixa visão',
  'visao_monocular': 'Visão monocular',
  'surdez': 'Surdez total ou parcial',
  'tea': 'Transtorno do Espectro Autista (TEA)',
  'sindrome_down': 'Síndrome de Down',
  'deficiencia_intelectual': 'Deficiência intelectual',
  'esquizofrenia': 'Esquizofrenia',
  'cancer': 'Câncer (neoplasia maligna)',
  'hiv': 'HIV/AIDS',
  'esclerose': 'Esclerose múltipla',
  'parkinson': 'Doença de Parkinson',
  'hepatopatia': 'Hepatopatia grave',
  'renal': 'Doença renal crônica',
  'cardiopatia': 'Cardiopatia grave',
  'artrite': 'Artrite reumatoide',
  'fibromialgia': 'Fibromialgia severa',
  'outra': 'Outra condição'
};

// SEFAZ links by state
const sefazLinks = {
  'AC': { url: 'https://sefaz.ac.gov.br', nome: 'SEFAZ Acre' },
  'AL': { url: 'https://sefaz.al.gov.br', nome: 'SEFAZ Alagoas' },
  'AP': { url: 'https://sefaz.ap.gov.br', nome: 'SEFAZ Amapá' },
  'AM': { url: 'https://sefaz.am.gov.br', nome: 'SEFAZ Amazonas' },
  'BA': { url: 'https://sefaz.ba.gov.br', nome: 'SEFAZ Bahia' },
  'CE': { url: 'https://sefaz.ce.gov.br', nome: 'SEFAZ Ceará' },
  'DF': { url: 'https://receita.fazenda.df.gov.br', nome: 'Secretaria de Fazenda DF' },
  'ES': { url: 'https://sefaz.es.gov.br', nome: 'SEFAZ Espírito Santo' },
  'GO': { url: 'https://economia.go.gov.br', nome: 'Secretaria de Economia GO' },
  'MA': { url: 'https://sefaz.ma.gov.br', nome: 'SEFAZ Maranhão' },
  'MT': { url: 'https://sefaz.mt.gov.br', nome: 'SEFAZ Mato Grosso' },
  'MS': { url: 'https://sefaz.ms.gov.br', nome: 'SEFAZ Mato Grosso do Sul' },
  'MG': { url: 'https://fazenda.mg.gov.br', nome: 'SEF Minas Gerais' },
  'PA': { url: 'https://sefa.pa.gov.br', nome: 'SEFA Pará' },
  'PB': { url: 'https://sefaz.pb.gov.br', nome: 'SEFAZ Paraíba' },
  'PR': { url: 'https://fazenda.pr.gov.br', nome: 'SEFA Paraná' },
  'PE': { url: 'https://sefaz.pe.gov.br', nome: 'SEFAZ Pernambuco' },
  'PI': { url: 'https://sefaz.pi.gov.br', nome: 'SEFAZ Piauí' },
  'RJ': { url: 'https://fazenda.rj.gov.br', nome: 'SEFAZ Rio de Janeiro' },
  'RN': { url: 'https://set.rn.gov.br', nome: 'SET Rio Grande do Norte' },
  'RS': { url: 'https://sefaz.rs.gov.br', nome: 'SEFAZ Rio Grande do Sul' },
  'RO': { url: 'https://sefin.ro.gov.br', nome: 'SEFIN Rondônia' },
  'RR': { url: 'https://sefaz.rr.gov.br', nome: 'SEFAZ Roraima' },
  'SC': { url: 'https://sef.sc.gov.br', nome: 'SEF Santa Catarina' },
  'SP': { url: 'https://portal.fazenda.sp.gov.br', nome: 'SEFAZ São Paulo' },
  'SE': { url: 'https://sefaz.se.gov.br', nome: 'SEFAZ Sergipe' },
  'TO': { url: 'https://sefaz.to.gov.br', nome: 'SEFAZ Tocantins' }
};

// Generate report data based on state and condition
function generateReportData(estadoSigla, condicaoKey) {
  const estadoNome = estados[estadoSigla];
  const condicaoNome = condicoes[condicaoKey] || condicaoKey;
  const sefaz = sefazLinks[estadoSigla] || { url: '#', nome: 'SEFAZ ' + estadoNome };

  // Common documents
  const docs = [
    { icon: 'fa-id-card', text: 'Documento de identidade (RG ou CNH) — original e cópia' },
    { icon: 'fa-file-medical', text: 'CPF do beneficiário' },
    { icon: 'fa-notes-medical', text: 'Laudo médico detalhado com CID-10, assinado por médico especialista, em papel timbrado' },
    { icon: 'fa-car', text: 'CRLV — Certificado de Registro e Licenciamento do Veículo' },
    { icon: 'fa-home', text: 'Comprovante de residência atualizado (últimos 90 dias)' },
    { icon: 'fa-file-alt', text: 'Requerimento de isenção preenchido (disponível no site da SEFAZ)' },
  ];

  // Add condition-specific docs
  if (['paraplegia', 'amputacao', 'paralisia_cerebral', 'coluna', 'avc', 'ler_dort', 'artrodese', 'nanismo'].includes(condicaoKey)) {
    docs.push({ icon: 'fa-car-side', text: 'CNH especial (categoria adaptada) — se o beneficiário for condutor' });
  }

  if (['tea', 'sindrome_down', 'deficiencia_intelectual', 'esquizofrenia'].includes(condicaoKey)) {
    docs.push({ icon: 'fa-user-friends', text: 'Documento do responsável legal (curador/tutor), se aplicável' });
    docs.push({ icon: 'fa-file-contract', text: 'Termo de curatela ou tutela (se houver interdição)' });
  }

  // Steps
  const steps = [
    `Obtenha o <strong>laudo médico</strong> atualizado com um especialista. O laudo deve conter o CID-10 correspondente à condição (${condicaoNome}), descrição detalhada da limitação e ser emitido em papel timbrado.`,
    `Reúna toda a <strong>documentação listada acima</strong>. Faça cópias autenticadas se exigido pelo seu estado.`,
    `Acesse o portal da <strong>${sefaz.nome}</strong> e baixe o formulário de requerimento de isenção de IPVA para PCD.`,
    `Preencha o requerimento com seus dados pessoais, dados do veículo e informações sobre a condição de saúde.`,
    `Protocole o pedido junto à <strong>Secretaria da Fazenda de ${estadoNome}</strong>, presencialmente ou pelo portal online (quando disponível).`,
    `Acompanhe o andamento do processo. O prazo médio de análise é de <strong>30 a 90 dias</strong> na via administrativa.`,
    `Após a aprovação, a isenção será registrada automaticamente no sistema e o IPVA não será mais cobrado.`
  ];

  const prazoLaudo = `O laudo médico para isenção de IPVA no estado de <strong>${estadoNome}</strong> geralmente deve ter validade de até <strong>90 dias</strong> na data do protocolo. Alguns estados aceitam laudos com validade de até 180 dias. Para condições permanentes, o laudo pode indicar que a condição é <strong>irreversível</strong>, o que pode dispensar renovação anual.`;

  const restituicao = `Você pode ter direito à <strong>restituição do IPVA pago nos últimos 5 anos</strong>. Para isso, é necessário comprovar que já possuía a condição (${condicaoNome}) no período correspondente. O pedido de restituição é feito separadamente, junto à ${sefaz.nome}, com apresentação dos comprovantes de pagamento do IPVA e laudo médico retroativo.`;

  const baseLegal = `A isenção de IPVA para PCD em <strong>${estadoNome}</strong> está fundamentada na legislação estadual de IPVA, em conformidade com a <strong>Lei Federal nº 8.989/1995</strong> (isenção de IPI), <strong>Lei Federal nº 10.690/2003</strong>, e a <strong>Constituição Federal, Art. 5º</strong> (igualdade e dignidade da pessoa humana). A jurisprudência dos tribunais estaduais e do STJ tem ampliado a interpretação para incluir diversas condições de saúde além das deficiências físicas clássicas.`;

  return {
    id: Date.now().toString(),
    userId: session.userId,
    estadoSigla,
    estadoNome,
    condicaoKey,
    condicaoNome,
    sefaz,
    docs,
    steps,
    prazoLaudo,
    restituicao,
    baseLegal,
    statusText: `O estado de <strong>${estadoNome}</strong> prevê isenção de IPVA para pessoas com <strong>${condicaoNome}</strong>. Com a documentação correta e o laudo médico atualizado, você tem amparo legal para solicitar a isenção junto à ${sefaz.nome}.`,
    criadoEm: new Date().toISOString()
  };
}

// Display report
function displayReport(report) {
  document.getElementById('reportTitle').textContent =
    `Relatório de Isenção — ${report.estadoNome} — ${report.condicaoNome}`;
  document.getElementById('reportDate').textContent =
    'Gerado em ' + new Date(report.criadoEm).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  document.getElementById('reportStatus').innerHTML = report.statusText;

  // Docs
  const docsEl = document.getElementById('reportDocs');
  docsEl.innerHTML = report.docs.map(d =>
    `<li><i class="fas ${d.icon}"></i> ${d.text}</li>`
  ).join('');

  // Steps
  const stepsEl = document.getElementById('reportSteps');
  stepsEl.innerHTML = report.steps.map(s =>
    `<li><span>${s}</span></li>`
  ).join('');

  // SEFAZ link
  document.getElementById('reportSefazLink').href = report.sefaz.url;
  document.getElementById('reportSefazText').textContent = report.sefaz.nome + ' — ' + report.sefaz.url;

  // Other
  document.getElementById('reportPrazoLaudo').innerHTML = report.prazoLaudo;
  document.getElementById('reportRestituicao').innerHTML = report.restituicao;
  document.getElementById('reportBaseLegal').innerHTML = report.baseLegal;

  // Show
  document.getElementById('reportResult').style.display = 'block';
  document.getElementById('reportResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// === Generate Report ===
document.getElementById('btnGerar').addEventListener('click', () => {
  const estado = document.getElementById('genEstado').value;
  const condicao = document.getElementById('genCondicao').value;

  if (!estado) {
    document.getElementById('genEstado').focus();
    document.getElementById('genEstado').style.borderColor = '#e74c3c';
    setTimeout(() => { document.getElementById('genEstado').style.borderColor = ''; }, 2000);
    return;
  }

  if (!condicao) {
    document.getElementById('genCondicao').focus();
    document.getElementById('genCondicao').style.borderColor = '#e74c3c';
    setTimeout(() => { document.getElementById('genCondicao').style.borderColor = ''; }, 2000);
    return;
  }

  // Check plan limits
  if (session.plano === 'avulso') {
    const reports = getUserReports();
    if (reports.length >= 1) {
      alert('Seu plano avulso permite apenas 1 relatório. Faça upgrade para o Plano Anual para relatórios ilimitados.');
      return;
    }
  }

  const report = generateReportData(estado, condicao);
  saveReport(report);
  displayReport(report);
  updateStats();
  renderHistory();
});

// === Print ===
document.getElementById('btnPrint').addEventListener('click', () => {
  window.print();
});

// === New Report ===
document.getElementById('btnNovoRelatorio').addEventListener('click', () => {
  document.getElementById('reportResult').style.display = 'none';
  document.getElementById('genEstado').value = '';
  document.getElementById('genCondicao').value = '';
  document.getElementById('generatorForm').scrollIntoView({ behavior: 'smooth' });
});

// === Init ===
updateStats();
renderHistory();
