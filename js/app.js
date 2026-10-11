const icons = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1.6-3.6 4.4-5.4 7.5-5.4s5.9 1.8 7.5 5.4"/></svg>`,
  star: `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.8 1.1-5.9L1.5 7.6l5.9-.7z"/></svg>`,
  pin: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 18s6-5.1 6-9.7A6 6 0 004 8.3C4 12.9 10 18 10 18z"/><circle cx="10" cy="8.3" r="2"/></svg>`,
  arrow: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  chevron: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3l5 5-5 5"/></svg>`,
  heart: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 17.2S3 12.6 3 7.9a3.9 3.9 0 017-2.4 3.9 3.9 0 017 2.4c0 4.7-7 9.3-7 9.3z"/></svg>`,
  heartFilled: `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 17.2S3 12.6 3 7.9a3.9 3.9 0 017-2.4 3.9 3.9 0 017 2.4c0 4.7-7 9.3-7 9.3z"/></svg>`,
};

/* Prestadores salvos pelo cliente nesta sessão */
const savedProviders = new Set();

const state = {
  activeCategory: 'Todos',
  tags: [],
  sort: 'proximidade',
  radiusKm: 0,
  finderTerm: '',
  userCoords: null,
};

function providerCardHTML(p, index) {
  const isSaved = savedProviders.has(p.id);
  const ratingLabel = `${p.rating.toFixed(1)} de 5, ${AffinisCore.formatReviewCount(p.reviews)}`;
  return `
    <article class="provider-card" data-category="${p.category}" data-provider-id="${p.id}" style="animation-delay:${index * 70}ms">
      <div class="card-top">
        <span class="category-tag">${p.category.toUpperCase()}</span>
        <span class="dot-sep">&bull;</span>
        <span class="rating" aria-label="${ratingLabel}">${icons.star} ${p.rating.toFixed(1)} <span>(${p.reviews})</span></span>
        <span class="distance-badge">${icons.arrow} ${AffinisCore.formatDistance(p.distanceKm)}</span>
        <button type="button" class="save-btn ${isSaved ? 'is-saved' : ''}" data-save="${p.id}"
          aria-label="${isSaved ? 'Remover dos salvos' : 'Salvar prestador'}" aria-pressed="${isSaved}">
          ${isSaved ? icons.heartFilled : icons.heart}
        </button>
      </div>
      <div class="card-body">
        <div class="card-text">
          <h3 class="service-title">${p.title}</h3>
          <p class="provider-name">Por ${p.provider}</p>
          <p class="service-desc">${p.description}</p>
          <a href="#" class="read-more">Ver perfil completo ${icons.chevron}</a>
        </div>
        <div class="avatar-frame">
          <div class="avatar-placeholder" title="Foto de ${p.provider}">
            ${icons.user}
          </div>
        </div>
      </div>
      <div class="card-footer">
        <span class="price">R$ ${AffinisCore.formatPrice(p.price)} <span class="unit">/ hora</span></span>
        <span class="status ${p.available ? 'available' : ''}">${p.available ? 'Disponível hoje' : 'Indisponível'}</span>
      </div>
    </article>
  `;
}

function skeletonHTML(count) {
  return Array.from({ length: count }, () => `<div class="skeleton-card"></div>`).join('');
}

function renderProviders(list) {
  const container = document.getElementById('providerList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<div class="empty-state">Nenhum prestador encontrado com esses filtros. Tente remover alguma tag ou ampliar o raio de busca.</div>`;
    return;
  }

  container.innerHTML = list.map(providerCardHTML).join('');
  initSaveButtons();
}

function initSaveButtons() {
  document.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.save;
      if (savedProviders.has(id)) {
        savedProviders.delete(id);
      } else {
        savedProviders.add(id);
      }
      const saved = savedProviders.has(id);
      btn.classList.toggle('is-saved', saved);
      btn.setAttribute('aria-pressed', saved);
      btn.setAttribute('aria-label', saved ? 'Remover dos salvos' : 'Salvar prestador');
      btn.innerHTML = saved ? icons.heartFilled : icons.heart;
    });
  });
}

async function applyFilters() {
  const container = document.getElementById('providerList');
  if (!container) return;

  container.innerHTML = skeletonHTML(AffinisCore.MOCK_PROVIDERS.length);

  const list = await AffinisApi.fetchProviders(
    {
      category: state.activeCategory,
      radiusKm: state.radiusKm,
      tags: state.tags,
      term: state.finderTerm,
      sort: state.sort,
    },
    state.userCoords
  );

  renderProviders(list);
}

function initQuickFilters() {
  const pills = document.querySelectorAll('.filter-pill[data-category]');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      state.activeCategory = pill.dataset.category;
      applyFilters();
    });
  });
}

function initTagSearch() {
  const input = document.getElementById('searchInput');
  const tagsRow = document.getElementById('tagsRow');
  if (!input || !tagsRow) return;

  function renderTags() {
    tagsRow.innerHTML = state.tags
      .map(
        (tag, i) => `
        <span class="tag-chip" data-index="${i}">
          ${tag}
          <button type="button" aria-label="Remover filtro ${tag}">&times;</button>
        </span>`
      )
      .join('');

    tagsRow.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const i = Number(e.currentTarget.parentElement.dataset.index);
        state.tags.splice(i, 1);
        renderTags();
        applyFilters();
      });
    });
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      state.tags.push(input.value.trim());
      input.value = '';
      renderTags();
      applyFilters();
    }
  });
}

function initFinder() {
  const input = document.getElementById('finderInput');
  const radius = document.getElementById('finderRadius');
  const submit = document.getElementById('finderSubmit');
  if (!input || !radius || !submit) return;

  function run() {
    state.radiusKm = Number(radius.value);
    state.finderTerm = input.value.trim();
    applyFilters();
    document.getElementById('providerList')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  submit.addEventListener('click', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  });
}

function initSort() {
  const select = document.getElementById('sortSelect');
  if (!select) return;
  select.addEventListener('change', () => {
    state.sort = select.value;
    applyFilters();
  });
}

function initSidebarToggle() {
  const shell = document.getElementById('appShell');
  const collapseBtn = document.getElementById('collapseToggle');
  const mobileBtn = document.getElementById('mobileNavToggle');
  const scrim = document.getElementById('scrim');

  collapseBtn?.addEventListener('click', () => {
    shell.classList.toggle('is-collapsed');
  });

  mobileBtn?.addEventListener('click', () => {
    shell.classList.toggle('is-nav-open');
  });

  scrim?.addEventListener('click', () => {
    shell.classList.remove('is-nav-open');
  });
}

function initAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const formEntrar = document.getElementById('formEntrar');
  const formCadastrar = document.getElementById('formCadastrar');
  const sub = document.getElementById('authSub');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const isCadastro = tab.dataset.tab === 'cadastrar';
      formEntrar.style.display = isCadastro ? 'none' : 'grid';
      formCadastrar.style.display = isCadastro ? 'grid' : 'none';
      sub.textContent = isCadastro
        ? 'Crie sua conta gratuita e comece a receber orçamentos perto de você.'
        : 'Acesse para salvar prestadores favoritos, acompanhar chamados em andamento e conversar diretamente pelo chat.';
    });
  });
}

function messageItemHTML(m) {
  return `
    <div class="message-item" data-message-id="${m.id}" data-provider-id="${m.providerId}">
      <div class="avatar-frame" style="width:44px;height:44px;">
        <div class="avatar-placeholder" title="Foto de ${m.provider}">
          ${icons.user}
        </div>
      </div>
      <div class="history-main">
        <div class="history-title">${m.provider}</div>
        <div class="history-meta">${m.preview}</div>
      </div>
      <span class="history-status">${m.when}</span>
    </div>
  `;
}

async function initMessagesPage() {
  const container = document.getElementById('messageList');
  if (!container) return;

  const messages = await AffinisApi.fetchMessages();
  container.innerHTML = messages.length
    ? messages.map(messageItemHTML).join('')
    : `<div class="empty-state">Nenhuma conversa ainda. Elas aparecem aqui assim que um prestador aceitar seu chamado.</div>`;
}

async function initMessageBadge() {
  const badges = document.querySelectorAll('.nav-badge');
  if (!badges.length) return;

  const count = await AffinisApi.fetchUnreadMessageCount();
  badges.forEach((badge) => {
    badge.textContent = String(count);
    badge.style.display = count > 0 ? '' : 'none';
  });
}

async function initProviderList() {
  if (!document.getElementById('providerList')) return;

  state.userCoords = await AffinisApi.getUserCoordinates();
  await applyFilters();
}

document.addEventListener('DOMContentLoaded', () => {
  initProviderList();
  initQuickFilters();
  initTagSearch();
  initFinder();
  initSort();
  initSidebarToggle();
  initAuthTabs();
  initMessagesPage();
  initMessageBadge();
});
