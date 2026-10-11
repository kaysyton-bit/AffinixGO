(function (root) {
  'use strict';

  const MOCK_PROVIDERS = [
    {
      id: 'p1',
      category: 'Encanador',
      title: 'Instalações & Desentupimentos Rápidos',
      provider: 'Carlos Silva',
      description:
        'Vazamento escondido, cano estourado, ralo entupido — chega com o equipamento de detecção na mochila e resolve na primeira visita, quase sempre sem precisar quebrar parede.',
      rating: 4.9,
      reviews: 128,
      distanceKm: 0.8,
      lat: -19.9227,
      lng: -43.9385,
      price: 120,
      available: true,
    },
    {
      id: 'p2',
      category: 'Eletricista',
      title: 'Manutenção Elétrica e Automação Residencial',
      provider: 'Mariana Souza',
      description:
        'Formada em engenharia elétrica, hoje foca em quadros de distribuição e carregadores veiculares. Entrega laudo por escrito ao final de todo serviço.',
      rating: 5.0,
      reviews: 94,
      distanceKm: 1.5,
      lat: -19.9145,
      lng: -43.9295,
      price: 150,
      available: true,
    },
    {
      id: 'p3',
      category: 'TI & Redes',
      title: 'Configuração de Wi-Fi, Redes e Home Office',
      provider: 'Fernando Lima',
      description: 'Cabeamento estruturado e Wi-Fi que chega em todo cômodo, sem zona morta.',
      rating: 4.8,
      reviews: 210,
      distanceKm: 2.3,
      lat: -19.9333,
      lng: -43.9506,
      price: 180,
      available: true,
    },
    {
      id: 'p4',
      category: 'Pintura',
      title: 'Pintura Decorativa e Acabamentos Finos',
      provider: 'Beatriz Oliveira',
      description:
        'Trabalha sozinha ou com uma ajudante, dependendo do tamanho do cômodo. Referência forte em cimento queimado e textura — leva o portfólio físico na primeira visita, se preferir.',
      rating: 4.9,
      reviews: 82,
      distanceKm: 3.1,
      lat: -19.9020,
      lng: -43.9608,
      price: 110,
      available: true,
    },
    {
      id: 'p5',
      category: 'Climatização',
      title: 'Instalação e Higienização de Ar-Condicionado',
      provider: 'Roberto Santos',
      description:
        'Atende todas as marcas de split e inverter. A higienização inclui abertura completa da evaporadora, não só um passar de pano — 6 meses de garantia no serviço.',
      rating: 4.7,
      reviews: 156,
      distanceKm: 4.0,
      lat: -19.9490,
      lng: -43.9210,
      price: 135,
      available: false,
    },
  ];

  const MOCK_MESSAGES = [
    {
      id: 'm1',
      providerId: 'p2',
      provider: 'Mariana Souza',
      preview: 'Consigo ir amanhã às 14h, te aviso quando sair.',
      when: 'Agora',
      unread: true,
    },
    {
      id: 'm2',
      providerId: 'p3',
      provider: 'Fernando Lima',
      preview: 'Pode mandar uma foto do roteador?',
      when: '1h',
      unread: true,
    },
    {
      id: 'm3',
      providerId: 'p1',
      provider: 'Carlos Silva',
      preview: 'Serviço finalizado, qualquer coisa me chama!',
      when: 'Ontem',
      unread: true,
    },
  ];

  function formatPrice(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  }

  function formatDistance(km) {
    return `${km.toLocaleString('pt-BR')} km`;
  }

  function formatReviewCount(count) {
    return count === 1 ? '1 avaliação' : `${count} avaliações`;
  }

  function unreadCount(messages) {
    return messages.filter((m) => m.unread).length;
  }

  // Distância em km entre duas coordenadas (fórmula de Haversine).
  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Recalcula distanceKm de cada prestador a partir da posição real do usuário.
  function withDistanceFromUser(providers, userCoords) {
    if (!userCoords) return providers;
    return providers.map((p) => ({
      ...p,
      distanceKm: Math.round(haversineKm(userCoords.lat, userCoords.lng, p.lat, p.lng) * 10) / 10,
    }));
  }

  function filterAndSortProviders(list, filters) {
    const f = filters || {};
    let result = list.slice();

    if (f.category && f.category !== 'Todos') {
      result = result.filter((p) => p.category === f.category);
    }

    if (f.radiusKm > 0) {
      result = result.filter((p) => p.distanceKm <= f.radiusKm);
    }

    const terms = (f.tags || []).slice();
    if (f.term) terms.push(f.term);

    terms.forEach((term) => {
      const needle = term.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase().includes(needle) ||
          p.title.toLowerCase().includes(needle) ||
          p.provider.toLowerCase().includes(needle)
      );
    });

    const sorters = {
      avaliacao: (a, b) => b.rating - a.rating,
      preco: (a, b) => a.price - b.price,
      proximidade: (a, b) => a.distanceKm - b.distanceKm,
    };
    result.sort(sorters[f.sort] || sorters.proximidade);

    return result;
  }

  const AffinisCore = {
    MOCK_PROVIDERS,
    MOCK_MESSAGES,
    formatPrice,
    formatDistance,
    formatReviewCount,
    unreadCount,
    haversineKm,
    withDistanceFromUser,
    filterAndSortProviders,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AffinisCore;
  } else {
    root.AffinisCore = AffinisCore;
  }
})(typeof window !== 'undefined' ? window : globalThis);
