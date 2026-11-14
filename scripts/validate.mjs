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
assert.match(css, /\.library-panel/, "O editor pessoal deve ter estilos.");
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
  "save-custom-answer", "cancel-custom-answer", "add-answer-button", "copy-result-button",
  "final-percent", "depth-max-label", "home-depth-max", "mode-pill",
  "results-mode-label", "timer-total", "custom-question-form", "editor-category",
  "editor-title", "editor-subtitle", "editor-answers", "editor-question-id",
  "editor-save-button", "editor-cancel-button", "custom-question-list",
  "custom-question-count", "export-data-button", "import-data-button",
  "import-data-file", "editor-feedback"
]) {
  assert.ok(uniqueIds.has(id), "Falta o elemento de interface: " + id);
}

const builtInQuestions = [...js.matchAll(/makeQuestion\("/g)].length;
assert.ok(builtInQuestions >= 26, "O banco deve ter pelo menos 26 categorias próprias.");
assert.match(js, /function startDailyGame\(/, "O desafio diário deve existir.");
assert.match(js, /function seededShuffle\(/, "O sorteio diário tem de ser determinístico.");
assert.match(js, /function saveCustomAnswer\(/, "O banco pessoal de respostas deve estar ativo.");
assert.match(js, /function loadCustomQuestions\(/, "As perguntas pessoais têm de ser carregadas.");
assert.match(js, /function saveQuestionFromEditor\(/, "O editor tem de guardar perguntas.");
assert.match(js, /function updateCareerStats\(/, "As estatísticas pessoais devem estar ativas.");
assert.match(js, /function saveDailyResult\(/, "O melhor resultado diário deve ser guardado.");
assert.match(js, /PREVIEW_SECONDS = 3/, "A pré-visualização da pergunta deve durar 3 segundos.");
assert.match(js, /const POINTS = \[5, 15, 30, 55, 80, 100\]/, "A escala de raridade deve estar presente.");
assert.match(js, /async function copyResult\(/, "A partilha do resultado deve funcionar de forma assíncrona.");
assert.match(js, /function createBackup\(/, "O formato da cópia de segurança deve existir.");
assert.match(js, /function exportBackup\(/, "A exportação de cópias deve existir.");
assert.match(js, /async function importBackup\(/, "A importação de cópias deve ser assíncrona.");
assert.match(js, /Importar esta cópia substitui/, "A importação deve pedir confirmação.");
assert.match(js, /questionPool = BUILTIN_QUESTIONS\.map\(cloneQuestion\)/, "O treino deve usar uma cópia independente das perguntas diárias.");
assert.match(js, /function saveCustomAnswer\(\)\s*\{\s*if \(locked \|\| currentMode === "daily"\)/, "As respostas pessoais não podem alterar a pontuação do desafio diário.");

function extractFunction(name) {
  const pattern = new RegExp("function\\s+" + name + "\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n  \\}");
  const match = js.match(pattern);
  assert.ok(match, "Não foi possível encontrar a função " + name);
  return match[0];
}

const POINTS = [5, 15, 30, 55, 80, 100];
const normaliseSource = extractFunction("normalise");
const normalise = new Function("return (" + normaliseSource.trim() + ")")();
assert.equal(normalise("O Leão!"), "leao", "A normalização deve ignorar artigos, acentos e pontuação.");
assert.notEqual(normalise("C"), normalise("C++"), "C e C++ têm de ser respostas diferentes.");
assert.notEqual(normalise("C"), normalise("C#"), "C e C# têm de ser respostas diferentes.");

const parserSource = extractFunction("parseAnswerLines");
const parseAnswerLines = new Function("normalise", "POINTS", "return (" + parserSource.trim() + ")")(normalise, POINTS);
const validAnswers = parseAnswerLines("C | 5\nC++ | 100\nO Leão | 55 | lion, leo");
assert.equal(validAnswers.errors.length, 0, "O editor deve aceitar respostas válidas.");
assert.equal(validAnswers.answers.length, 3, "O editor deve conservar todas as respostas válidas.");
assert.equal(validAnswers.answers[0].name, "C", "O editor deve permitir respostas de um carácter.");

const duplicateAlias = parseAnswerLines("Creeper | 5 | creeper\nWarden | 80");
assert.ok(duplicateAlias.errors.length > 0, "Aliases duplicados na mesma resposta devem ser rejeitados.");
const duplicateAnswer = parseAnswerLines("Creeper | 5\ncreeper | 80");
assert.ok(duplicateAnswer.errors.length > 0, "Respostas duplicadas devem ser rejeitadas.");
const invalidTier = parseAnswerLines("Creeper | 7\nWarden | 80");
assert.ok(invalidTier.errors.length > 0, "Níveis de raridade fora da escala devem ser rejeitados.");

const sanitizerSource = extractFunction("sanitizeCustomQuestion");
const sanitizeCustomQuestion = new Function("normalise", "POINTS", "return (" + sanitizerSource.trim() + ")")(normalise, POINTS);
const cleanQuestion = sanitizeCustomQuestion({
  id: "custom-minecraft-test",
  category: "Minecraft",
  title: "Diz o nome de uma criatura.",
  subtitle: "",
  answers: [
    { name: "C", points: 5, aliases: ["C"] },
    { name: "Warden", points: 100, aliases: ["Warden"] }
  ]
});
assert.ok(cleanQuestion, "O importador deve aceitar perguntas pessoais válidas.");
assert.equal(sanitizeCustomQuestion({ id: "broken", category: "X", title: "Bad", answers: [] }), null, "O importador deve rejeitar perguntas inválidas.");

const hashSeed = new Function("return (" + extractFunction("hashSeed").trim() + ")")();
const shuffleSource = extractFunction("seededShuffle");
const seededShuffle = new Function("hashSeed", "return (" + shuffleSource.trim() + ")")(hashSeed);
const sampleQuestions = Array.from({ length: builtInQuestions }, (_, index) => "question-" + index);
const dailyA = seededShuffle(sampleQuestions, "grillon-daily-v1-2026-11-14");
const dailyB = seededShuffle(sampleQuestions, "grillon-daily-v1-2026-11-14");
const nextDay = seededShuffle(sampleQuestions, "grillon-daily-v1-2026-11-15");
assert.deepEqual(dailyA, dailyB, "O desafio tem de ser igual para a mesma data.");
assert.notDeepEqual(dailyA, nextDay, "O desafio tem de mudar entre datas.");
assert.equal(new Set(dailyA.slice(0, 7)).size, 7, "As sete perguntas diárias não podem repetir-se.");

console.log("Grillon: validação concluída.");
console.log("- Estrutura, sintaxe e referências HTML/JavaScript verificadas.");
console.log("- Editor de perguntas e validação do banco pessoal testados.");
console.log("- Exportação/importação de cópias e isolamento do desafio diário verificados.");
console.log("- Sorteio diário, normalização e níveis de raridade testados.");
