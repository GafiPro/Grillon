import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../game.js", import.meta.url), "utf8");

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
  "question-total-label", "review-count"
]) {
  assert.ok(uniqueIds.has(id), "Falta o elemento de interface: " + id);
}

assert.match(js, /function loadSettings\(\)/, "As preferências devem ser carregadas.");
assert.match(js, /function saveSettings\(\)/, "As preferências devem ser guardadas.");
assert.match(js, /function findClosestAnswer\(/, "As sugestões de escrita devem estar disponíveis.");
assert.match(js, /const percent = maxRoundScore/, "O recorde deve ser normalizado pela pontuação máxima.");
assert.match(js, /const POINTS = \[5, 15, 30, 55, 80, 100\]/, "A escala de raridade deve estar presente.");

console.log("Grillon: validação concluída.");
console.log("- HTML, CSS e JavaScript ligados.");
console.log("- Sem IDs duplicados ou seletores inexistentes.");
console.log("- Opções, persistência, raridade e APIs verificadas.");
