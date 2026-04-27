/* =========================================================
   TravelHub – jsFunctions.js
   Shared utilities used across all pages
========================================================= */

/* ---------------------------------------------------------
   NAVBAR HAMBURGER TOGGLE
--------------------------------------------------------- */
function initNavbar() {
  const toggle = document.getElementById('menuToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
  });

  // Close menu when a link is clicked (mobile)
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('open'));
  });
}

/* ---------------------------------------------------------
   DARK MODE TOGGLE
--------------------------------------------------------- */
function toggleDarkMode() {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

function applyStoredTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

/* ---------------------------------------------------------
   NOTIFICATION / TOAST
--------------------------------------------------------- */
function showNotification(message, type = 'success') {
  const existing = document.getElementById('th-notification');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'th-notification';
  el.className = type === 'error' ? 'notice notice-error' : 'notice notice-success';
  el.textContent = message;
  Object.assign(el.style, {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: '9999',
    maxWidth: '360px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.3s ease'
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* ---------------------------------------------------------
   FORM VALIDATION HELPERS
--------------------------------------------------------- */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(pw) {
  return pw.length >= 6;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  let err = field.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    err.style.cssText = 'color:#dc2626;font-size:0.82rem;display:block;margin-top:4px;';
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
  field.style.borderColor = '#dc2626';
}

function clearFieldErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('input, textarea, select').forEach(f => f.style.borderColor = '');
}

/* ---------------------------------------------------------
   LOGIN FORM VALIDATION
--------------------------------------------------------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearFieldErrors('loginForm');

    const email    = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let valid = true;

    if (!validateEmail(email.value)) {
      showFieldError('loginEmail', 'Please enter a valid email address.');
      valid = false;
    }
    if (!validatePassword(password.value)) {
      showFieldError('loginPassword', 'Password must be at least 6 characters.');
      valid = false;
    }

    if (valid) {
      localStorage.setItem('th_user', JSON.stringify({ email: email.value }));
      showNotification('Login successful! Redirecting…');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    }
  });
}

/* ---------------------------------------------------------
   SIGNUP FORM VALIDATION
--------------------------------------------------------- */
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearFieldErrors('signupForm');

    const name     = document.getElementById('signupName');
    const email    = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const confirm  = document.getElementById('signupConfirm');
    let valid = true;

    if (!name || name.value.trim().length < 2) {
      showFieldError('signupName', 'Please enter your full name.');
      valid = false;
    }
    if (!validateEmail(email.value)) {
      showFieldError('signupEmail', 'Please enter a valid email address.');
      valid = false;
    }
    if (!validatePassword(password.value)) {
      showFieldError('signupPassword', 'Password must be at least 6 characters.');
      valid = false;
    }
    if (confirm && password.value !== confirm.value) {
      showFieldError('signupConfirm', 'Passwords do not match.');
      valid = false;
    }

    if (valid) {
      localStorage.setItem('th_user', JSON.stringify({ name: name.value, email: email.value }));
      showNotification('Account created! Redirecting to login…');
      setTimeout(() => { window.location.href = 'login.html'; }, 1400);
    }
  });
}

/* ---------------------------------------------------------
   TAB SYSTEM
--------------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      const parent = btn.closest('.tab-nav').parentElement;

      // Deactivate all buttons/panels within this group
      btn.closest('.tab-nav').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      // Activate selected
      btn.classList.add('active');
      const panel = parent.querySelector(`.tab-panel[data-tab="${target}"]`);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ---------------------------------------------------------
   ITINERARY BUILDER
--------------------------------------------------------- */
function initItineraryBuilder() {
  const form       = document.getElementById('builderForm');
  const tableBody  = document.getElementById('itineraryBody');
  const totalEl    = document.getElementById('totalCost');
  const emptyRow   = document.getElementById('emptyRow');

  if (!form) return;

  let items = JSON.parse(localStorage.getItem('th_itinerary') || '[]');

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    let total = 0;

    if (items.length === 0) {
      const tr = document.createElement('tr');
      tr.id = 'emptyRow';
      tr.innerHTML = '<td colspan="5" class="table-empty">No activities added yet. Use the form to get started!</td>';
      tableBody.appendChild(tr);
    } else {
      items.forEach((item, index) => {
        total += parseFloat(item.cost) || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.day}</td>
          <td>${escapeHtml(item.activity)}</td>
          <td>${escapeHtml(item.location)}</td>
          <td>$${parseFloat(item.cost).toFixed(2)}</td>
          <td><button onclick="removeItem(${index})" style="color:#dc2626;background:none;padding:4px 8px;">✕ Remove</button></td>
        `;
        tableBody.appendChild(tr);
      });
    }

    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }

  window.removeItem = function(index) {
    items.splice(index, 1);
    localStorage.setItem('th_itinerary', JSON.stringify(items));
    renderTable();
  };

  window.clearItinerary = function() {
    if (confirm('Clear all itinerary items?')) {
      items = [];
      localStorage.removeItem('th_itinerary');
      renderTable();
    }
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const day      = document.getElementById('itemDay').value.trim();
    const activity = document.getElementById('itemActivity').value.trim();
    const location = document.getElementById('itemLocation').value.trim();
    const cost     = document.getElementById('itemCost').value;

    if (!day || !activity) {
      showNotification('Please fill in Day and Activity fields.', 'error');
      return;
    }

    items.push({ day, activity, location, cost: cost || '0' });
    localStorage.setItem('th_itinerary', JSON.stringify(items));
    renderTable();
    form.reset();
    showNotification('Activity added to itinerary!');
  });

  renderTable();
}

/* ---------------------------------------------------------
   FAVORITES (localStorage)
--------------------------------------------------------- */
function addToFavorites(id, name) {
  const favs = JSON.parse(localStorage.getItem('th_favorites') || '[]');
  if (!favs.find(f => f.id === id)) {
    favs.push({ id, name });
    localStorage.setItem('th_favorites', JSON.stringify(favs));
    showNotification(`${name} added to your favourites!`);
  } else {
    showNotification(`${name} is already in your favourites.`, 'error');
  }
}

/* ---------------------------------------------------------
   LOGOUT
--------------------------------------------------------- */
function logout() {
  localStorage.removeItem('th_user');
  window.location.href = '../index.html';
}

/* ---------------------------------------------------------
   CONTACT FORM
--------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearFieldErrors('contactForm');

    const name    = document.getElementById('contactName');
    const email   = document.getElementById('contactEmail');
    const message = document.getElementById('contactMessage');
    let valid = true;

    if (!name || name.value.trim().length < 2) {
      showFieldError('contactName', 'Please enter your name.'); valid = false;
    }
    if (!validateEmail(email.value)) {
      showFieldError('contactEmail', 'Please enter a valid email address.'); valid = false;
    }
    if (!message || message.value.trim().length < 10) {
      showFieldError('contactMessage', 'Message must be at least 10 characters.'); valid = false;
    }

    if (valid) {
      showNotification('Message sent! We'll get back to you soon.');
      form.reset();
    }
  });
}

/* ---------------------------------------------------------
   FAQ ACCORDION
--------------------------------------------------------- */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.display = 'none';
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.display = 'block';
      }
    });
  });
}

/* ---------------------------------------------------------
   UTILITY
--------------------------------------------------------- */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/* ---------------------------------------------------------
   INIT ON DOM READY
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  initNavbar();
  initTabs();
  initLoginForm();
  initSignupForm();
  initItineraryBuilder();
  initContactForm();
  initFAQ();
});
