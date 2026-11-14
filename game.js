"use strict";

(function () {
  const POINTS = [5, 15, 30, 55, 80, 100];
  const TIER_NAMES = ["Comum", "Conhecida", "Incomum", "Rara", "Abissal", "Lendária"];
  const DEFAULT_ROUND_LENGTH = 7;
  const DEFAULT_ROUND_SECONDS = 25;
  const BEST_KEY = "grillon.best.percent.v2";
  const LEGACY_BEST_KEY = "grillon.best.v1";
  const SETTINGS_KEY = "grillon.settings.v1";
  const CACHE_COUNTRIES = "grillon.countries.v1";
  const CACHE_POKEMON = "grillon.pokemon.v1";

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
      ["Chiang Mai", 80], ["Ushuaia", 80], ["Samarkand", 80], ["Palau", 100], ["Gjirokastër", 100]
    ])
  ];

  let questionPool = BUILTIN_QUESTIONS.slice();
  let activeQuestions = [];
  let currentIndex = 0;
  let currentQuestion = null;
  let currentResults = [];
  let totalScore = 0;
  let remaining = DEFAULT_ROUND_SECONDS;
  let roundLength = DEFAULT_ROUND_LENGTH;
  let roundSeconds = DEFAULT_ROUND_SECONDS;
  let maxRoundScore = DEFAULT_ROUND_LENGTH * 100;
  let categorySelection = null;
  let timerId = null;
  let locked = false;
  let toastTimer = null;

  function showScreen(name) {
    Object.keys(screens).forEach((key) => { screens[key].hidden = key !== name; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalise(value) {
    const words = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g) || [];
    const articles = new Set(["the", "a", "an", "o", "os", "as", "um", "uma", "uns", "umas", "el", "la", "los", "las"]);
    if (words.length > 1 && articles.has(words[0])) words.shift();
    return words.join("");
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
      const selected = shuffle(ids).slice(0, 36);
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
        questionPool = questionPool.filter((item) => item.id !== question.id).concat(question);
        return { ok: true, name: "REST Countries" };
      }).catch(() => ({ ok: false, name: "REST Countries" })),
      loadPokemon().then((question) => {
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
      const suffix = question.id === "pokemon" ? " · Pokémon" : question.id === "games" ? " · Jogos" : question.id === "countries" ? " · Países" : question.id === "clubs" ? " · Clubes" : question.id === "footballers" ? " · Jogadores" : "";
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

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      if ([5, 7, 10].includes(Number(saved.roundLength))) $("round-length").value = String(saved.roundLength);
      if ([15, 25, 40].includes(Number(saved.roundSeconds))) $("round-time").value = String(saved.roundSeconds);
      if (Array.isArray(saved.categories)) categorySelection = new Set(saved.categories.filter((id) => typeof id === "string"));
    } catch (_) {}
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        roundLength: Number($("round-length").value) || DEFAULT_ROUND_LENGTH,
        roundSeconds: Number($("round-time").value) || DEFAULT_ROUND_SECONDS,
        categories: categorySelection === null ? null : Array.from(categorySelection)
      }));
    } catch (_) {}
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

  function startGame() {
    window.clearInterval(timerId);
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
    showScreen("game");
    renderQuestion();
  }

  function renderQuestion() {
    window.clearInterval(timerId);
    currentQuestion = activeQuestions[currentIndex];
    locked = false;
    remaining = roundSeconds;
    $("question-number").textContent = String(currentIndex + 1).padStart(2, "0");
    $("question-index").textContent = String(currentIndex + 1).padStart(2, "0");
    $("progress-fill").style.width = (((currentIndex + 1) / activeQuestions.length) * 100) + "%";
    $("question-category").textContent = currentQuestion.category;
    $("question-title").textContent = currentQuestion.title;
    $("question-subtitle").textContent = currentQuestion.subtitle;
    $("time-left").textContent = String(remaining);
    $("timer-total").textContent = roundSeconds + "s";
    $("timer-fill").style.width = "100%";
    $("timer-fill").classList.remove("warning");
    $("answer-input").value = "";
    $("answer-input").disabled = false;
    $("submit-button").disabled = false;
    $("skip-button").hidden = false;
    $("continue-button").hidden = true;
    $("feedback").hidden = true;
    $("feedback").className = "feedback";
    $("answer-input").focus({ preventScroll: true });
    timerId = window.setInterval(tick, 1000);
  }

  function tick() {
    if (locked) return;
    remaining -= 1;
    $("time-left").textContent = String(Math.max(remaining, 0));
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
    if (locked) return;
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
      $("answer-input").select();
      return;
    }
    finishQuestion(answer, "valid");
  }

  function finishQuestion(answer, reason) {
    if (locked) return;
    locked = true;
    window.clearInterval(timerId);
    const points = answer ? answer.points : 0;
    totalScore += points;
    currentResults.push({
      question: currentQuestion,
      answer: answer ? answer.name : null,
      points: points,
      tier: answer ? tierName(points) : "Sem pontos",
      reason: reason
    });
    $("live-score").textContent = String(totalScore);
    $("answer-input").disabled = true;
    $("submit-button").disabled = true;
    $("skip-button").hidden = true;
    $("continue-button").hidden = false;
    if (answer) {
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
    const percent = maxRoundScore > 0 ? Math.round((totalScore / maxRoundScore) * 100) : 0;
    const previousBest = getBestPercent();
    const newRecord = percent > previousBest;
    if (newRecord) {
      try { localStorage.setItem(BEST_KEY, String(percent)); } catch (_) {}
    }
    updateBestScore();
    renderResults(newRecord, percent);
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

  function renderResults(newRecord, percent) {
    $("final-score").textContent = String(totalScore);
    $("final-max-score").textContent = String(maxRoundScore);
    $("final-depth").textContent = (percent * 70).toLocaleString("pt-PT");
    $("depth-meter-fill").style.width = percent + "%";
    $("review-count").textContent = String(activeQuestions.length).padStart(2, "0") + " PERGUNTAS";
    const message = resultMessage(percent);
    $("result-title").textContent = message[0];
    $("result-description").textContent = message[1] + (newRecord ? " Novo recorde pessoal!" : "");
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
        answer.textContent = "Resposta: " + item.answer + " · " + item.tier;
      } else {
        answer.textContent = item.reason === "tempo" ? "Tempo esgotado · Sem resposta válida" : "Pergunta passada · Sem resposta";
      }
      content.append(question, answer);

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

  function goHome() {
    window.clearInterval(timerId);
    showScreen("home");
    updateBestScore();
  }

  $("start-button").addEventListener("click", startGame);
  $("round-length").addEventListener("change", () => { updateSetupSummary(); saveSettings(); });
  $("round-time").addEventListener("change", () => { updateSetupSummary(); saveSettings(); });
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
  $("answer-form").addEventListener("submit", submitAnswer);
  $("skip-button").addEventListener("click", () => finishQuestion(null, "skip"));
  $("continue-button").addEventListener("click", continueGame);
  $("play-again-button").addEventListener("click", startGame);
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
  renderCategoryOptions();
  updateSetupSummary();
  updateBestScore();
  loadExternalQuestions();
})();