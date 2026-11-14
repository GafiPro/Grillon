import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

class FakeClassList {
  constructor(owner) { this.owner = owner; this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : Boolean(force);
    if (enabled) this.values.add(name);
    else this.values.delete(name);
    return enabled;
  }
}

class FakeElement {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.children = [];
    this.listeners = new Map();
    this.classList = new FakeClassList(this);
    this.className = "";
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.value = "";
    this.type = "";
    this.name = "";
    this.files = [];
    this.style = {};
    this.attributes = {};
    this.dataset = {};
    this.download = "";
    this.href = "";
    this._textContent = "";
    this._innerHTML = "";
  }
  set textContent(value) {
    this._textContent = String(value ?? "");
    this.children = [];
  }
  get textContent() { return this._textContent + this.children.map((child) => child.textContent || "").join(""); }
  set innerHTML(value) {
    this._innerHTML = String(value ?? "");
    this.children = [];
  }
  get innerHTML() { return this._innerHTML; }
  addEventListener(type, callback) {
    const list = this.listeners.get(type) || [];
    list.push(callback);
    this.listeners.set(type, list);
  }
  dispatch(type, extra = {}) {
    const event = {
      type,
      target: this,
      currentTarget: this,
      preventDefault() { this.defaultPrevented = true; },
      ...extra
    };
    const results = [];
    for (const callback of this.listeners.get(type) || []) results.push(callback(event));
    return results.length === 1 ? results[0] : event;
  }
  append(...nodes) {
    this._textContent = "";
    for (const node of nodes) {
      if (node && typeof node === "object") {
        node.parentNode = this;
        this.children.push(node);
      } else if (node !== null && node !== undefined) {
        this._textContent += String(node);
      }
    }
  }
  appendChild(node) { this.append(node); return node; }
  replaceChildren(...nodes) {
    this.children = [];
    this._textContent = "";
    this._innerHTML = "";
    if (nodes.length) this.append(...nodes);
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  remove() {
    if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((node) => node !== this);
  }
  click() {
    if (this.download) downloads.push({ filename: this.download, href: this.href });
    this.dispatch("click");
  }
  focus() {}
  select() {}
  scrollIntoView() {}
  reset() {
    if (this.id === "custom-question-form") {
      for (const id of ["editor-category", "editor-title", "editor-subtitle", "editor-answers"]) {
        elements.get(id).value = "";
      }
    }
  }
}

const downloads = [];
const elements = new Map(ids.map((id) => [id, new FakeElement("div", id)]));
for (const id of ["home-screen", "game-screen", "results-screen"]) elements.get(id).hidden = id !== "home-screen";
elements.get("round-length").value = "7";
elements.get("round-time").value = "25";
elements.get("custom-answer-points").value = "30";
elements.get("import-data-file").files = [];

const body = new FakeElement("body");
const documentElement = new FakeElement("html");
documentElement.dataset = {};
const document = {
  body,
  documentElement,
  getElementById(id) { return elements.get(id) || null; },
  createElement(tag) { return new FakeElement(tag); },
  execCommand() { return true; }
};

const stored = new Map();
const localStorage = {
  getItem(key) { return stored.has(key) ? stored.get(key) : null; },
  setItem(key, value) { stored.set(String(key), String(value)); },
  removeItem(key) { stored.delete(key); }
};

let nextTimerId = 1;
const intervals = new Map();
const timeouts = new Map();
const window = {
  scrollTo() {},
  confirm() { return true; },
  setInterval(callback, delay) {
    const id = nextTimerId++;
    intervals.set(id, { callback, delay });
    return id;
  },
  clearInterval(id) { intervals.delete(id); },
  setTimeout(callback, delay) {
    const id = nextTimerId++;
    timeouts.set(id, { callback, delay });
    return id;
  },
  clearTimeout(id) { timeouts.delete(id); }
};

const clipboard = [];
const navigator = { clipboard: { async writeText(value) { clipboard.push(value); } } };
const urlApi = {
  createObjectURL() { return "blob:grillon-test"; },
  revokeObjectURL() {}
};
const pokemonIdsMatch = game.match(/const POKEMON_IDS = \[([\s\S]*?)\];/);
assert.ok(pokemonIdsMatch, "A lista de espécies Pokémon deve existir.");
const pokemonIds = [...pokemonIdsMatch[1].matchAll(/\d+/g)].map((match) => Number(match[0])).slice(0, 36);

async function fetchStub(url) {
  if (url.startsWith("https://restcountries.com/")) {
    return {
      ok: true,
      async json() {
        return [
          { name: { common: "Portugal", official: "Portuguese Republic" }, population: 10000000, translations: { por: { common: "Portugal", official: "República Portuguesa" } }, cca3: "PRT", altSpellings: ["PT"] },
          { name: { common: "Nauru", official: "Republic of Nauru" }, population: 12000, translations: { por: { common: "Nauru", official: "República de Nauru" } }, cca3: "NRU", altSpellings: ["NR"] }
        ];
      }
    };
  }
  if (url.includes("pokemon-species?")) {
    return {
      ok: true,
      async json() {
        return { results: pokemonIds.map((id) => ({ name: "species-" + id, url: "https://pokeapi.co/api/v2/pokemon-species/" + id + "/" })) };
      }
    };
  }
  const speciesMatch = url.match(/pokemon-species\/(\d+)\/?$/);
  if (speciesMatch) {
    const id = Number(speciesMatch[1]);
    return {
      ok: true,
      async json() {
        return { name: "species-" + id, names: [{ name: "Espécie " + id }], capture_rate: Math.min(255, id + 20) };
      }
    };
  }
  throw new Error("Pedido de API inesperado: " + url);
}

const sandbox = {
  document,
  window,
  localStorage,
  navigator,
  URL: urlApi,
  Blob,
  AbortController,
  fetch: fetchStub,
  Intl,
  Date,
  Math,
  Map,
  Set,
  Array,
  Number,
  String,
  Object,
  JSON,
  RegExp,
  Error,
  console,
  performance: { now: () => 0 }
};
runInNewContext(game, sandbox, { filename: "game.js", timeout: 5000 });

const flush = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  await Promise.resolve();
};
const click = (id) => elements.get(id).dispatch("click");
const change = (id) => elements.get(id).dispatch("change");
const submit = (id) => elements.get(id).dispatch("submit");
const runNextInterval = () => {
  const next = intervals.entries().next().value;
  assert.ok(next, "Era esperado existir um temporizador ativo.");
  next[1].callback();
};
const finishPreview = () => {
  for (let index = 0; index < 3; index += 1) runNextInterval();
};
const answerCurrentQuestion = (value) => {
  elements.get("answer-input").value = value;
  submit("answer-form");
};
const continueCurrentQuestion = () => {
  click("continue-button");
};
const skipCurrentQuestion = () => {
  assert.equal(elements.get("skip-button").hidden, false, "A opção de passar deve aparecer depois da pré-visualização.");
  click("skip-button");
};
const onlyCategory = (wantedId) => {
  const container = elements.get("category-options");
  const idsNow = container.children.map((label) => label.children[0].value);
  assert.ok(idsNow.includes(wantedId), "A categoria escolhida deve estar disponível.");
  for (const id of idsNow) {
    if (id === wantedId) continue;
    const label = elements.get("category-options").children.find((node) => node.children[0].value === id);
    if (label && label.children[0].checked) {
      label.children[0].checked = false;
      label.children[0].dispatch("change");
    }
  }
  const target = elements.get("category-options").children.find((node) => node.children[0].value === wantedId);
  if (!target.children[0].checked) {
    target.children[0].checked = true;
    target.children[0].dispatch("change");
  }
  assert.equal(elements.get("selected-category-count").textContent, "1/" + elements.get("category-options").children.length);
};

// Allow both API integrations to finish before checking the available categories.
await flush();
await flush();
assert.equal(elements.get("api-status").classList.contains("ready"), true, "As duas APIs de teste devem ficar ligadas.");
assert.ok(elements.get("category-options").children.length >= 28, "As categorias próprias, países e Pokémon devem estar disponíveis.");

const themeSelect = elements.get("theme-select");
themeSelect.value = "coral";
change("theme-select");
assert.equal(documentElement.dataset.theme, "coral", "O tema escolhido deve ser aplicado.");
assert.equal(JSON.parse(localStorage.getItem("grillon.settings.v1")).theme, "coral", "O tema deve ser guardado.");

elements.get("editor-category").value = "Categoria de Teste";
elements.get("editor-title").value = "Diz uma resposta de teste.";
elements.get("editor-subtitle").value = "Pergunta criada no teste automático.";
elements.get("editor-answers").value = "Base | 5\nRaro | 100 | resposta-rara";
submit("custom-question-form");
const customQuestions = JSON.parse(localStorage.getItem("grillon.custom.questions.v1"));
assert.equal(customQuestions.length, 1, "O editor deve guardar uma categoria personalizada.");
assert.equal(elements.get("custom-question-count").textContent, "1 pergunta", "A lista deve atualizar o contador.");
assert.match(elements.get("achievement-progress").textContent, /1\/8/, "A conquista de criador deve desbloquear.");

const customId = customQuestions[0].id;
onlyCategory(customId);
elements.get("round-length").value = "5";
elements.get("round-time").value = "15";
change("round-length");
change("round-time");
click("start-button");
assert.equal(elements.get("game-screen").hidden, false, "O treino deve abrir o ecrã de jogo.");
assert.equal(elements.get("question-total").textContent, "01", "Com uma categoria selecionada, a ronda deve ajustar-se a uma pergunta.");
finishPreview();
assert.equal(elements.get("answer-input").disabled, false, "O campo de resposta deve ativar após a pré-visualização.");
answerCurrentQuestion("resposta-rara");
assert.match(elements.get("feedback").textContent, /100 pontos/, "Uma resposta personalizada deve ser aceite com os pontos definidos.");
continueCurrentQuestion();
assert.equal(elements.get("results-screen").hidden, false, "A última resposta deve abrir os resultados.");
assert.equal(elements.get("final-score").textContent, "100", "A pontuação final deve ser correta.");
assert.equal(JSON.parse(localStorage.getItem("grillon.history.v1")).length, 1, "A ronda deve entrar no histórico.");
assert.match(elements.get("achievement-progress").textContent, /5\/8/, "As conquistas de primeira ronda, 80% e criador devem desbloquear.");
click("copy-result-button");
await flush();
assert.match(clipboard[0] || "", /100%/, "A partilha deve copiar o resultado.");

click("export-data-button");
assert.equal(downloads.some((item) => item.filename.includes("grillon-backup-")), true, "A exportação deve iniciar uma transferência.");

click("daily-start-button");
assert.equal(elements.get("mode-pill").hidden, false, "O desafio diário deve assinalar o modo.");
for (let index = 0; index < 7; index += 1) {
  finishPreview();
  skipCurrentQuestion();
  continueCurrentQuestion();
}
assert.equal(elements.get("results-screen").hidden, false, "O desafio diário deve terminar após sete perguntas.");
const dailyDates = JSON.parse(localStorage.getItem("grillon.daily.dates.v1"));
assert.equal(dailyDates.length, 1, "Concluir o desafio diário deve guardar a data.");
assert.equal(elements.get("stat-daily-streak").textContent, "1 dia", "A sequência diária deve começar em um dia.");
assert.equal(elements.get("stat-daily-games").textContent, "1", "O total de desafios deve aumentar.");
assert.ok(JSON.parse(localStorage.getItem("grillon.daily.best.v1")), "O melhor resultado diário deve ser guardado.");

// The Pokémon IDs 1, 4 and 7 must survive selection (single-digit IDs are valid).
onlyCategory("pokemon");
elements.get("round-length").value = "5";
elements.get("round-time").value = "15";
click("start-button");
assert.equal(elements.get("question-title").textContent, "Diz o nome de um Pokémon.", "A categoria Pokémon deve abrir a pergunta correta.");
finishPreview();
answerCurrentQuestion("Espécie 1");
assert.match(elements.get("feedback").textContent, /100 pontos/, "A primeira espécie deve estar presente no banco de respostas.");
continueCurrentQuestion();

click("import-data-button");
const backup = {
  app: "Grillon",
  version: 1,
  data: {
    settings: { roundLength: 7, roundSeconds: 25, categories: null, theme: "abyss" },
    customQuestions: [],
    customAnswers: {},
    careerStats: { games: 0, percentTotal: 0, rareAnswers: 0, legendaryAnswers: 0, customCreated: 0 },
    gameHistory: [],
    dailyDates: ["2026-02-30", "2026-11-14"],
    bestPercent: 0,
    dailyBest: null
  }
};
elements.get("import-data-file").files = [{ size: 500, async text() { return JSON.stringify(backup); } }];
await elements.get("import-data-file").dispatch("change");
await flush();
assert.equal(documentElement.dataset.theme, "abyss", "A importação deve restaurar o tema.");
assert.deepEqual(JSON.parse(localStorage.getItem("grillon.daily.dates.v1")), ["2026-11-14"], "A importação deve rejeitar datas diárias impossíveis.");

console.log("Grillon: teste de execução concluído.");
console.log("- Arranque, carregamento das duas APIs e renderização de categorias.");
console.log("- Preferências e temas, editor de perguntas, seleção de categorias e pontuação.");
console.log("- Finalização de treino, estatísticas, conquistas, histórico e partilha.");
console.log("- Exportação, desafio diário, sequência e importação com datas inválidas.");
