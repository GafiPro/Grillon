import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const html = read("index.html");
const css = read("styles.css");
const js = read("game.js");

assert.match(html, /<html lang="pt-PT">/, "A página deve declarar português europeu.");
assert.match(html, /href="\.\/styles\.css"/, "A folha de estilos deve estar ligada.");
assert.match(html, /src="\.\/game\.js"/, "O motor do jogo deve estar ligado.");
assert.match(css, /:root\s*\{/, "A folha de estilos deve conter as variáveis base.");
assert.match(js, /https:\/\/restcountries\.com\/v3\.1\/all/, "A integração REST Countries deve existir.");
assert.match(js, /https:\/\/pokeapi\.co\/api\/v2\/pokemon-species/, "A integração PokéAPI deve existir.");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const uniqueIds = new Set(ids);
assert.equal(uniqueIds.size, ids.length, "O HTML não pode ter IDs duplicados.");

const references = [...js.matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]);
const missing = [...new Set(references.filter((id) => !uniqueIds.has(id)))];
assert.deepEqual(missing, [], "Todos os seletores JavaScript devem existir no HTML.");

for (const id of [
  "round-length", "round-time", "toggle-categories", "select-all-categories",
  "category-options", "setup-hint", "final-max-score", "question-total",
  "question-total-label", "review-count", "daily-start-button", "daily-status",
  "stat-games", "stat-average", "stat-best", "stat-rare", "countdown-overlay",
  "countdown-number", "custom-answer-panel", "custom-answer-points",
  "save-custom-answer", "add-answer-button", "copy-result-button",
  "final-percent", "depth-max-label", "home-depth-max", "mode-pill",
  "results-mode-label", "timer-total"
]) {
  assert.ok(uniqueIds.has(id), "Falta o elemento de interface: " + id);
}

const builtInQuestions = [...js.matchAll(/makeQuestion\("/g)].length;
assert.ok(builtInQuestions >= 26, "O banco deve ter pelo menos 26 categorias próprias.");
assert.match(js, /function startDailyGame\(/, "O desafio diário deve existir.");
assert.match(js, /function seededShuffle\(/, "O sorteio diário tem de ser determinístico.");
assert.match(js, /function saveCustomAnswer\(/, "O banco pessoal de respostas deve estar ativo.");
assert.match(js, /function updateCareerStats\(/, "As estatísticas pessoais devem estar ativas.");
assert.match(js, /function saveDailyResult\(/, "O melhor resultado diário deve ser guardado.");
assert.match(js, /PREVIEW_SECONDS = 3/, "A pré-visualização da pergunta deve durar 3 segundos.");
assert.match(js, /const POINTS = \[5, 15, 30, 55, 80, 100\]/, "A escala de raridade deve estar presente.");
assert.match(js, /async function copyResult\(/, "A partilha do resultado deve funcionar de forma assíncrona.");
assert.match(js, /C\+\+/, "A categoria de programação deve incluir C++.");

console.log("Grillon: validação concluída.");
console.log("- Estrutura e sintaxe ligadas.");
console.log("- Sem IDs duplicados ou seletores inexistentes.");
console.log("- Desafio diário, categorias, respostas pessoais e estatísticas presentes.");
console.log("- APIs e escala de raridade verificadas.");
