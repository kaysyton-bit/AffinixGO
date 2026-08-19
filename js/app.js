/**
Quando o backend existir, basta substituir providers por um fetch e manter a
função renderProviders(lista)
 */

const PROVIDERS = [
  {
    id: 'p1',
    category: 'Encanador',
    title: 'Instalações & Desentupimentos Rápidos',
    provider: 'Carlos Silva',
    description:
      'Especialista em detecção de vazamentos e encanamento residencial de alta pressão, com mais de 10 anos de experiência. Equipamento de ponta para diagnóstico rápido e sem quebra desnecessária.',
    rating: 4.9,
    reviews: 128,
    distanceKm: 0.8,
    price: 120,
    available: true,
  },
  {
    id: 'p2',
    category: 'Eletricista',
    title: 'Manutenção Elétrica e Automação Residencial',
    provider: 'Mariana Souza',
    description:
      'Reformas de quadros de distribuição, projetos de iluminação inteligente e instalação de carregadores veiculares. Segurança atestada e conformidade técnica rigorosa com normas vigentes.',
    rating: 5.0,
    reviews: 94,
    distanceKm: 1.5,
    price: 150,
    available: true,
  },
  {
    id: 'p3',
    category: 'TI & Redes',
    title: 'Configuração de Wi-Fi, Redes e Home Office',
    provider: 'Fernando Lima',
    description:
      'Otimização de sinal de rede de alta velocidade, cabeamento estruturado e suporte técnico para servidores domésticos e infraestrutura de trabalho remoto avançado.',
    rating: 4.8,
    reviews: 210,
    distanceKm: 2.3,
    price: 180,
    available: true,
  },
  {
    id: 'p4',
    category: 'Pintura',
    title: 'Pintura Decorativa e Acabamentos Finos',
    provider: 'Beatriz Oliveira',
    description:
      'Especialista em texturas modernas, cimento queimado e aplicação refinada de papel de parede. Trabalho limpo, rápido e com proteção total dos seus móveis.',
    rating: 4.9,
    reviews: 82,
    distanceKm: 3.1,
    price: 110,
    available: true,
  },
  {
    id: 'p5',
    category: 'Climatização',
    title: 'Instalação e Higienização de Ar-Condicionado',
    provider: 'Roberto Santos',
    description:
      'Manutenção preventiva de aparelhos split e sistemas inverter de todas as marcas. Garantia de ar puro e eficiência energética máxima com diagnósticos precisos.',
    rating: 4.7,
    reviews: 156,
    distanceKm: 4.0,
    price: 135,
    available: true,
  },
];

const icons = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1.6-3.6 4.4-5.4 7.5-5.4s5.9 1.8 7.5 5.4"/></svg>`,
  star: `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.8 1.1-5.9L1.5 7.6l5.9-.7z"/></svg>`,
  pin: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 18s6-5.1 6-9.7A6 6 0 004 8.3C4 12.9 10 18 10 18z"/><circle cx="10" cy="8.3" r="2"/></svg>`,
  arrow: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
};

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

function providerCardHTML(p, index) {
  return `
    <article class="provider-card" data-category="${p.category}" style="animation-delay:${index * 70}ms">
      <div class="card-top">
        <span class="category-tag">${p.category.toUpperCase()}</span>
        <span class="dot-sep">&bull;</span>
        <span class="rating">${icons.star} ${p.rating.toFixed(1)} <span>(${p.reviews})</span></span>
        <span class="distance-badge">${icons.arrow} ${p.distanceKm.toLocaleString('pt-BR')} km</span>
      </div>
      <div class="card-body">
        <div class="card-text">
          <h3 class="service-title">${p.title}</h3>
          <p class="provider-name">Por ${p.provider}</p>
          <p class="service-desc">${p.description} <a href="#" class="read-more">Ler mais&hellip;</a></p>
        </div>
        <div class="avatar-frame">
          <!-- Ao adicionar a foto real, troque o bloco abaixo por:
               <img class="avatar-photo" src="/caminho/da/foto.jpg" alt="${p.provider}"> -->
          <div class="avatar-placeholder" title="Foto de ${p.provider}">
            ${icons.user}
          </div>
        </div>
      </div>
      <div class="card-footer">
        <span class="price">R$ ${formatPrice(p.price)} <span class="unit">/ hora</span></span>
        <span class="status ${p.available ? 'available' : ''}">${p.available ? 'Disponível hoje' : 'Indisponível'}</span>
      </div>
    </article>
  `;
}

function renderProviders(list) {
  const container = document.getElementById('providerList');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<div class="empty-state">Nenhum prestador encontrado com esses filtros. Tente remover alguma tag ou ampliar o raio de busca.</div>`;
    return;
  }

  container.innerHTML = list.map(providerCardHTML).join('');
}

/* Estado de filtros */

const state = {
  activeCategory: 'Todos',
  tags: [],
  sort: 'proximidade',
};

function applyFilters() {
  let list = PROVIDERS.slice();

  if (state.activeCategory !== 'Todos') {
    list = list.filter((p) => p.category === state.activeCategory);
  }

  state.tags.forEach((tag) => {
    const t = tag.toLowerCase();
    list = list.filter(
      (p) =>
        p.category.toLowerCase().includes(t) ||
        p.title.toLowerCase().includes(t) ||
        p.provider.toLowerCase().includes(t)
    );
  });

  switch (state.sort) {
    case 'avaliacao':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'preco':
      list.sort((a, b) => a.price - b.price);
      break;
    default:
      list.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  renderProviders(list);
}

/* ---- Filtros rápidos (pills) ---- */

function initQuickFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      state.activeCategory = pill.dataset.category;
      applyFilters();
    });
  });
}

/* ---- Busca com tags ---- */

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

/* ---- Ordenação ---- */

function initSort() {
  const select = document.getElementById('sortSelect');
  if (!select) return;
  select.addEventListener('change', () => {
    state.sort = select.value;
    applyFilters();
  });
}

/* ---- Sidebar: colapsar / abrir no mobile ---- */

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

document.addEventListener('DOMContentLoaded', () => {
  renderProviders(PROVIDERS.slice().sort((a, b) => a.distanceKm - b.distanceKm));
  initQuickFilters();
  initTagSearch();
  initSort();
  initSidebarToggle();
});
