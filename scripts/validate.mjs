import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const html = read("index.html");
const css = read("styles.css");
const js = read("game.js");
const launcher = read("start-grillon.bat");

assert.match(html, /<html lang="pt-PT">/, "A página deve declarar português europeu.");
assert.match(html, /href="\.\/styles\.css"/, "A folha de estilos deve estar ligada.");
assert.match(html, /src="\.\/game\.js"/, "O motor do jogo deve estar ligado.");
assert.match(css, /:root\s*\{/, "A folha de estilos deve conter as variáveis base.");
assert.match(css, /\.library-panel/, "O editor pessoal deve ter estilos.");
assert.ok(launcher.includes("--bind 127.0.0.1"), "O lançador do Windows deve limitar o servidor ao próprio computador.");
assert.ok(launcher.includes("http://127.0.0.1:%PORT%/"), "O lançador deve abrir o endereço local.");
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
  "import-data-file", "editor-feedback", "theme-select",
  "stat-daily-streak", "daily-streak-note", "stat-daily-games",
  "achievement-progress", "achievement-list", "game-history"
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
assert.match(js, /const GAME_HISTORY_KEY = "grillon.history.v1"/, "O histórico de rondas deve ter armazenamento próprio.");
assert.match(js, /const DAILY_DATES_KEY = "grillon.daily.dates.v1"/, "As datas concluídas devem ser guardadas independentemente do histórico.");
assert.match(js, /careerStats\.legendaryAnswers \+= legendaryAnswers/, "As conquistas lendárias têm de ficar registadas.");
assert.match(js, /careerStats\.customCreated \+= 1/, "A criação de perguntas tem de desbloquear a conquista.");
assert.match(js, /function renderCareerExtras\(/, "A área de conquistas e histórico deve ser gerada.");
assert.match(js, /function getDailyStreakSummary\(/, "As sequências diárias devem ser calculadas.");
assert.match(js, /function applyTheme\(/, "Os temas visuais devem poder ser aplicados.");
assert.match(js, /gameHistory,/, "As cópias de segurança devem incluir o histórico.");
assert.match(css, /data-theme="abyss"/, "O tema Abismo deve estar definido.");
assert.match(css, /data-theme="coral"/, "O tema Coral deve estar definido.");
assert.match(html, /id="theme-select"/, "O seletor de tema deve existir.");
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

const cloneQuestion = new Function("return (" + extractFunction("cloneQuestion").trim() + ")")();
const originalQuestion = { id: "sample", category: "Teste", title: "Teste", subtitle: "", answers: [{ name: "C", points: 5, aliases: ["C"] }] };
const clonedQuestion = cloneQuestion(originalQuestion);
clonedQuestion.answers[0].aliases.push("C language");
assert.deepEqual(originalQuestion.answers[0].aliases, ["C"], "O banco do desafio diário não pode ser alterado pelo banco de treino.");

const applyCustomSource = extractFunction("applyCustomAnswers");
const applyCustomAnswers = new Function("customAnswerBank", "normalise", "POINTS", "return (" + applyCustomSource.trim() + ")")(
  { sample: [{ name: "Lobo", points: 80, aliases: ["Lobo", "wolf"] }] }, normalise, POINTS
);
const questionWithPersonalAnswer = { id: "sample", answers: [{ name: "Cão", points: 5, aliases: ["Cão", "dog"] }] };
applyCustomAnswers(questionWithPersonalAnswer);
assert.equal(questionWithPersonalAnswer.answers.length, 2, "Uma resposta pessoal sem conflitos deve ser carregada.");

const conflictingCustomAnswers = new Function("customAnswerBank", "normalise", "POINTS", "return (" + applyCustomSource.trim() + ")")(
  { sample: [{ name: "Lobo", points: 80, aliases: ["Lobo", "dog"] }] }, normalise, POINTS
);
const questionWithConflict = { id: "sample", answers: [{ name: "Cão", points: 5, aliases: ["Cão", "dog"] }] };
conflictingCustomAnswers(questionWithConflict);
assert.equal(questionWithConflict.answers.length, 1, "Aliases que colidem com respostas existentes devem ser ignorados.");

const sanitizeHistory = new Function("return (" + extractFunction("sanitizeGameHistory").trim() + ")")();
const cleanHistory = sanitizeHistory([
  { date: "2026-11-14", mode: "daily", score: 560, maxScore: 700, questionCount: 7, completedAt: "2026-11-14T12:00:00.000Z" },
  { date: "not-a-date", mode: "daily", score: 100, maxScore: 700, questionCount: 7 },
  { date: "2026-11-14", mode: "other", score: 100, maxScore: 700, questionCount: 7 }
]);
assert.equal(cleanHistory.length, 1, "O histórico deve rejeitar registos com datas ou modos inválidos.");
assert.equal(cleanHistory[0].percent, 80, "A percentagem do histórico deve ser calculada a partir da pontuação.");
const dateKeyOffset = new Function("return (" + extractFunction("dateKeyOffset").trim() + ")")();
assert.equal(dateKeyOffset("2026-03-01", -1), "2026-02-28", "A sequência diária deve atravessar corretamente mudanças de mês.");
const sanitizeDailyDates = new Function("return (" + extractFunction("sanitizeDailyDates").trim() + ")")();
const cleanDailyDates = sanitizeDailyDates(["2026-11-13", "not-a-date", "2026-11-12", "2026-11-13"]);
assert.deepEqual(cleanDailyDates, ["2026-11-12", "2026-11-13"], "O calendário diário deve remover datas inválidas e duplicadas.");
const getDailyStreakSummary = new Function("sanitizeDailyDates", "dateKeyOffset", "return (" + extractFunction("getDailyStreakSummary").trim() + ")")(sanitizeDailyDates, dateKeyOffset);
const streakHistory = ["2026-11-12", "2026-11-13", "2026-11-14"];
assert.deepEqual(getDailyStreakSummary(streakHistory, "2026-11-14"), { current: 3, best: 3, completed: 3 });
assert.deepEqual(getDailyStreakSummary(streakHistory, "2026-11-15"), { current: 3, best: 3, completed: 3 });
assert.deepEqual(getDailyStreakSummary(streakHistory, "2026-11-16"), { current: 0, best: 3, completed: 3 });
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
console.log("- Histórico, calendário diário, sequência, conquistas e temas visuais verificados.");
