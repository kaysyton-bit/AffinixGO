(function (root) {
  'use strict';

  const { MOCK_PROVIDERS, MOCK_MESSAGES, filterAndSortProviders, withDistanceFromUser, unreadCount } =
    root.AffinisCore;

  const USE_MOCK_DATA = true;
  const MOCK_LATENCY_MS = 380;

  function delay(value, ms) {
    return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
  }

  function getUserCoordinates() {
    return new Promise((resolve) => {
      if (typeof navigator.geolocation?.getCurrentPosition !== 'function') {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve(null),
        { timeout: 4000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  // filters: { category, radiusKm, tags, term, sort }
  async function fetchProviders(filters, userCoords) {
    if (USE_MOCK_DATA) {
      const base = withDistanceFromUser(MOCK_PROVIDERS, userCoords);
      return delay(filterAndSortProviders(base, filters), MOCK_LATENCY_MS);
    }

    const query = new URLSearchParams({
      categoria: filters.category && filters.category !== 'Todos' ? filters.category : '',
      raio: filters.radiusKm || '',
      busca: filters.term || '',
      ordenar: filters.sort || 'proximidade',
      lat: userCoords ? userCoords.lat : '',
      lng: userCoords ? userCoords.lng : '',
    });
    (filters.tags || []).forEach((tag) => query.append('tag', tag));

    const response = await fetch(`/api/prestadores?${query}`);
    if (!response.ok) throw new Error('Falha ao buscar prestadores');
    return response.json();
  }

  async function fetchMessages() {
    if (USE_MOCK_DATA) return delay(MOCK_MESSAGES, 0);

    const response = await fetch('/api/mensagens');
    if (!response.ok) throw new Error('Falha ao buscar mensagens');
    return response.json();
  }

  async function fetchUnreadMessageCount() {
    if (USE_MOCK_DATA) return delay(unreadCount(MOCK_MESSAGES), 0);

    const response = await fetch('/api/mensagens/nao-lidas');
    if (!response.ok) throw new Error('Falha ao buscar contagem de mensagens');
    const data = await response.json();
    return data.count;
  }

  root.AffinisApi = {
    USE_MOCK_DATA,
    getUserCoordinates,
    fetchProviders,
    fetchMessages,
    fetchUnreadMessageCount,
  };
})(window);
