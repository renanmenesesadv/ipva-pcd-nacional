// === Alert bar offset for header ===
(function () {
  const alertBar = document.querySelector('.alert-bar');
  const header = document.getElementById('header');
  if (alertBar && header) {
    const alertHeight = alertBar.offsetHeight;
    header.style.top = alertHeight + 'px';
    document.body.style.paddingTop = (alertHeight + header.offsetHeight) + 'px';

    // Recalculate on resize
    window.addEventListener('resize', () => {
      const h = alertBar.offsetHeight;
      header.style.top = h + 'px';
      document.body.style.paddingTop = (h + header.offsetHeight) + 'px';
    });
  }
})();

// === Header scroll effect ===
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// === Mobile menu toggle ===
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

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
  document.querySelectorAll('.proof-number').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    if (!target) return;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
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
  rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      const delay = index * 60;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.pain-card, .eligible-category, .step, .benefit-card, .testimonial-card, .receive-item, .objection-card, .pricing-card, .faq-item, .fade-in'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// === Counter observer ===
const proofSection = document.querySelector('.proof-stats');
if (proofSection) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counterObserver.observe(proofSection);
}

// === Smooth scroll for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetEl = document.querySelector(this.getAttribute('href'));
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
