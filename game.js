"use strict";

(function () {
  const POINTS = [5, 15, 30, 55, 80, 100];
  const TIER_NAMES = ["Comum", "Conhecida", "Incomum", "Rara", "Abissal", "Lendária"];
  const DEFAULT_ROUND_LENGTH = 7;
  const DEFAULT_ROUND_SECONDS = 25;
  const BEST_KEY = "grillon.best.percent.v2";
  const LEGACY_BEST_KEY = "grillon.best.v1";
  const SETTINGS_KEY = "grillon.settings.v1";
  const CUSTOM_ANSWERS_KEY = "grillon.custom.answers.v1";
  const CUSTOM_QUESTIONS_KEY = "grillon.custom.questions.v1";
  const CAREER_STATS_KEY = "grillon.career.stats.v1";
  const DAILY_BEST_KEY = "grillon.daily.best.v1";
  const GAME_HISTORY_KEY = "grillon.history.v1";
  const DAILY_DATES_KEY = "grillon.daily.dates.v1";
  const PREVIEW_SECONDS = 3;
  const CACHE_COUNTRIES = "grillon.countries.v1";
  const CACHE_POKEMON = "grillon.pokemon.v2";

  const $ = (id) => document.getElementById(id);
  const screens = {
    home: $("home-screen"),
    game: $("game-screen"),
    results: $("results-screen")
  };

  function makeQuestion(id, category, title, subtitle, rows, source) {
    return {
      id: id,
      category: category,
      title: title,
      subtitle: subtitle,
      source: source || "Grillon",
      answers: rows.map((row) => ({
        name: row[0],
        points: row[1],
        aliases: [row[0]].concat(row[2] || [])
      }))
    };
  }

  const BUILTIN_QUESTIONS = [
    makeQuestion("animals", "Natureza", "Diz o nome de um animal.", "Pode ser qualquer animal. Tenta fugir aos exemplos mais óbvios.", [
      ["Cão", 5, ["cachorro", "dog"]], ["Gato", 5, ["cat"]], ["Leão", 15, ["lion"]], ["Elefante", 15, ["elephant"]],
      ["Tubarão", 30, ["tubarao", "shark"]], ["Pinguim", 30, ["penguin"]], ["Axolote", 55, ["axolotl", "ajolote"]],
      ["Ornitorrinco", 55, ["platypus"]], ["Ocapi", 80, ["okapi"]], ["Narval", 80, ["narwhal"]],
      ["Saola", 100], ["Aye-aye", 100, ["ai ai", "aye aye"]], ["Quokka", 55], ["Lémure", 30, ["lemur"]]
    ]),
    makeQuestion("fruit", "Comida", "Diz o nome de uma fruta.", "Há frutas bem conhecidas e outras que quase ninguém se lembra de nomear.", [
      ["Maçã", 5, ["maca", "apple"]], ["Banana", 5], ["Laranja", 5, ["orange"]], ["Manga", 15, ["mango"]],
      ["Ananás", 15, ["abacaxi", "pineapple"]], ["Kiwi", 15], ["Figo", 30, ["fig"]], ["Romã", 30, ["roma", "pomegranate"]],
      ["Maracujá", 30, ["passion fruit"]], ["Líchia", 55, ["lichia", "lychee"]], ["Pitaya", 55, ["fruta do dragao", "dragon fruit"]],
      ["Tamarindo", 55, ["tamarind"]], ["Rambutão", 80, ["rambutan"]], ["Mangostão", 80, ["mangosteen"]],
      ["Salak", 100, ["snake fruit"]], ["Durião", 100, ["durian"]]
    ]),
    makeQuestion("clubs", "Futebol", "Diz o nome de um clube de futebol.", "Escolhe um clube de qualquer país ou divisão.", [
      ["Real Madrid", 5], ["Barcelona", 5], ["Benfica", 5, ["sport lisboa e benfica", "sl benfica"]],
      ["Sporting", 15, ["sporting cp", "sporting clube de portugal"]], ["FC Porto", 15, ["porto", "futebol clube do porto"]],
      ["Manchester United", 15, ["man utd"]], ["Liverpool", 30], ["Arsenal", 30], ["Bayern Munique", 30, ["bayern munich", "bayern"]],
      ["Ajax", 55, ["ajax amsterdam"]], ["Borussia Dortmund", 55, ["dortmund"]], ["Napoli", 55, ["ssc napoli"]],
      ["Celtic", 80, ["celtic glasgow"]], ["Bodø/Glimt", 80, ["bodo glimt", "bodø glimt"]],
      ["Qarabağ", 100, ["qarabag"]], ["FC Midtjylland", 100, ["midtjylland"]]
    ]),
    makeQuestion("footballers", "Futebol", "Diz o nome de um futebolista.", "Pode estar no ativo ou já ter terminado a carreira.", [
      ["Cristiano Ronaldo", 5, ["cr7", "ronaldo"]], ["Lionel Messi", 5, ["messi"]], ["Kylian Mbappé", 15, ["mbappe"]],
      ["Neymar", 15], ["Erling Haaland", 15, ["haaland"]], ["Mohamed Salah", 30, ["salah"]],
      ["Luka Modrić", 30, ["modric"]], ["Jude Bellingham", 30, ["bellingham"]], ["Son Heung-min", 55, ["son"]],
      ["Viktor Gyökeres", 55, ["gyokeres"]], ["Khvicha Kvaratskhelia", 80, ["kvaratskhelia", "kvara"]],
      ["Takefusa Kubo", 80, ["kubo"]], ["Victor Osimhen", 80, ["osimhen"]],
      ["Hakan Çalhanoğlu", 100, ["calhanoglu"]], ["Ángel Di María", 55, ["di maria"]]
    ]),
    makeQuestion("games", "Gaming", "Diz o nome de um videojogo.", "Vale qualquer jogo lançado para computador, consola ou telemóvel.", [
      ["Minecraft", 5], ["Fortnite", 5], ["Roblox", 5], ["Grand Theft Auto V", 15, ["gta v", "gta 5", "grand theft auto 5"]],
      ["Rocket League", 15], ["Valorant", 30], ["The Sims", 30, ["sims"]], ["Terraria", 55],
      ["Stardew Valley", 55], ["Hollow Knight", 80], ["Outer Wilds", 80], ["Hades", 30],
      ["Tunic", 100], ["Rain World", 100], ["Return of the Obra Dinn", 100, ["obra dinn"]]
    ]),
    makeQuestion("films", "Cinema", "Diz o nome de um filme.", "Animação, ficção científica, comédia, terror... tudo conta.", [
      ["Titanic", 5], ["Avatar", 5], ["Frozen", 5, ["frozen o reino do gelo"]], ["The Avengers", 15, ["avengers", "vingadores"]],
      ["Star Wars", 15], ["Interstellar", 30, ["interestelar"]], ["Inception", 30, ["a origem"]], ["Coco", 30],
      ["Whiplash", 55], ["Parasitas", 55, ["parasite"]], ["Arrival", 55, ["o primeiro encontro"]], ["Oldboy", 80],
      ["The Lighthouse", 80], ["Paprika", 100], ["Stalker", 100], ["A Viagem de Chihiro", 30, ["spirited away"]]
    ]),
    makeQuestion("cars", "Motores", "Diz o nome de uma marca de automóveis.", "Marcas atuais, antigas, populares ou bastante exclusivas.", [
      ["Toyota", 5], ["BMW", 5], ["Mercedes-Benz", 5, ["mercedes"]], ["Ferrari", 15], ["Lamborghini", 15, ["lambo"]],
      ["Porsche", 15], ["Volvo", 30], ["Subaru", 30], ["McLaren", 30, ["mclaren"]], ["Pagani", 55],
      ["Koenigsegg", 55], ["Cupra", 55], ["Rimac", 80], ["Zenvo", 80], ["Wiesmann", 100],
      ["Hispano Suiza", 100, ["hispano-suiza"]]
    ]),
    makeQuestion("characters", "Personagens", "Diz o nome de uma personagem fictícia.", "Pode vir de filmes, séries, livros, banda desenhada ou videojogos.", [
      ["Spider-Man", 5, ["homem aranha", "spiderman"]], ["Batman", 5], ["Superman", 5, ["super homem"]],
      ["Shrek", 15], ["Elsa", 15], ["Sonic", 15], ["Link", 30, ["the legend of zelda link"]],
      ["Kratos", 30], ["Geralt de Rívia", 30, ["geralt", "geralt of rivia"]], ["Totoro", 55],
      ["WALL-E", 55, ["walle"]], ["Baymax", 55], ["Samus Aran", 80, ["samus"]],
      ["GLaDOS", 80, ["glados"]], ["Hornet", 100], ["Fawful", 100]
    ]),
    makeQuestion("capitals", "Geografia", "Diz o nome de uma capital.", "Pode ser a capital de qualquer país do mundo.", [
      ["Lisboa", 5, ["lisbon"]], ["Paris", 5], ["Londres", 5, ["london"]], ["Madrid", 15],
      ["Tóquio", 15, ["tokyo"]], ["Seul", 30, ["seoul"]], ["Brasília", 30, ["brasilia"]],
      ["Reiquiavique", 55, ["reykjavik"]], ["Wellington", 55], ["Tbilisi", 80],
      ["Thimphu", 80], ["Skopje", 55], ["Podgorica", 80], ["Funafuti", 100],
      ["Palikir", 100], ["Ngerulmud", 100]
    ]),
    makeQuestion("artists", "Música", "Diz o nome de um artista musical.", "Vale um artista a solo ou um membro conhecido de um grupo.", [
      ["Taylor Swift", 5], ["Drake", 5], ["The Weeknd", 5], ["Billie Eilish", 5],
      ["Eminem", 15], ["Kendrick Lamar", 15], ["Travis Scott", 15], ["Juice WRLD", 30],
      ["d4vd", 30], ["Tyler, the Creator", 30, ["tyler the creator"]], ["Don Toliver", 55],
      ["JID", 55], ["A$AP Rocky", 55, ["asap rocky"]], ["MF DOOM", 80, ["mf doom"]],
      ["Yung Lean", 80], ["JPEGMAFIA", 100], ["Quadeca", 100], ["Little Simz", 100]
    ]),
    makeQuestion("series", "Televisão", "Diz o nome de uma série.", "Animação, drama, comédia ou ficção científica: qualquer série conta.", [
      ["Stranger Things", 5], ["Breaking Bad", 5], ["Game of Thrones", 5], ["Wednesday", 15],
      ["The Boys", 15], ["The Office", 15], ["The Last of Us", 30], ["Arcane", 30],
      ["Dark", 55], ["Mr. Robot", 55], ["Severance", 55], ["Utopia", 80],
      ["The OA", 80], ["Scavengers Reign", 100], ["Pantheon", 100], ["Station Eleven", 100]
    ]),
    makeQuestion("sports", "Desporto", "Diz o nome de uma modalidade desportiva.", "Vale uma modalidade olímpica ou menos conhecida.", [
      ["Futebol", 5, ["football", "soccer"]], ["Basquetebol", 5, ["basketball"]], ["Ténis", 5, ["tenis", "tennis"]],
      ["Voleibol", 15, ["volleyball"]], ["Rugby", 15], ["Críquete", 30, ["cricket"]],
      ["Andebol", 30, ["handball"]], ["Badminton", 30], ["Esgrima", 55, ["fencing"]],
      ["Curling", 55], ["Squash", 55], ["Lacrosse", 80], ["Kabaddi", 80],
      ["Sepak takraw", 100], ["Tchoukball", 100]
    ]),
    makeQuestion("tech-brands", "Tecnologia", "Diz o nome de uma marca de tecnologia.", "Pode fabricar computadores, telemóveis, componentes ou periféricos.", [
      ["Apple", 5], ["Samsung", 5], ["Microsoft", 5], ["Google", 5], ["Sony", 15],
      ["Nintendo", 15], ["Xiaomi", 15], ["Nvidia", 30], ["Logitech", 30], ["Razer", 30],
      ["ASUS", 55], ["Acer", 55], ["Valve", 55], ["Framework", 80], ["Fairphone", 80],
      ["Nothing", 80], ["Wacom", 100], ["Supermicro", 100]
    ]),
    makeQuestion("minecraft-mobs", "Gaming · Minecraft", "Diz o nome de uma criatura do Minecraft.", "Vale qualquer mob hostil, passivo ou neutro do jogo.", [
      ["Zombie", 5, ["zombie"]], ["Creeper", 5], ["Skeleton", 5], ["Enderman", 15], ["Spider", 15],
      ["Villager", 15], ["Witch", 30], ["Slime", 30], ["Phantom", 30], ["Shulker", 55],
      ["Allay", 55], ["Warden", 55], ["Sniffer", 80], ["Breeze", 80], ["Hoglin", 80],
      ["Strider", 100], ["Bogged", 100], ["Elder Guardian", 100]
    ]),
    makeQuestion("rocket-league-cars", "Gaming · Rocket League", "Diz o nome de um carro do Rocket League.", "Vale qualquer carroçaria jogável, incluindo as menos usadas.", [
      ["Octane", 5], ["Fennec", 5], ["Dominus", 15], ["Breakout", 15], ["Merc", 30],
      ["Takumi", 30], ["Aftershock", 55], ["Dingo", 55], ["Twinzer", 55], ["Masamune", 80],
      ["Animus GP", 80], ["Cyclone", 80], ["Mantis", 100], ["Paladin", 100], ["Road Hog", 100],
      ["Porsche 911 Turbo", 55], ["Nissan Skyline", 30], ["Batmobile", 30]
    ]),
    makeQuestion("consoles", "Gaming · Consolas", "Diz o nome de uma consola de videojogos.", "Consolas de mesa, portáteis e sistemas clássicos também contam.", [
      ["PlayStation 5", 5, ["ps5"]], ["Nintendo Switch", 5, ["switch"]], ["Xbox Series X", 5, ["series x"]],
      ["PlayStation 4", 15, ["ps4"]], ["Xbox 360", 15], ["Nintendo DS", 15], ["Game Boy", 30],
      ["PSP", 30, ["playstation portable"]], ["Wii U", 55], ["Sega Dreamcast", 55, ["dreamcast"]],
      ["PlayStation Vita", 55, ["ps vita", "vita"]], ["Atari Lynx", 80], ["Neo Geo", 80],
      ["WonderSwan", 100], ["Ouya", 100], ["PC Engine", 100, ["turbografx 16"]]
    ]),
    makeQuestion("programming-languages", "Tecnologia · Programação", "Diz o nome de uma linguagem de programação.", "Linguagens gerais, de scripting, funcionais ou de baixo nível contam.", [
      ["Python", 5], ["JavaScript", 5], ["Java", 5], ["C", 15], ["C++", 15], ["C#", 15],
      ["PHP", 30], ["Ruby", 30], ["Go", 30, ["golang"]], ["Rust", 30], ["Kotlin", 55],
      ["Swift", 55], ["Lua", 55], ["Haskell", 80], ["Elixir", 80], ["Erlang", 80],
      ["Fortran", 100], ["COBOL", 100], ["Zig", 100], ["OCaml", 100]
    ]),
    makeQuestion("smartphone-brands", "Tecnologia · Telemóveis", "Diz o nome de uma marca de telemóveis.", "Marcas atuais ou históricas são aceites.", [
      ["Apple", 5], ["Samsung", 5], ["Xiaomi", 5], ["Huawei", 15], ["Google", 15],
      ["OnePlus", 15], ["Motorola", 30], ["Nokia", 30], ["Sony", 30], ["Oppo", 30],
      ["Vivo", 55], ["Honor", 55], ["Nothing", 55], ["Asus", 80], ["Fairphone", 80],
      ["Meizu", 80], ["BlackBerry", 100], ["Palm", 100], ["Vertu", 100]
    ]),
    makeQuestion("instruments", "Música · Instrumentos", "Diz o nome de um instrumento musical.", "Instrumentos acústicos, elétricos e tradicionais também contam.", [
      ["Piano", 5], ["Guitarra", 5, ["guitar"]], ["Bateria", 5, ["drums"]], ["Violino", 15, ["violin"]],
      ["Flauta", 15, ["flute"]], ["Saxofone", 15, ["saxophone"]], ["Trompete", 30, ["trumpet"]],
      ["Harpa", 30, ["harp"]], ["Acordeão", 30, ["acordeao", "accordion"]], ["Bandolim", 55],
      ["Didgeridoo", 55], ["Kalimba", 55], ["Theremin", 80], ["Oud", 80], ["Hang", 80],
      ["Nyckelharpa", 100], ["Erhu", 100], ["Shamisen", 100]
    ]),
    makeQuestion("streaming-services", "Internet · Streaming", "Diz o nome de um serviço de streaming.", "Vídeo, música, anime ou transmissões em direto contam.", [
      ["Netflix", 5], ["Spotify", 5], ["YouTube", 5], ["Prime Video", 15], ["Disney+", 15],
      ["Twitch", 15], ["Apple Music", 30], ["Crunchyroll", 30], ["Max", 30], ["Deezer", 55],
      ["Tidal", 55], ["MUBI", 55], ["SoundCloud", 55], ["Bandcamp", 80], ["Nebula", 80],
      ["Dropout", 80], ["Qobuz", 100], ["Curiosity Stream", 100]
    ]),
    makeQuestion("board-games", "Jogos · Tabuleiro", "Diz o nome de um jogo de tabuleiro.", "Jogos clássicos, modernos ou de estratégia contam.", [
      ["Monopoly", 5], ["Xadrez", 5, ["chess"]], ["Scrabble", 15], ["Cluedo", 15, ["clue"]],
      ["Risk", 15], ["Catan", 30], ["Carcassonne", 30], ["Ticket to Ride", 30],
      ["Azul", 55], ["Wingspan", 55], ["7 Wonders", 55], ["Terraforming Mars", 80],
      ["Root", 80], ["Scythe", 80], ["Crokinole", 100], ["Go", 100], ["Hive", 100]
    ]),
    makeQuestion("f1-teams", "Desporto · Fórmula 1", "Diz o nome de uma equipa de Fórmula 1.", "Equipas atuais ou históricas da categoria contam.", [
      ["Ferrari", 5], ["McLaren", 5], ["Mercedes", 5], ["Red Bull Racing", 15, ["red bull"]],
      ["Williams", 15], ["Aston Martin", 15], ["Alpine", 30], ["Haas", 30],
      ["Racing Bulls", 30, ["rb", "rb f1 team", "alphatauri", "toro rosso"]],
      ["Sauber", 55], ["Jordan", 55], ["Brawn GP", 55], ["Lotus", 80],
      ["Minardi", 80], ["Arrows", 100], ["Tyrrell", 100], ["Brabham", 100]
    ]),
    makeQuestion("dishes", "Comida · Pratos", "Diz o nome de um prato de comida.", "Pratos de qualquer país, incluindo especialidades regionais.", [
      ["Pizza", 5], ["Hambúrguer", 5, ["hamburger"]], ["Sushi", 5], ["Bacalhau à Brás", 15],
      ["Francesinha", 15], ["Lasanha", 15, ["lasagna"]], ["Ramen", 30], ["Pad Thai", 30],
      ["Feijoada", 30], ["Biryani", 55], ["Goulash", 55], ["Ceviche", 55], ["Bibimbap", 80],
      ["Khachapuri", 80], ["Jollof rice", 80, ["arroz jollof"]], ["Hákarl", 100],
      ["Koshari", 100], ["Pkhali", 100]
    ]),
    makeQuestion("web-browsers", "Internet · Navegadores", "Diz o nome de um navegador de Internet.", "Vale qualquer browser atual ou histórico.", [
      ["Google Chrome", 5, ["chrome"]], ["Safari", 5], ["Microsoft Edge", 15, ["edge"]],
      ["Firefox", 15, ["mozilla firefox"]], ["Opera", 15], ["Brave", 30], ["Vivaldi", 30],
      ["Tor Browser", 55], ["Samsung Internet", 55], ["Arc", 55], ["Waterfox", 80],
      ["Pale Moon", 80], ["Midori", 80], ["Lynx", 100], ["SeaMonkey", 100],
      ["Falkon", 100], ["K-Meleon", 100]
    ]),
    makeQuestion("mythical-creatures", "Fantasia · Criaturas", "Diz o nome de uma criatura mitológica ou lendária.", "Criaturas de lendas, mitologias e folclore de qualquer cultura.", [
      ["Dragão", 5, ["dragon"]], ["Unicórnio", 5, ["unicorn"]], ["Fénix", 15, ["phoenix"]], ["Sereia", 15, ["mermaid"]],
      ["Grifo", 30, ["griffin"]], ["Centauro", 30, ["centaur"]], ["Hidra", 30, ["hydra"]],
      ["Basilisco", 55, ["basilisk"]], ["Minotauro", 55, ["minotaur"]], ["Quimera", 55, ["chimera"]],
      ["Manticora", 80, ["manticore"]], ["Kelpie", 80], ["Qilin", 80, ["kirin"]],
      ["Roc", 100], ["Nuckelavee", 100], ["Baku", 100], ["Tikbalang", 100]
    ]),
    makeQuestion("cities", "Geografia · Cidades", "Diz o nome de uma cidade.", "Qualquer cidade do mundo, grande ou pequena, é válida.", [
      ["Lisboa", 5], ["Londres", 5], ["Paris", 5], ["Nova Iorque", 5, ["new york"]],
      ["Tóquio", 15, ["tokyo"]], ["Porto", 15], ["Barcelona", 15], ["Istambul", 30, ["istanbul"]],
      ["Osaka", 30], ["Marrakech", 30], ["Tallinn", 55], ["Tbilisi", 55], ["Tartu", 55],
      ["Chiang Mai", 80], ["Ushuaia", 80], ["Samarkand", 80], ["Ouagadougou", 100], ["Gjirokastër", 100]
    ])
  ];

  function cloneQuestion(question) {
    return {
      ...question,
      answers: question.answers.map((answer) => ({ ...answer, aliases: answer.aliases.slice() }))
    };
  }

  let questionPool = BUILTIN_QUESTIONS.map(cloneQuestion);
  let customQuestions = [];
  let activeQuestions = [];
  let editingQuestionId = "";
  let currentIndex = 0;
  let currentQuestion = null;
  let currentResults = [];
  let totalScore = 0;
  let remaining = DEFAULT_ROUND_SECONDS;
  let roundLength = DEFAULT_ROUND_LENGTH;
  let roundSeconds = DEFAULT_ROUND_SECONDS;
  let maxRoundScore = DEFAULT_ROUND_LENGTH * 100;
  let categorySelection = null;
  let customAnswerBank = {};
  let careerStats = { games: 0, percentTotal: 0, rareAnswers: 0, legendaryAnswers: 0, customCreated: 0 };
  let gameHistory = [];
  let completedDailyDates = [];
  let currentMode = "practice";
  let dailyDateKey = "";
  let timerId = null;
  let previewId = null;
  let locked = false;
  let toastTimer = null;

  function showScreen(name) {
    Object.keys(screens).forEach((key) => { screens[key].hidden = key !== name; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getLisbonDateKey(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date || new Date());
    const values = {};
    parts.forEach((part) => { values[part.type] = part.value; });
    return values.year + "-" + values.month + "-" + values.day;
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededShuffle(array, seedText) {
    const copy = array.slice();
    let state = hashSeed(seedText);
    function random() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function loadCustomAnswers() {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_ANSWERS_KEY) || "{}");
      customAnswerBank = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch (_) { customAnswerBank = {}; }
    questionPool.forEach(applyCustomAnswers);
  }

  function sanitizeCustomQuestion(input) {
    if (!input || typeof input !== "object") return null;
    const id = typeof input.id === "string" ? input.id.slice(0, 90) : "";
    const category = typeof input.category === "string" ? input.category.trim().slice(0, 38) : "";
    const title = typeof input.title === "string" ? input.title.trim().slice(0, 110) : "";
    const subtitle = typeof input.subtitle === "string" ? input.subtitle.trim().slice(0, 180) : "";
    if (!id.startsWith("custom-") || !category || !title || !Array.isArray(input.answers)) return null;
    if (input.answers.length < 2 || input.answers.length > 100) return null;

    const seen = new Set();
    const answers = [];
    for (const entry of input.answers) {
      if (!entry || typeof entry.name !== "string" || !Array.isArray(entry.aliases)) return null;
      const name = entry.name.trim().slice(0, 70);
      const points = Number(entry.points);
      if (name.length < 1 || !POINTS.includes(points)) return null;

      const primaryKey = normalise(name);
      if (!primaryKey || seen.has(primaryKey)) return null;
      seen.add(primaryKey);
      const aliases = [name];
      const localAliases = new Set([primaryKey]);

      for (const rawAlias of entry.aliases.filter((alias) => typeof alias === "string").slice(0, 16)) {
        const alias = rawAlias.trim().slice(0, 70);
        const key = normalise(alias);
        if (!key || key === primaryKey) continue;
        if (localAliases.has(key) || seen.has(key)) return null;
        localAliases.add(key);
        seen.add(key);
        aliases.push(alias);
        if (aliases.length >= 9) break;
      }
      answers.push({ name, points, aliases, custom: true });
    }
    return { id, category, title, subtitle, source: "Pergunta pessoal", answers };
  }

  function loadCustomQuestions() {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_QUESTIONS_KEY) || "[]");
      customQuestions = Array.isArray(saved) ? saved.map(sanitizeCustomQuestion).filter(Boolean).slice(0, 100) : [];
    } catch (_) { customQuestions = []; }

    const existingIds = new Set(questionPool.map((question) => question.id));
    const seenIds = new Set(existingIds);
    customQuestions = customQuestions.filter((question) => {
      if (seenIds.has(question.id)) return false;
      seenIds.add(question.id);
      return true;
    });
    customQuestions.forEach((question) => {
      applyCustomAnswers(question);
      questionPool.push(question);
    });
  }

  function saveCustomQuestions() {
    try {
      localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(customQuestions));
      return true;
    } catch (_) {
      showToast("Não foi possível guardar as perguntas. O armazenamento do navegador pode estar cheio.");
      return false;
    }
  }

  function applyCustomAnswers(question) {
    const extras = customAnswerBank[question.id];
    if (!Array.isArray(extras)) return;
    extras.slice(0, 100).forEach((entry) => {
      if (!entry || typeof entry.name !== "string" || !Array.isArray(entry.aliases)) return;
      const name = entry.name.trim().slice(0, 70);
      const points = Number(entry.points);
      if (!name || !POINTS.includes(points)) return;
      const key = normalise(name);
      const exists = question.answers.some((answer) =>
        answer.aliases.some((alias) => normalise(alias) === key)
      );
      if (exists || !key) return;

      const occupied = new Set(question.answers.flatMap((answer) => answer.aliases.map(normalise)));
      const aliases = [name];
      const localAliases = new Set([key]);
      let conflict = false;
      entry.aliases.filter((alias) => typeof alias === "string").slice(0, 8).forEach((rawAlias) => {
        const alias = rawAlias.trim().slice(0, 70);
        const aliasKey = normalise(alias);
        if (!aliasKey || aliasKey === key) return;
        if (occupied.has(aliasKey) || localAliases.has(aliasKey)) {
          conflict = true;
          return;
        }
        localAliases.add(aliasKey);
        aliases.push(alias);
      });
      if (!conflict) question.answers.push({ name, points, aliases, custom: true });
    });
  }

  function normalise(value) {
    const raw = String(value || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const compact = raw.replace(/\s+/g, "");
    if (/^[a-z][+#]{1,2}$/.test(compact)) return compact;
    const words = raw.match(/[a-z0-9]+/g) || [];
    const articles = new Set(["the", "a", "an", "o", "os", "as", "um", "uma", "uns", "umas", "el", "la", "los", "las"]);
    if (words.length > 1 && articles.has(words[0])) words.shift();
    return words.join("");
  }

  function parseAnswerLines(text) {
    const answers = [];
    const errors = [];
    const usedAliases = new Map();
    const lines = String(text || "").split(/\r?\n/);

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) return;
      const fields = line.split("|").map((part) => part.trim());
      const name = fields[0] || "";
      const points = Number(fields[1]);
      const aliases = (fields[2] || "").split(",").map((alias) => alias.trim()).filter(Boolean);
      const lineNumber = index + 1;

      if (fields.length > 3) {
        errors.push("Linha " + lineNumber + ": usa no máximo três campos separados por |.");
        return;
      }
      if (name.length < 1 || name.length > 70) {
        errors.push("Linha " + lineNumber + ": a resposta deve ter entre 2 e 70 caracteres.");
        return;
      }
      if (!POINTS.includes(points)) {
        errors.push("Linha " + lineNumber + ": os pontos têm de ser 5, 15, 30, 55, 80 ou 100.");
        return;
      }
      if (aliases.some((alias) => alias.length > 70)) {
        errors.push("Linha " + lineNumber + ": cada alias pode ter no máximo 70 caracteres.");
        return;
      }
      if (aliases.length > 8) {
        errors.push("Linha " + lineNumber + ": cada resposta pode ter no máximo oito aliases.");
        return;
      }

      const allAliases = [name].concat(aliases);
      const lineAliases = new Set();
      let duplicate = false;
      for (const alias of allAliases) {
        const key = normalise(alias);
        if (!key) {
          errors.push("Linha " + lineNumber + ": foi encontrado um alias vazio ou inválido.");
          duplicate = true;
          break;
        }
        if (usedAliases.has(key) || lineAliases.has(key)) {
          errors.push("Linha " + lineNumber + ": «" + alias + "» repete uma resposta ou alias já usado.");
          duplicate = true;
          break;
        }
        lineAliases.add(key);
      }
      if (duplicate) return;

      allAliases.forEach((alias) => usedAliases.set(normalise(alias), name));
      answers.push({ name, points, aliases: allAliases, custom: true });
    });

    if (answers.length < 2) errors.push("Adiciona pelo menos duas respostas válidas.");
    if (answers.length > 100) errors.push("Uma pergunta pode ter no máximo 100 respostas.");
    return { answers: answers, errors: errors };
  }

  function tierName(points) {
    const index = POINTS.indexOf(points);
    return index < 0 ? "Sem pontos" : TIER_NAMES[index];
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function readCache(key, maxAgeMs) {
    try {
      const item = JSON.parse(localStorage.getItem(key) || "null");
      if (item && item.savedAt && Date.now() - item.savedAt < maxAgeMs && item.data) return item.data;
    } catch (_) {}
    return null;
  }

  function writeCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data: data })); } catch (_) {}
  }

  async function fetchJson(url, timeoutMs) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs || 12000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function mapLimit(items, limit, mapper) {
    const output = new Array(items.length);
    let next = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async function () {
      while (next < items.length) {
        const index = next++;
        try { output[index] = await mapper(items[index], index); }
        catch (_) { output[index] = null; }
      }
    });
    await Promise.all(workers);
    return output.filter(Boolean);
  }

  function uniqueStrings(values) {
    const seen = new Set();
    const result = [];
    values.forEach((value) => {
      if (!value || typeof value !== "string") return;
      const text = value.trim();
      const key = normalise(text);
      if (key.length < 2 || seen.has(key)) return;
      seen.add(key);
      result.push(text);
    });
    return result;
  }

  function rarityByRank(index, total) {
    if (total <= 1) return 100;
    const fromRareEnd = 1 - (index / (total - 1));
    const tier = Math.max(0, Math.min(5, Math.floor(fromRareEnd * 6)));
    return POINTS[tier];
  }

  async function loadCountries() {
    let countries = readCache(CACHE_COUNTRIES, 24 * 60 * 60 * 1000);
    if (!countries) {
      countries = await fetchJson("https://restcountries.com/v3.1/all?fields=name,population,translations,cca3,altSpellings", 15000);
      if (!Array.isArray(countries)) throw new Error("Resposta de países inválida");
      writeCache(CACHE_COUNTRIES, countries);
    }

    const valid = countries.filter((country) => country && country.name && country.name.common);
    valid.sort((a, b) => (Number(a.population) || 0) - (Number(b.population) || 0));
    const answers = valid.map((country, index) => {
      const portuguese = country.translations && country.translations.por ? country.translations.por.common : "";
      const officialPortuguese = country.translations && country.translations.por ? country.translations.por.official : "";
      const aliases = uniqueStrings([
        country.name.common, country.name.official, portuguese, officialPortuguese,
        ...(country.altSpellings || []), country.cca3
      ]);
      return { name: portuguese || country.name.common, points: rarityByRank(index, valid.length), aliases: aliases };
    });
    return {
      id: "countries", category: "Geografia", title: "Diz o nome de um país.",
      subtitle: "Qualquer país reconhecido conta. A raridade é estimada através da dimensão da população.",
      source: "REST Countries", answers: answers
    };
  }

  const POKEMON_IDS = [
    1, 4, 7, 25, 39, 52, 54, 74, 94, 104, 113, 123, 130, 133, 143, 149, 150, 151,
    172, 196, 197, 212, 214, 243, 244, 245, 249, 250, 251, 252, 255, 258, 282, 292,
    302, 303, 306, 330, 333, 350, 359, 361, 374, 376, 380, 381, 384, 385, 386,
    393, 448, 470, 471, 475, 487, 491, 492, 493, 570, 571, 574, 575, 576, 609,
    612, 633, 635, 638, 639, 640, 643, 644, 646, 647, 648, 649, 650, 658, 700,
    716, 717, 718, 722, 724, 725, 728, 745, 778, 800, 801, 802, 808, 809, 888,
    889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 1000
  ];

  const POKEMON_PORTUGUESE = {
    "bulbasaur": ["Bulbasaur"], "ivysaur": ["Ivysaur"], "venusaur": ["Venusaur"],
    "charmander": ["Charmander"], "charmeleon": ["Charmeleon"], "charizard": ["Charizard"],
    "squirtle": ["Squirtle"], "wartortle": ["Wartortle"], "blastoise": ["Blastoise"],
    "pikachu": ["Pikachu"], "raichu": ["Raichu"], "meowth": ["Miau"],
    "psyduck": ["Psyduck"], "gengar": ["Gengar"], "snorlax": ["Snorlax"],
    "mewtwo": ["Mewtwo"], "mew": ["Mew"], "eevee": ["Eevee"], "vaporeon": ["Vaporeon"],
    "jolteon": ["Jolteon"], "flareon": ["Flareon"], "articuno": ["Articuno"],
    "zapdos": ["Zapdos"], "moltres": ["Moltres"], "dratini": ["Dratini"],
    "dragonite": ["Dragonite"], "lugia": ["Lugia"], "ho-oh": ["Ho-Oh"],
    "celebi": ["Celebi"], "gardevoir": ["Gardevoir"], "lucario": ["Lucario"],
    "greninja": ["Greninja"], "rowlet": ["Rowlet"], "mimikyu": ["Mimikyu"],
    "zeraora": ["Zeraora"], "zacian": ["Zacian"], "zamazenta": ["Zamazenta"],
    "sprigatito": ["Sprigatito"], "fuecoco": ["Fuecoco"], "quaxly": ["Quaxly"]
  };

  async function loadPokemon() {
    let pokemon = readCache(CACHE_POKEMON, 24 * 60 * 60 * 1000);
    if (!pokemon) {
      const list = await fetchJson("https://pokeapi.co/api/v2/pokemon-species?limit=1025", 15000);
      if (!list || !Array.isArray(list.results)) throw new Error("Lista Pokémon indisponível");
      const available = list.results;
      const byId = new Map();
      available.forEach((entry) => {
        const match = entry.url.match(/\/pokemon-species\/(\d+)\/?$/);
        if (match) byId.set(Number(match[1]), entry);
      });
      const ids = uniqueStrings(POKEMON_IDS.map(String)).map(Number).filter((id) => byId.has(id));
      const selected = ids.slice(0, 36);
      pokemon = await mapLimit(selected, 6, async (id) => {
        return await fetchJson("https://pokeapi.co/api/v2/pokemon-species/" + id + "/", 12000);
      });
      writeCache(CACHE_POKEMON, pokemon);
    }

    const entries = pokemon.map((species) => {
      if (!species || !species.name) return null;
      const englishName = species.name.replace(/-/g, " ");
      const translations = (species.names || []).filter((item) => item && item.name).map((item) => item.name);
      const aliases = uniqueStrings([englishName, species.name, ...(POKEMON_PORTUGUESE[species.name] || []), ...translations]);
      return { name: (POKEMON_PORTUGUESE[species.name] || [englishName])[0], captureRate: Number(species.capture_rate) || 120, aliases: aliases };
    }).filter(Boolean);

    entries.sort((a, b) => a.captureRate - b.captureRate);
    const answers = entries.map((entry, index) => ({
      name: entry.name,
      points: rarityByRank(index, entries.length),
      aliases: entry.aliases
    }));

    return {
      id: "pokemon", category: "Gaming", title: "Diz o nome de um Pokémon.",
      subtitle: "Vale qualquer Pokémon desta seleção. Os pontos estimam a raridade através da taxa de captura no jogo.",
      source: "PokéAPI", answers: answers
    };
  }

  function updateApiStatus(results) {
    const status = $("api-status");
    const text = $("api-status-text");
    status.classList.remove("ready", "partial");
    const connected = results.filter((item) => item.ok).map((item) => item.name);
    const failed = results.filter((item) => !item.ok).map((item) => item.name);
    if (connected.length === 2) {
      status.classList.add("ready");
      text.textContent = "APIs ligadas: REST Countries + PokéAPI";
    } else if (connected.length === 1) {
      status.classList.add("partial");
      text.textContent = "API ligada: " + connected[0] + (failed.length ? " · outra indisponível" : "");
    } else {
      status.classList.add("partial");
      text.textContent = "A usar perguntas incluídas no Grillon · APIs indisponíveis";
    }
  }

  async function loadExternalQuestions() {
    const results = await Promise.all([
      loadCountries().then((question) => {
        applyCustomAnswers(question);
        questionPool = questionPool.filter((item) => item.id !== question.id).concat(question);
        return { ok: true, name: "REST Countries" };
      }).catch(() => ({ ok: false, name: "REST Countries" })),
      loadPokemon().then((question) => {
        applyCustomAnswers(question);
        questionPool = questionPool.filter((item) => item.id !== question.id).concat(question);
        return { ok: true, name: "PokéAPI" };
      }).catch(() => ({ ok: false, name: "PokéAPI" }))
    ]);
    updateApiStatus(results);
    renderCategoryOptions();
    updateSetupSummary();
  }

  function getEligibleQuestions() {
    if (categorySelection === null) return questionPool.slice();
    return questionPool.filter((question) => categorySelection.has(question.id));
  }

  function renderCategoryOptions() {
    const container = $("category-options");
    if (!container) return;
    container.replaceChildren();
    questionPool.slice().sort((a, b) => a.category.localeCompare(b.category, "pt-PT")).forEach((question) => {
      const label = document.createElement("label");
      label.className = "category-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = question.id;
      checkbox.checked = categorySelection === null || categorySelection.has(question.id);
      checkbox.addEventListener("change", () => {
        if (categorySelection === null) categorySelection = new Set(questionPool.map((item) => item.id));
        if (checkbox.checked) categorySelection.add(question.id);
        else categorySelection.delete(question.id);
        if (categorySelection.size >= questionPool.length) categorySelection = null;
        saveSettings();
        renderCategoryOptions();
        updateSetupSummary();
      });
      const name = document.createElement("span");
      const suffixes = {
        pokemon: " · Pokémon", games: " · Videojogos", countries: " · Países",
        clubs: " · Clubes", footballers: " · Jogadores", artists: " · Artistas",
        instruments: " · Instrumentos", "streaming-services": " · Streaming",
        "web-browsers": " · Navegadores", cities: " · Cidades",
        "rocket-league-cars": " · Rocket League", "minecraft-mobs": " · Minecraft",
        consoles: " · Consolas", "programming-languages": " · Programação",
        "smartphone-brands": " · Telemóveis"
      };
      const suffix = suffixes[question.id] || "";
      name.textContent = question.category + suffix;
      label.append(checkbox, name);
      container.append(label);
    });
    $("selected-category-count").textContent = getEligibleQuestions().length + "/" + questionPool.length;
  }

  function updateSetupSummary() {
    const selected = getEligibleQuestions();
    const requested = Number($("round-length").value) || DEFAULT_ROUND_LENGTH;
    const time = Number($("round-time").value) || DEFAULT_ROUND_SECONDS;
    const actual = Math.min(requested, selected.length);
    $("mission-question-count").textContent = String(actual).padStart(2, "0");
    $("mission-time-count").textContent = String(time);
    $("mission-max-score").textContent = String(actual * 100);
    $("home-depth-max").textContent = (actual * 1000).toLocaleString("pt-PT") + " m";
    const hint = $("setup-hint");
    hint.classList.toggle("warning", selected.length > 0 && selected.length < requested);
    if (selected.length === 0) {
      hint.textContent = "Seleciona pelo menos um tema para começares a jogar.";
    } else if (selected.length < requested) {
      hint.textContent = "Selecionaste " + selected.length + " temas. Esta ronda terá " + selected.length + " perguntas para não repetir categorias.";
    } else {
      hint.textContent = "Serão escolhidos " + requested + " temas diferentes, com " + time + " segundos por resposta.";
    }
  }

  function applyTheme(theme) {
    const allowedThemes = ["ocean", "abyss", "coral"];
    const selected = allowedThemes.includes(theme) ? theme : "ocean";
    document.documentElement.dataset.theme = selected;
    $("theme-select").value = selected;
    return selected;
  }

  function loadSettings() {
    applyTheme("ocean");
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      if ([5, 7, 10].includes(Number(saved.roundLength))) $("round-length").value = String(saved.roundLength);
      if ([15, 25, 40].includes(Number(saved.roundSeconds))) $("round-time").value = String(saved.roundSeconds);
      if (Array.isArray(saved.categories)) categorySelection = new Set(saved.categories.filter((id) => typeof id === "string"));
      applyTheme(saved.theme);
    } catch (_) {}
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        roundLength: Number($("round-length").value) || DEFAULT_ROUND_LENGTH,
        roundSeconds: Number($("round-time").value) || DEFAULT_ROUND_SECONDS,
        categories: categorySelection === null ? null : Array.from(categorySelection),
        theme: document.documentElement.dataset.theme || "ocean"
      }));
    } catch (_) {}
  }

  function setEditorFeedback(message, isError) {
    const element = $("editor-feedback");
    element.textContent = message;
    element.classList.toggle("error", Boolean(isError));
    element.classList.toggle("success", Boolean(message) && !isError);
  }

  function resetQuestionEditor() {
    $("custom-question-form").reset();
    $("editor-question-id").value = "";
    editingQuestionId = "";
    $("editor-save-button").textContent = "GUARDAR PERGUNTA +";
    $("editor-cancel-button").hidden = true;
    setEditorFeedback("", false);
  }

  function renderCustomQuestionList() {
    const container = $("custom-question-list");
    container.replaceChildren();
    $("custom-question-count").textContent = customQuestions.length + (customQuestions.length === 1 ? " pergunta" : " perguntas");

    if (customQuestions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-library";
      empty.textContent = "Ainda não criaste perguntas personalizadas.";
      container.append(empty);
      return;
    }

    customQuestions.forEach((question) => {
      const item = document.createElement("article");
      item.className = "custom-question-item";

      const summary = document.createElement("div");
      summary.className = "custom-question-summary";
      const category = document.createElement("strong");
      category.textContent = question.category;
      const title = document.createElement("span");
      title.textContent = question.title;
      const count = document.createElement("small");
      count.textContent = question.answers.length + " respostas aceites";
      summary.append(category, title, count);

      const actions = document.createElement("div");
      actions.className = "custom-question-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "text-button";
      edit.textContent = "EDITAR";
      edit.addEventListener("click", () => editCustomQuestion(question.id));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-button danger-button";
      remove.textContent = "APAGAR";
      remove.addEventListener("click", () => deleteCustomQuestion(question.id));

      actions.append(edit, remove);
      item.append(summary, actions);
      container.append(item);
    });
  }

  function editCustomQuestion(id) {
    const question = customQuestions.find((item) => item.id === id);
    if (!question) return;
    editingQuestionId = id;
    $("editor-question-id").value = id;
    $("editor-category").value = question.category;
    $("editor-title").value = question.title;
    $("editor-subtitle").value = question.subtitle;
    $("editor-answers").value = question.answers.map((answer) => {
      const aliases = answer.aliases.filter((alias) => normalise(alias) !== normalise(answer.name));
      return answer.name + " | " + answer.points + (aliases.length ? " | " + aliases.join(", ") : "");
    }).join("\n");
    $("editor-save-button").textContent = "GUARDAR ALTERAÇÕES";
    $("editor-cancel-button").hidden = false;
    setEditorFeedback("A editar: " + question.category, false);
    $("custom-question-form").scrollIntoView({ behavior: "smooth", block: "center" });
    $("editor-category").focus({ preventScroll: true });
  }

  function deleteCustomQuestion(id) {
    const question = customQuestions.find((item) => item.id === id);
    if (!question || !window.confirm("Apagar a categoria «" + question.category + "» e as respetivas respostas?")) return;

    const nextQuestions = customQuestions.filter((item) => item.id !== id);
    try {
      localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(nextQuestions));
    } catch (_) {
      showToast("Não foi possível atualizar o banco pessoal.");
      return;
    }

    customQuestions = nextQuestions;
    if (!existing) {
      careerStats.customCreated += 1;
      saveCareerStats();
    }
    questionPool = questionPool.filter((item) => item.id !== id);
    if (categorySelection !== null) categorySelection.delete(id);
    delete customAnswerBank[id];
    try { localStorage.setItem(CUSTOM_ANSWERS_KEY, JSON.stringify(customAnswerBank)); } catch (_) {}
    if (editingQuestionId === id) resetQuestionEditor();
    saveSettings();
    renderCustomQuestionList();
    renderCategoryOptions();
    updateSetupSummary();
    showToast("Categoria apagada.");
  }

  function saveQuestionFromEditor(event) {
    event.preventDefault();
    const category = $("editor-category").value.trim();
    const title = $("editor-title").value.trim();
    const subtitle = $("editor-subtitle").value.trim();
    const parsed = parseAnswerLines($("editor-answers").value);

    if (category.length < 2 || title.length < 5) {
      setEditorFeedback("Indica uma categoria e uma pergunta com pelo menos 5 caracteres.", true);
      return;
    }
    const duplicateCategory = questionPool.find((item) =>
      item.id !== editingQuestionId && normalise(item.category) === normalise(category)
    );
    if (duplicateCategory) {
      setEditorFeedback("Já existe uma categoria com esse nome. Escolhe um nome diferente.", true);
      return;
    }
    if (parsed.errors.length) {
      setEditorFeedback(parsed.errors.slice(0, 3).join(" "), true);
      return;
    }

    const existing = editingQuestionId ? customQuestions.find((item) => item.id === editingQuestionId) : null;
    if (editingQuestionId && !existing) {
      resetQuestionEditor();
      setEditorFeedback("A pergunta que estavas a editar já não existe. Cria uma nova.", true);
      return;
    }
    if (!existing && customQuestions.length >= 100) {
      setEditorFeedback("O banco pessoal chegou ao limite de 100 perguntas.", true);
      return;
    }

    let id = editingQuestionId;
    if (!id) {
      const slug = normalise(category).slice(0, 30) || "categoria";
      const base = "custom-" + slug;
      id = base + "-" + Date.now().toString(36);
      let suffix = 2;
      while (questionPool.some((item) => item.id === id)) id = base + "-" + Date.now().toString(36) + "-" + suffix++;
    }

    const question = {
      id,
      category,
      title,
      subtitle,
      source: "Pergunta pessoal",
      answers: parsed.answers.map((answer) => ({
        name: answer.name, points: answer.points, aliases: answer.aliases.slice(), custom: true
      }))
    };

    const nextQuestions = existing
      ? customQuestions.map((item) => item.id === id ? question : item)
      : customQuestions.concat(question);

    try {
      localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(nextQuestions));
    } catch (_) {
      setEditorFeedback("Não foi possível guardar. O armazenamento do navegador pode estar cheio.", true);
      return;
    }

    customQuestions = nextQuestions;
    questionPool = questionPool.filter((item) => item.id !== id);
    applyCustomAnswers(question);
    questionPool.push(question);
    renderCategoryOptions();
    renderCustomQuestionList();
    updateSetupSummary();
    updateCareerStats();
    resetQuestionEditor();
    setEditorFeedback(existing ? "Pergunta atualizada com sucesso." : "Pergunta criada com sucesso.", false);
    showToast(existing ? "Pergunta atualizada." : "Nova categoria adicionada ao treino.");
  }

  function sanitizeCustomAnswerBank(input) {
    const output = {};
    if (!input || typeof input !== "object" || Array.isArray(input)) return output;
    Object.entries(input).slice(0, 150).forEach(([id, entries]) => {
      if (typeof id !== "string" || !Array.isArray(entries)) return;
      const clean = [];
      entries.slice(0, 100).forEach((entry) => {
        if (!entry || typeof entry.name !== "string" || !Array.isArray(entry.aliases)) return;
        const name = entry.name.trim().slice(0, 70);
        const points = Number(entry.points);
        if (name.length < 1 || !POINTS.includes(points)) return;
        const aliases = [name].concat(entry.aliases.filter((alias) => typeof alias === "string").map((alias) => alias.trim().slice(0, 70)).filter(Boolean).slice(0, 8));
        clean.push({ name, points, aliases });
      });
      if (clean.length) output[id.slice(0, 90)] = clean;
    });
    return output;
  }

  function createBackup() {
    return {
      app: "Grillon",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        settings: {
          roundLength: Number($("round-length").value) || DEFAULT_ROUND_LENGTH,
          roundSeconds: Number($("round-time").value) || DEFAULT_ROUND_SECONDS,
          categories: categorySelection === null ? null : Array.from(categorySelection),
          theme: document.documentElement.dataset.theme || "ocean"
        },
        customQuestions,
        customAnswers: customAnswerBank,
        careerStats,
        gameHistory,
        dailyDates: completedDailyDates,
        bestPercent: getBestPercent(),
        dailyBest: readDailyBest()
      }
    };
  }

  function exportBackup() {
    try {
      const backup = createBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "grillon-backup-" + getLisbonDateKey() + ".json";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Cópia de segurança exportada.");
    } catch (_) {
      showToast("Não foi possível criar a cópia de segurança.");
    }
  }

  async function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    event.target.value = "";

    if (file.size > 2 * 1024 * 1024) {
      showToast("O ficheiro é demasiado grande (máximo: 2 MB).");
      return;
    }

    try {
      const backup = JSON.parse(await file.text());
      if (!backup || backup.app !== "Grillon" || backup.version !== 1 || !backup.data || typeof backup.data !== "object") {
        throw new Error("Formato de cópia de segurança não reconhecido.");
      }
      if (!window.confirm("Importar esta cópia substitui as perguntas pessoais, preferências e estatísticas guardadas neste navegador. Continuar?")) return;

      const data = backup.data;
      const importedQuestionMap = new Map();
      if (Array.isArray(data.customQuestions)) {
        data.customQuestions.forEach((entry) => {
          const clean = sanitizeCustomQuestion(entry);
          if (clean && !importedQuestionMap.has(clean.id) && importedQuestionMap.size < 100) {
            importedQuestionMap.set(clean.id, clean);
          }
        });
      }
      const importedQuestions = Array.from(importedQuestionMap.values());
      const importedAnswers = sanitizeCustomAnswerBank(data.customAnswers);
      const importedSettings = data.settings && typeof data.settings === "object" ? data.settings : {};
      const roundLengthValue = [5, 7, 10].includes(Number(importedSettings.roundLength)) ? Number(importedSettings.roundLength) : DEFAULT_ROUND_LENGTH;
      const roundSecondsValue = [15, 25, 40].includes(Number(importedSettings.roundSeconds)) ? Number(importedSettings.roundSeconds) : DEFAULT_ROUND_SECONDS;
      const importedTheme = ["ocean", "abyss", "coral"].includes(importedSettings.theme) ? importedSettings.theme : "ocean";
      const importedCategories = Array.isArray(importedSettings.categories)
        ? importedSettings.categories.filter((id) => typeof id === "string").slice(0, 150)
        : null;
      const stats = data.careerStats && typeof data.careerStats === "object" ? data.careerStats : {};
      const safeStats = {
        games: Math.max(0, Math.min(1000000, Number(stats.games) || 0)),
        percentTotal: Math.max(0, Math.min(100000000, Number(stats.percentTotal) || 0)),
        rareAnswers: Math.max(0, Math.min(10000000, Number(stats.rareAnswers) || 0)),
        legendaryAnswers: Math.max(0, Math.min(10000000, Number(stats.legendaryAnswers) || 0)),
        customCreated: Math.max(0, Math.min(100000, Number(stats.customCreated) || 0))
      };
      const safeBest = Math.max(0, Math.min(100, Number(data.bestPercent) || 0));
      const importedHistory = sanitizeGameHistory(data.gameHistory);
      const importedDailyDates = sanitizeDailyDates(data.dailyDates);
      let safeDaily = null;
      if (data.dailyBest && typeof data.dailyBest.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.dailyBest.date)) {
        safeDaily = {
          date: data.dailyBest.date,
          bestScore: Math.max(0, Math.min(700, Number(data.dailyBest.bestScore) || 0)),
          bestPercent: Math.max(0, Math.min(100, Number(data.dailyBest.bestPercent) || 0)),
          plays: Math.max(0, Math.min(100000, Number(data.dailyBest.plays) || 0))
        };
      }

      const backupKeys = [CUSTOM_QUESTIONS_KEY, CUSTOM_ANSWERS_KEY, SETTINGS_KEY, CAREER_STATS_KEY, BEST_KEY, DAILY_BEST_KEY, GAME_HISTORY_KEY, DAILY_DATES_KEY];
      const previousValues = new Map(backupKeys.map((key) => [key, localStorage.getItem(key)]));
      try {
        localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(importedQuestions));
        localStorage.setItem(CUSTOM_ANSWERS_KEY, JSON.stringify(importedAnswers));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
          roundLength: roundLengthValue,
          roundSeconds: roundSecondsValue,
          categories: importedCategories,
          theme: importedTheme
        }));
        localStorage.setItem(CAREER_STATS_KEY, JSON.stringify(safeStats));
        localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(importedHistory));
        localStorage.setItem(DAILY_DATES_KEY, JSON.stringify(importedDailyDates));
        localStorage.setItem(BEST_KEY, String(safeBest));
        if (safeDaily) localStorage.setItem(DAILY_BEST_KEY, JSON.stringify(safeDaily));
        else localStorage.removeItem(DAILY_BEST_KEY);
      } catch (storageError) {
        previousValues.forEach((value, key) => {
          try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
          } catch (_) {}
        });
        throw new Error("Não foi possível guardar todos os dados importados. Os dados anteriores foram repostos.");
      }

      questionPool = BUILTIN_QUESTIONS.map(cloneQuestion);
      customAnswerBank = importedAnswers;
      questionPool.forEach(applyCustomAnswers);
      customQuestions = importedQuestions;
      customQuestions.forEach((question) => {
        applyCustomAnswers(question);
        questionPool.push(question);
      });
      categorySelection = importedCategories === null ? null : new Set(importedCategories);
      careerStats = safeStats;
      gameHistory = importedHistory;
      completedDailyDates = importedDailyDates;
      applyTheme(importedTheme);
      $("round-length").value = String(roundLengthValue);
      $("round-time").value = String(roundSecondsValue);
      saveSettings();
      renderCategoryOptions();
      renderCustomQuestionList();
      updateSetupSummary();
      updateBestScore();
      updateCareerStats();
      updateDailyStatus();
      loadExternalQuestions();
      showToast("Cópia de segurança importada com sucesso.");
    } catch (error) {
      showToast(error && error.message ? error.message : "Não foi possível importar a cópia.");
    }
  }

  function getBestPercent() {
    try {
      const saved = localStorage.getItem(BEST_KEY);
      if (saved !== null) return Math.max(0, Math.min(100, Number(saved) || 0));
      const legacyScore = Number(localStorage.getItem(LEGACY_BEST_KEY)) || 0;
      const migrated = Math.round((legacyScore / 700) * 100);
      if (migrated > 0) localStorage.setItem(BEST_KEY, String(migrated));
      return migrated;
    } catch (_) { return 0; }
  }

  function updateBestScore() {
    $("best-score").innerHTML = getBestPercent() + "<small>%</small>";
  }

  function loadCareerStats() {
    try {
      const saved = JSON.parse(localStorage.getItem(CAREER_STATS_KEY) || "null");
      if (saved && typeof saved === "object") {
        careerStats = {
          games: Math.max(0, Number(saved.games) || 0),
          percentTotal: Math.max(0, Number(saved.percentTotal) || 0),
          rareAnswers: Math.max(0, Number(saved.rareAnswers) || 0),
          legendaryAnswers: Math.max(0, Number(saved.legendaryAnswers) || 0),
          customCreated: Math.max(0, Number(saved.customCreated) || 0)
        };
      }
    } catch (_) {}
  }

  function sanitizeGameHistory(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.slice(0, 200).map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const date = typeof entry.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? entry.date : "";
      const mode = entry.mode === "daily" ? "daily" : entry.mode === "practice" ? "practice" : "";
      const rawMaxScore = Math.round(Number(entry.maxScore));
      const rawQuestionCount = Math.round(Number(entry.questionCount));
      if (!date || !mode || !Number.isFinite(rawMaxScore) || rawMaxScore < 100 || rawMaxScore > 1000 ||
          !Number.isFinite(rawQuestionCount) || rawQuestionCount < 1 || rawQuestionCount > 10) return null;
      const maxScore = rawMaxScore;
      const score = Math.max(0, Math.min(maxScore, Math.round(Number(entry.score) || 0)));
      const questionCount = rawQuestionCount;
      const parsedTime = typeof entry.completedAt === "string" ? Date.parse(entry.completedAt) : NaN;
      const completedAt = Number.isFinite(parsedTime) ? new Date(parsedTime).toISOString() : date + "T12:00:00.000Z";
      return {
        date,
        mode,
        score,
        maxScore,
        percent: Math.round((score / maxScore) * 100),
        questionCount,
        rareAnswers: Math.max(0, Math.min(10, Math.round(Number(entry.rareAnswers) || 0))),
        legendaryAnswers: Math.max(0, Math.min(10, Math.round(Number(entry.legendaryAnswers) || 0))),
        completedAt
      };
    }).filter(Boolean).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)).slice(0, 50);
  }

  function loadGameHistory() {
    try {
      gameHistory = sanitizeGameHistory(JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || "[]"));
    } catch (_) {
      gameHistory = [];
    }
  }

  function saveGameHistory() {
    try {
      localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(gameHistory.slice(0, 50)));
    } catch (_) {
      showToast("Não foi possível guardar o histórico. O armazenamento do navegador pode estar cheio.");
    }
  }

  function sanitizeDailyDates(entries) {
    if (!Array.isArray(entries)) return [];
    return Array.from(new Set(entries.filter((date) =>
      typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ))).sort().slice(-4000);
  }

  function loadDailyDates() {
    try {
      completedDailyDates = sanitizeDailyDates(JSON.parse(localStorage.getItem(DAILY_DATES_KEY) || "[]"));
    } catch (_) {
      completedDailyDates = [];
    }
  }

  function saveDailyDates() {
    try {
      localStorage.setItem(DAILY_DATES_KEY, JSON.stringify(completedDailyDates));
    } catch (_) {
      showToast("Não foi possível guardar a sequência diária.");
    }
  }

  function dateKeyOffset(dateKey, offset) {
    const date = new Date(dateKey + "T12:00:00Z");
    if (!Number.isFinite(date.getTime())) return "";
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  function getDailyStreakSummary(dailyDates, todayKey) {
    const dates = sanitizeDailyDates(dailyDates);
    const played = new Set(dates);
    let anchor = played.has(todayKey) ? todayKey : dateKeyOffset(todayKey, -1);
    let current = 0;
    while (anchor && played.has(anchor)) {
      current += 1;
      anchor = dateKeyOffset(anchor, -1);
    }
    let best = 0;
    let running = 0;
    let previous = "";
    dates.forEach((date) => {
      running = previous && dateKeyOffset(previous, 1) === date ? running + 1 : 1;
      best = Math.max(best, running);
      previous = date;
    });
    return { current, best, completed: dates.length };
  }

  function renderCareerExtras() {
    const streak = getDailyStreakSummary(completedDailyDates, getLisbonDateKey());
    $("stat-daily-streak").textContent = streak.current + (streak.current === 1 ? " dia" : " dias");
    $("daily-streak-note").textContent = streak.current
      ? "Melhor sequência: " + streak.best + (streak.best === 1 ? " dia." : " dias.")
      : "Completa o desafio de hoje para começar.";
    $("stat-daily-games").textContent = String(streak.completed);

    const achievements = [
      { icon: "🌊", name: "Primeiro mergulho", detail: "Conclui a tua primeira ronda.", unlocked: careerStats.games >= 1 },
      { icon: "🫧", name: "A fundo", detail: "Alcança pelo menos 80% numa ronda.", unlocked: gameHistory.some((entry) => entry.percent >= 80) },
      { icon: "✨", name: "Resposta lendária", detail: "Consegue uma resposta de 100 pontos.", unlocked: careerStats.legendaryAnswers > 0 },
      { icon: "💎", name: "Caçador de raridades", detail: "Consegue cinco respostas de 80+ pontos.", unlocked: careerStats.rareAnswers >= 5 },
      { icon: "🎯", name: "Perfeccionista", detail: "Termina uma ronda com 100%.", unlocked: getBestPercent() === 100 },
      { icon: "📆", name: "Rotina abissal", detail: "Completa o desafio diário três dias seguidos.", unlocked: streak.best >= 3 },
      { icon: "🧭", name: "Veterano", detail: "Conclui dez rondas.", unlocked: careerStats.games >= 10 },
      { icon: "🛠️", name: "Criador", detail: "Cria a tua primeira pergunta personalizada.", unlocked: careerStats.customCreated > 0 }
    ];
    const unlockedCount = achievements.filter((item) => item.unlocked).length;
    $("achievement-progress").textContent = unlockedCount + "/" + achievements.length + " DESBLOQUEADAS";
    const achievementList = $("achievement-list");
    achievementList.replaceChildren();
    achievements.forEach((item) => {
      const card = document.createElement("article");
      card.className = "achievement-card" + (item.unlocked ? " unlocked" : "");
      const icon = document.createElement("span");
      icon.className = "achievement-icon";
      icon.textContent = item.unlocked ? item.icon : "◇";
      const copy = document.createElement("div");
      copy.className = "achievement-copy";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const detail = document.createElement("small");
      detail.textContent = item.detail;
      copy.append(name, detail);
      const status = document.createElement("span");
      status.className = "achievement-status";
      status.textContent = item.unlocked ? "DESBLOQUEADA" : "BLOQUEADA";
      card.append(icon, copy, status);
      achievementList.append(card);
    });

    const historyList = $("game-history");
    historyList.replaceChildren();
    if (!gameHistory.length) {
      const empty = document.createElement("p");
      empty.className = "empty-history";
      empty.textContent = "As tuas rondas concluídas vão aparecer aqui.";
      historyList.append(empty);
      return;
    }
    gameHistory.slice(0, 5).forEach((entry) => {
      const row = document.createElement("article");
      row.className = "history-item";
      const details = document.createElement("div");
      details.className = "history-details";
      const mode = document.createElement("strong");
      mode.textContent = entry.mode === "daily" ? "DESAFIO DIÁRIO" : "TREINO LIVRE";
      const date = document.createElement("small");
      date.textContent = new Date(entry.completedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
      details.append(mode, date);
      const score = document.createElement("div");
      score.className = "history-score";
      const percent = document.createElement("strong");
      percent.textContent = entry.percent + "%";
      const points = document.createElement("small");
      points.textContent = entry.score + " / " + entry.maxScore + " pts";
      score.append(percent, points);
      const meter = document.createElement("div");
      meter.className = "history-meter";
      const fill = document.createElement("span");
      fill.style.width = entry.percent + "%";
      meter.append(fill);
      row.append(details, score, meter);
      historyList.append(row);
    });
  }

  function saveCareerStats() {
    try { localStorage.setItem(CAREER_STATS_KEY, JSON.stringify(careerStats)); } catch (_) {}
  }

  function updateCareerStats() {
    $("stat-games").textContent = String(careerStats.games);
    $("stat-average").innerHTML = (careerStats.games ? Math.round(careerStats.percentTotal / careerStats.games) : 0) + "<small>%</small>";
    $("stat-best").innerHTML = getBestPercent() + "<small>%</small>";
    $("stat-rare").textContent = String(careerStats.rareAnswers);
    renderCareerExtras();
  }

  function recordCareerGame(percent) {
    careerStats.games += 1;
    careerStats.percentTotal += percent;
    const rareAnswers = currentResults.filter((item) => item.points >= 80).length;
    const legendaryAnswers = currentResults.filter((item) => item.points === 100).length;
    careerStats.rareAnswers += rareAnswers;
    careerStats.legendaryAnswers += legendaryAnswers;
    if (currentMode === "daily" && dailyDateKey && !completedDailyDates.includes(dailyDateKey)) {
      completedDailyDates.push(dailyDateKey);
      completedDailyDates = sanitizeDailyDates(completedDailyDates);
      saveDailyDates();
    }
    gameHistory.unshift({
      date: currentMode === "daily" ? dailyDateKey : getLisbonDateKey(),
      mode: currentMode,
      score: totalScore,
      maxScore: maxRoundScore,
      percent,
      questionCount: activeQuestions.length,
      rareAnswers,
      legendaryAnswers,
      completedAt: new Date().toISOString()
    });
    gameHistory = gameHistory.slice(0, 50);
    saveCareerStats();
    saveGameHistory();
    updateCareerStats();
  }

  function readDailyBest(dateKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(DAILY_BEST_KEY) || "null");
      return saved && saved.date === (dateKey || getLisbonDateKey()) ? saved : null;
    } catch (_) { return null; }
  }

  function updateDailyStatus() {
    const status = $("daily-status");
    const record = readDailyBest();
    if (record) {
      status.textContent = "Desafio de hoje concluído: " + record.bestScore + "/700 pontos · " + record.plays +
        (record.plays === 1 ? " tentativa" : " tentativas") + ". Podes voltar a jogar para melhorar.";
    } else {
      status.textContent = "Novo desafio todos os dias à meia-noite, hora de Portugal. As sete perguntas são iguais durante todo o dia.";
    }
  }

  function saveDailyResult(percent) {
    const previous = readDailyBest(dailyDateKey);
    const score = totalScore;
    const record = {
      date: dailyDateKey,
      bestScore: previous ? Math.max(previous.bestScore, score) : score,
      bestPercent: previous ? Math.max(previous.bestPercent, percent) : percent,
      plays: previous ? previous.plays + 1 : 1
    };
    try { localStorage.setItem(DAILY_BEST_KEY, JSON.stringify(record)); } catch (_) {}
    updateDailyStatus();
    return !previous || score > previous.bestScore;
  }


  function startGame() {
    window.clearInterval(timerId);
    window.clearInterval(previewId);
    currentMode = "practice";
    roundLength = Number($("round-length").value) || DEFAULT_ROUND_LENGTH;
    roundSeconds = Number($("round-time").value) || DEFAULT_ROUND_SECONDS;
    const eligibleQuestions = getEligibleQuestions();
    if (eligibleQuestions.length === 0) {
      showToast("Seleciona pelo menos um tema.");
      return;
    }
    activeQuestions = shuffle(eligibleQuestions).slice(0, roundLength);
    if (activeQuestions.length < roundLength) {
      showToast("Esta ronda terá " + activeQuestions.length + " perguntas, uma por cada tema selecionado.");
    }
    maxRoundScore = activeQuestions.length * 100;
    currentIndex = 0;
    currentResults = [];
    totalScore = 0;
    locked = false;
    $("live-score").textContent = "0";
    $("question-total").textContent = String(activeQuestions.length).padStart(2, "0");
    $("question-total-label").textContent = String(activeQuestions.length).padStart(2, "0");
    $("mode-pill").hidden = true;
    showScreen("game");
    renderQuestion();
  }

  function startDailyGame() {
    window.clearInterval(timerId);
    window.clearInterval(previewId);
    currentMode = "daily";
    dailyDateKey = getLisbonDateKey();
    roundLength = 7;
    roundSeconds = 25;
    activeQuestions = seededShuffle(BUILTIN_QUESTIONS, "grillon-daily-v1-" + dailyDateKey).slice(0, 7);
    maxRoundScore = activeQuestions.length * 100;
    currentIndex = 0;
    currentResults = [];
    totalScore = 0;
    locked = false;
    $("live-score").textContent = "0";
    $("question-total").textContent = "07";
    $("question-total-label").textContent = "07";
    $("mode-pill").hidden = false;
    showScreen("game");
    renderQuestion();
  }

  function renderQuestion() {
    window.clearInterval(timerId);
    window.clearInterval(previewId);
    currentQuestion = activeQuestions[currentIndex];
    locked = false;
    remaining = roundSeconds;
    $("question-number").textContent = String(currentIndex + 1).padStart(2, "0");
    $("question-index").textContent = String(currentIndex + 1).padStart(2, "0");
    $("progress-fill").style.width = (((currentIndex + 1) / activeQuestions.length) * 100) + "%";
    $("question-category").textContent = currentQuestion.category;
    $("mode-pill").hidden = currentMode !== "daily";
    $("mode-pill").textContent = currentMode === "daily" ? "DESAFIO DO DIA" : "TREINO LIVRE";
    $("question-title").textContent = currentQuestion.title;
    $("question-subtitle").textContent = currentQuestion.subtitle;
    $("time-left").textContent = String(remaining);
    $("time-left").classList.remove("urgent");
    $("timer-total").textContent = roundSeconds + "s";
    $("timer-fill").style.width = "100%";
    $("timer-fill").classList.remove("warning");
    $("answer-input").value = "";
    $("answer-input").disabled = true;
    $("submit-button").disabled = true;
    $("skip-button").hidden = true;
    $("add-answer-button").hidden = true;
    $("custom-answer-panel").hidden = true;
    $("continue-button").hidden = true;
    $("feedback").hidden = true;
    $("feedback").className = "feedback";
    $("countdown-overlay").hidden = false;
    let previewRemaining = PREVIEW_SECONDS;
    $("countdown-number").textContent = String(previewRemaining);
    previewId = window.setInterval(() => {
      previewRemaining -= 1;
      if (previewRemaining <= 0) {
        window.clearInterval(previewId);
        previewId = null;
        $("countdown-overlay").hidden = true;
        $("answer-input").disabled = false;
        $("submit-button").disabled = false;
        $("skip-button").hidden = false;
        $("answer-input").focus({ preventScroll: true });
        timerId = window.setInterval(tick, 1000);
      } else {
        $("countdown-number").textContent = String(previewRemaining);
      }
    }, 1000);
  }

  function tick() {
    if (locked) return;
    remaining -= 1;
    $("time-left").textContent = String(Math.max(remaining, 0));
    $("time-left").classList.toggle("urgent", remaining <= 7);
    $("timer-fill").style.width = Math.max(0, (remaining / roundSeconds) * 100) + "%";
    if (remaining <= 7) $("timer-fill").classList.add("warning");
    if (remaining <= 0) {
      window.clearInterval(timerId);
      finishQuestion(null, "tempo");
    }
  }

  function findAnswer(value) {
    const key = normalise(value);
    if (!key) return null;
    return currentQuestion.answers.find((answer) =>
      answer.aliases.some((alias) => normalise(alias) === key)
    ) || null;
  }

  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > 2 || a.length > 32 || b.length > 32) return 99;
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const previous = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = previous;
      }
    }
    return row[b.length];
  }

  function findClosestAnswer(value) {
    const key = normalise(value);
    if (key.length < 4) return null;
    const threshold = key.length >= 10 ? 2 : 1;
    let best = null;
    let bestDistance = threshold + 1;
    let ambiguous = false;
    currentQuestion.answers.forEach((answer) => {
      answer.aliases.forEach((alias) => {
        const candidate = normalise(alias);
        if (candidate === key || Math.abs(candidate.length - key.length) > threshold) return;
        const distance = editDistance(key, candidate);
        if (distance < bestDistance) {
          best = answer;
          bestDistance = distance;
          ambiguous = false;
        } else if (distance === bestDistance && best && best.name !== answer.name) {
          ambiguous = true;
        }
      });
    });
    return ambiguous ? null : best;
  }

  function showFeedback(message, type) {
    const feedback = $("feedback");
    feedback.textContent = message;
    feedback.className = "feedback " + type;
    feedback.hidden = false;
  }

  function submitAnswer(event) {
    if (event) event.preventDefault();
    if (locked || $("answer-input").disabled) return;
    const value = $("answer-input").value.trim();
    if (!value) {
      showFeedback("Escreve uma resposta antes de confirmar.", "error");
      $("answer-input").focus();
      return;
    }
    const answer = findAnswer(value);
    if (!answer) {
      const closest = findClosestAnswer(value);
      const suggestion = closest ? " Talvez quisesses escrever " + closest.name + "?" : "";
      showFeedback("Ainda não reconhecemos essa resposta. Experimenta outra — o tempo continua a contar." + suggestion, "error");
      $("add-answer-button").hidden = currentMode === "daily";
      $("answer-input").select();
      return;
    }
    finishQuestion(answer, "valid");
  }

  function saveCustomAnswer() {
    if (locked || currentMode === "daily") return;
    const name = $("answer-input").value.trim().slice(0, 70);
    const points = Number($("custom-answer-points").value);
    if (name.length < 1 || !POINTS.includes(points)) {
      showFeedback("Escreve uma resposta válida e escolhe um nível de raridade.", "error");
      return;
    }
    const existing = findAnswer(name);
    if (existing) {
      $("custom-answer-panel").hidden = true;
      $("add-answer-button").hidden = true;
      finishQuestion(existing, "valid");
      return;
    }
    const answer = { name: name, points: points, aliases: [name], custom: true };
    const nextBank = { ...customAnswerBank };
    const nextEntries = Array.isArray(nextBank[currentQuestion.id]) ? nextBank[currentQuestion.id].slice() : [];
    nextEntries.push({ name: name, points: points, aliases: [name] });
    nextBank[currentQuestion.id] = nextEntries;
    try {
      localStorage.setItem(CUSTOM_ANSWERS_KEY, JSON.stringify(nextBank));
    } catch (_) {
      showFeedback("Não foi possível guardar a resposta no navegador. Liberta espaço e tenta novamente.", "error");
      return;
    }
    customAnswerBank = nextBank;
    currentQuestion.answers.push(answer);
    $("custom-answer-panel").hidden = true;
    $("add-answer-button").hidden = true;
    finishQuestion(answer, "custom");
  }

  function finishQuestion(answer, reason) {
    if (locked) return;
    locked = true;
    window.clearInterval(timerId);
    window.clearInterval(previewId);
    $("countdown-overlay").hidden = true;
    const points = answer ? answer.points : 0;
    totalScore += points;
    currentResults.push({
      question: currentQuestion,
      answer: answer ? answer.name : null,
      points: points,
      tier: answer ? tierName(points) : "Sem pontos",
      custom: Boolean(answer && answer.custom),
      reason: reason
    });
    $("live-score").textContent = String(totalScore);
    $("answer-input").disabled = true;
    $("submit-button").disabled = true;
    $("skip-button").hidden = true;
    $("add-answer-button").hidden = true;
    $("custom-answer-panel").hidden = true;
    $("continue-button").hidden = false;
    if (answer && reason === "custom") {
      showFeedback("Resposta guardada no teu banco pessoal: " + answer.name + " · " + tierName(points) + " · +" + points + " pontos.", "success");
    } else if (answer) {
      showFeedback("Resposta aceite: " + answer.name + " · " + tierName(points) + " · +" + points + " pontos.", "success");
    } else if (reason === "tempo") {
      showFeedback("O tempo terminou. Esta pergunta valeu 0 pontos.", "neutral");
    } else {
      showFeedback("Pergunta passada. Ficaste com 0 pontos nesta ronda.", "neutral");
    }
    $("continue-button").focus({ preventScroll: true });
  }

  function continueGame() {
    if (!locked) return;
    if (currentIndex + 1 >= activeQuestions.length) {
      finishGame();
      return;
    }
    currentIndex += 1;
    renderQuestion();
  }

  function finishGame() {
    window.clearInterval(timerId);
    window.clearInterval(previewId);
    const percent = maxRoundScore > 0 ? Math.round((totalScore / maxRoundScore) * 100) : 0;
    const previousBest = getBestPercent();
    const newRecord = percent > previousBest;
    if (newRecord) {
      try { localStorage.setItem(BEST_KEY, String(percent)); } catch (_) {}
    }
    updateBestScore();
    recordCareerGame(percent);
    const newDailyRecord = currentMode === "daily" ? saveDailyResult(percent) : false;
    renderResults(newRecord, percent, newDailyRecord);
    showScreen("results");
  }

  function resultMessage(percent) {
    if (percent === 100) return ["Lenda do abismo.", "Pontuação máxima. Respondeste sempre com opções do nível mais raro."];
    if (percent >= 80) return ["Mergulho impressionante.", "Encontraste respostas invulgares e aproveitaste muito bem a ronda."];
    if (percent >= 60) return ["Boa exploração.", "Já sabes fugir ao óbvio. Ainda há mais profundidade para descobrir."];
    if (percent >= 35) return ["Bom começo.", "Tens algumas respostas interessantes. Na próxima ronda, arrisca um pouco mais."];
    if (percent > 0) return ["Ainda à superfície.", "O segredo está em pensar numa resposta válida menos previsível."];
    return ["Mergulho em branco.", "A próxima ronda é uma nova oportunidade para encontrar respostas raras."];
  }

  function renderResults(newRecord, percent, newDailyRecord) {
    $("final-score").textContent = String(totalScore);
    $("final-max-score").textContent = String(maxRoundScore);
    $("final-percent").textContent = percent + "% DA PONTUAÇÃO MÁXIMA";
    $("final-depth").textContent = (totalScore * 10).toLocaleString("pt-PT");
    $("depth-max-label").textContent = (maxRoundScore * 10).toLocaleString("pt-PT") + " M";
    $("depth-meter-fill").style.width = percent + "%";
    $("results-mode-label").textContent = currentMode === "daily" ? "DESAFIO DO DIA" : "RESULTADO DO TREINO";
    $("review-count").textContent = String(activeQuestions.length).padStart(2, "0") + " PERGUNTAS";
    const message = resultMessage(percent);
    $("result-title").textContent = message[0];
    $("result-description").textContent = message[1] + (newRecord ? " Novo recorde pessoal!" : "") +
      (currentMode === "daily" ? (newDailyRecord ? " Novo melhor resultado diário!" : " Podes tentar melhorar o teu resultado diário.") : "");
    $("result-date").textContent = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

    const list = $("review-list");
    list.replaceChildren();
    currentResults.forEach((item, index) => {
      const row = document.createElement("article");
      row.className = "review-row";

      const number = document.createElement("span");
      number.className = "review-index";
      number.textContent = String(index + 1).padStart(2, "0");

      const content = document.createElement("div");
      content.className = "review-content";
      const question = document.createElement("div");
      question.className = "review-question";
      question.textContent = item.question.title;
      const answer = document.createElement("div");
      answer.className = "review-answer";
      if (item.answer) {
        answer.textContent = "Resposta: " + item.answer + " · " + item.tier + (item.custom ? " · Adicionada por ti" : "");
      } else {
        answer.textContent = item.reason === "tempo" ? "Tempo esgotado · Sem resposta válida" : "Pergunta passada · Sem resposta";
      }
      content.append(question, answer);

      const reveal = document.createElement("button");
      reveal.type = "button";
      reveal.className = "answer-sheet-toggle";
      reveal.textContent = "VER RESPOSTAS ACEITES (" + item.question.answers.length + ")";
      reveal.setAttribute("aria-expanded", "false");

      const answerSheet = document.createElement("div");
      answerSheet.className = "answer-sheet";
      answerSheet.hidden = true;
      const sortedAnswers = item.question.answers.slice().sort((a, b) => a.points - b.points || a.name.localeCompare(b.name, "pt-PT"));
      const visibleAnswers = sortedAnswers;
      visibleAnswers.forEach((entry) => {
        const answerItem = document.createElement("span");
        answerItem.className = "answer-sheet-item" + (item.answer && normalise(item.answer) === normalise(entry.name) ? " chosen" : "");
        answerItem.textContent = entry.name + " · " + entry.points;
        answerSheet.append(answerItem);
      });
      reveal.addEventListener("click", () => {
        answerSheet.hidden = !answerSheet.hidden;
        reveal.setAttribute("aria-expanded", String(!answerSheet.hidden));
        reveal.textContent = (answerSheet.hidden ? "VER" : "ESCONDER") + " RESPOSTAS ACEITES (" + item.question.answers.length + ")";
      });
      content.append(reveal, answerSheet);

      const score = document.createElement("div");
      score.className = "review-score" + (item.points === 0 ? " zero" : "");
      const scoreValue = document.createElement("strong");
      scoreValue.textContent = "+" + item.points;
      const scoreTier = document.createElement("span");
      scoreTier.textContent = item.tier;
      score.append(scoreValue, scoreTier);

      row.append(number, content, score);
      list.append(row);
    });
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyResult() {
    const percent = maxRoundScore ? Math.round((totalScore / maxRoundScore) * 100) : 0;
    const label = currentMode === "daily" ? "Desafio diário" : "Treino livre";
    const message = "🌊 GRILLON\n" + label + "\nPontuação: " + totalScore + "/" + maxRoundScore +
      " (" + percent + "%)\nProfundidade: " + (totalScore * 10).toLocaleString("pt-PT") +
      " m\nPerguntas: " + activeQuestions.length + "\nProjeto: https://github.com/GafiPro/Grillon";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const field = document.createElement("textarea");
        field.value = message;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Não foi possível copiar");
      }
      showToast("Resultado copiado!");
    } catch (_) {
      showToast("Não foi possível copiar neste navegador.");
    }
  }

  function goHome() {
    window.clearInterval(timerId);
    window.clearInterval(previewId);
    showScreen("home");
    updateBestScore();
    updateCareerStats();
    updateDailyStatus();
  }

  $("start-button").addEventListener("click", startGame);
  $("daily-start-button").addEventListener("click", startDailyGame);
  $("round-length").addEventListener("change", () => { updateSetupSummary(); saveSettings(); });
  $("round-time").addEventListener("change", () => { updateSetupSummary(); saveSettings(); });
  $("theme-select").addEventListener("change", () => {
    applyTheme($("theme-select").value);
    saveSettings();
  });
  $("toggle-categories").addEventListener("click", () => {
    const container = $("category-options");
    container.hidden = !container.hidden;
    $("toggle-categories").setAttribute("aria-expanded", String(!container.hidden));
  });
  $("select-all-categories").addEventListener("click", () => {
    categorySelection = null;
    saveSettings();
    renderCategoryOptions();
    updateSetupSummary();
  });
  $("custom-question-form").addEventListener("submit", saveQuestionFromEditor);
  $("editor-cancel-button").addEventListener("click", resetQuestionEditor);
  $("export-data-button").addEventListener("click", exportBackup);
  $("import-data-button").addEventListener("click", () => $("import-data-file").click());
  $("import-data-file").addEventListener("change", importBackup);
  $("answer-form").addEventListener("submit", submitAnswer);
  $("add-answer-button").addEventListener("click", () => {
    $("custom-answer-panel").hidden = false;
    $("custom-answer-points").focus();
  });
  $("save-custom-answer").addEventListener("click", saveCustomAnswer);
  $("cancel-custom-answer").addEventListener("click", () => { $("custom-answer-panel").hidden = true; });
  $("copy-result-button").addEventListener("click", copyResult);
  $("skip-button").addEventListener("click", () => finishQuestion(null, "skip"));
  $("continue-button").addEventListener("click", continueGame);
  $("play-again-button").addEventListener("click", () => currentMode === "daily" ? startDailyGame() : startGame());
  $("home-button").addEventListener("click", goHome);
  $("quit-button").addEventListener("click", () => {
    if (window.confirm("Queres mesmo sair desta ronda? O progresso atual será perdido.")) goHome();
  });
  $("brand-home").addEventListener("click", (event) => {
    event.preventDefault();
    if (!screens.game.hidden && !locked) {
      if (window.confirm("Queres sair do jogo atual?")) goHome();
    } else {
      goHome();
    }
  });

  loadSettings();
  loadCustomAnswers();
  loadCustomQuestions();
  loadCareerStats();
  loadGameHistory();
  loadDailyDates();
  renderCategoryOptions();
  renderCustomQuestionList();
  updateSetupSummary();
  updateBestScore();
  updateCareerStats();
  updateDailyStatus();
  loadExternalQuestions();
})();