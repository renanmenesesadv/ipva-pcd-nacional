// === Shared Auth Utilities ===

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const icon = btn.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });
});

// Phone mask
const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      this.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
    } else if (v.length > 2) {
      this.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    } else if (v.length > 0) {
      this.value = '(' + v;
    }
  });
}

// Check session helper
function getSession() {
  try {
    return JSON.parse(localStorage.getItem('ipva_session') || 'null');
  } catch {
    return null;
  }
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html?acesso=negado';
    return null;
  }
  return session;
}

function logout() {
  localStorage.removeItem('ipva_session');
  window.location.href = 'login.html';
}
