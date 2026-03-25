// === Header scroll effect ===
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// === Mobile menu ===
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

// === FAQ Accordion ===
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

    // Toggle current
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// === Counter animation ===
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      // Format numbers with dots for thousands
      counter.textContent = current.toLocaleString('pt-BR');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  });
}

// === Scroll reveal ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      const delay = index * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.benefit-card, .eligibility-category, .step, .state-card, .testimonial-card, .faq-item, .pricing-card').forEach(el => {
  observer.observe(el);
});

// === Counter observer ===
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  heroObserver.observe(heroStats);
}

// === Smooth scroll for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// === Verificador (Preview + Paywall Flow) ===
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

const selectEstado = document.getElementById('selectEstado');
const selectCondicao = document.getElementById('selectCondicao');
const btnStep1 = document.getElementById('btnStep1');
const btnStep2 = document.getElementById('btnStep2');
const formStep1 = document.getElementById('formStep1');
const formStep2 = document.getElementById('formStep2');
const verificadorForm = document.getElementById('verificadorForm');
const previewResult = document.getElementById('previewResult');
const previewSummary = document.getElementById('previewSummary');

if (btnStep1) {
  btnStep1.addEventListener('click', () => {
    if (!selectEstado.value) {
      selectEstado.focus();
      selectEstado.style.borderColor = '#e74c3c';
      setTimeout(() => { selectEstado.style.borderColor = ''; }, 2000);
      return;
    }
    formStep1.classList.remove('active');
    formStep2.classList.add('active');
  });
}

if (btnStep2) {
  btnStep2.addEventListener('click', () => {
    if (!selectCondicao.value) {
      selectCondicao.focus();
      selectCondicao.style.borderColor = '#e74c3c';
      setTimeout(() => { selectCondicao.style.borderColor = ''; }, 2000);
      return;
    }

    const estadoNome = estados[selectEstado.value] || selectEstado.value;
    const condicaoNome = condicoes[selectCondicao.value] || selectCondicao.value;

    previewSummary.innerHTML = `O estado de <strong>${estadoNome}</strong> possui legislação que prevê isenção de IPVA para pessoas com <strong>${condicaoNome}</strong>. Veja abaixo o que está incluído no seu relatório completo.`;

    verificadorForm.style.display = 'none';
    previewResult.style.display = 'block';
  });
}

// === Pricing button clicks — redirect to registration ===
document.querySelectorAll('.btn-pricing').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const plan = btn.getAttribute('data-plan');
    window.location.href = 'cadastro.html?plano=' + plan;
  });
});
