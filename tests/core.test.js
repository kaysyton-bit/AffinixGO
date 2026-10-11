const assert = require('assert');
const {
  MOCK_PROVIDERS,
  MOCK_MESSAGES,
  formatPrice,
  formatDistance,
  formatReviewCount,
  unreadCount,
  haversineKm,
  withDistanceFromUser,
  filterAndSortProviders,
} = require('../js/core.js');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('formatPrice formata em padrão pt-BR', () => {
  assert.strictEqual(formatPrice(120), '120');
  assert.strictEqual(formatPrice(1500), '1.500');
});

test('formatDistance adiciona a unidade km', () => {
  assert.strictEqual(formatDistance(0.8), '0,8 km');
});

test('formatReviewCount usa singular só para 1 avaliação', () => {
  assert.strictEqual(formatReviewCount(1), '1 avaliação');
  assert.strictEqual(formatReviewCount(0), '0 avaliações');
  assert.strictEqual(formatReviewCount(128), '128 avaliações');
});

test('unreadCount conta só mensagens não lidas', () => {
  const messages = [{ unread: true }, { unread: false }, { unread: true }];
  assert.strictEqual(unreadCount(messages), 2);
  assert.strictEqual(unreadCount(MOCK_MESSAGES), MOCK_MESSAGES.filter((m) => m.unread).length);
});

test('haversineKm retorna 0 para o mesmo ponto', () => {
  assert.strictEqual(haversineKm(-19.92, -43.94, -19.92, -43.94), 0);
});

test('haversineKm cresce com a distância real entre coordenadas', () => {
  // Belo Horizonte -> Rio de Janeiro, ~340km em linha reta
  const km = haversineKm(-19.9227, -43.9385, -22.9068, -43.1729);
  assert.ok(km > 300 && km < 380, `esperava ~340km, recebeu ${km}`);
});

test('withDistanceFromUser recalcula distanceKm a partir da posição do usuário', () => {
  const updated = withDistanceFromUser(MOCK_PROVIDERS, { lat: -19.9227, lng: -43.9385 });
  const p1 = updated.find((p) => p.id === 'p1');
  assert.strictEqual(p1.distanceKm, 0);
});

test('withDistanceFromUser não altera a lista sem coordenadas do usuário', () => {
  const result = withDistanceFromUser(MOCK_PROVIDERS, null);
  assert.deepStrictEqual(result, MOCK_PROVIDERS);
});

test('filterAndSortProviders filtra por categoria', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, { category: 'Eletricista' });
  assert.ok(result.every((p) => p.category === 'Eletricista'));
  assert.strictEqual(result.length, 1);
});

test('filterAndSortProviders filtra por raio', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, { radiusKm: 2 });
  assert.ok(result.every((p) => p.distanceKm <= 2));
});

test('filterAndSortProviders filtra por termo de busca (tags e finder)', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, { term: 'wi-fi' });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'p3');
});

test('filterAndSortProviders combina múltiplas tags (E lógico)', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, { tags: ['eletricista', 'mariana'] });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'p2');
});

test('filterAndSortProviders ordena por avaliação', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, { sort: 'avaliacao' });
  for (let i = 1; i < result.length; i++) {
    assert.ok(result[i - 1].rating >= result[i].rating);
  }
});

test('filterAndSortProviders ordena por preço', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, { sort: 'preco' });
  for (let i = 1; i < result.length; i++) {
    assert.ok(result[i - 1].price <= result[i].price);
  }
});

test('filterAndSortProviders ordena por proximidade por padrão', () => {
  const result = filterAndSortProviders(MOCK_PROVIDERS, {});
  for (let i = 1; i < result.length; i++) {
    assert.ok(result[i - 1].distanceKm <= result[i].distanceKm);
  }
});

test('filterAndSortProviders não modifica a lista original', () => {
  const before = JSON.stringify(MOCK_PROVIDERS);
  filterAndSortProviders(MOCK_PROVIDERS, { category: 'Pintura', sort: 'preco' });
  assert.strictEqual(JSON.stringify(MOCK_PROVIDERS), before);
});

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    failed++;
    console.error(`FAIL - ${name}`);
    console.error(`  ${err.message}`);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} testes passaram`);
process.exit(failed ? 1 : 0);
