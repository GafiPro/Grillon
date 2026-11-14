# Grillon

Um quiz de respostas abertas em que as respostas menos óbvias valem mais pontos. Feito para jogar no navegador, sem conta e sem backend.

## Modos de jogo

### Desafio do dia

- Sete perguntas fixas por dia, iguais para qualquer pessoa que abra a versão atual do jogo nesse dia.
- A seleção é determinística e muda à meia-noite em Portugal continental.
- Três segundos para ler cada pergunta antes de começar o temporizador.
- 25 segundos para responder a cada pergunta.
- Podes repetir o desafio; fica guardado o teu melhor resultado desse dia.

O desafio diário usa as 26 categorias incluídas no projeto. Não depende de APIs externas, para que a seleção de perguntas seja estável durante o dia.

### Treino livre

- Escolhe 5, 7 ou 10 perguntas.
- Escolhe 15, 25 ou 40 segundos por pergunta.
- Ativa apenas as categorias que queres jogar.
- O jogo escolhe uma pergunta por categoria, sem repetir temas na mesma ronda.

Se selecionares menos categorias do que perguntas, a ronda ajusta-se ao número de categorias disponíveis.

## Pontuação

Cada pergunta vale até 100 pontos, distribuídos por seis níveis: 5, 15, 30, 55, 80 e 100 pontos. A profundidade equivale à pontuação multiplicada por dez metros. O desafio diário chega aos 7 000 metros.

Nas categorias incluídas no projeto, os níveis são definidos editorialmente. Nas categorias externas, são estimados a partir de indicadores dos dados: população nos países e taxa de captura nos Pokémon. Não representam estatísticas de respostas de jogadores.

O recorde pessoal é guardado como percentagem, para permitir comparar rondas de tamanhos diferentes.

## Categorias incluídas

Natureza, fruta, clubes de futebol, futebolistas, videojogos, cinema, marcas de automóveis, personagens fictícias, capitais, artistas musicais, séries, modalidades desportivas, marcas de tecnologia, criaturas de Minecraft, carros do Rocket League, consolas, linguagens de programação, marcas de telemóveis, instrumentos musicais, serviços de streaming, jogos de tabuleiro, equipas de Fórmula 1, pratos de comida, navegadores de Internet, criaturas mitológicas e cidades.

## APIs externas

- **REST Countries:** lista de países, nomes alternativos e população.
- **PokéAPI:** espécies Pokémon, nomes localizados e taxas de captura.

As APIs são públicas e não exigem uma chave. Os dados são guardados no navegador durante 24 horas para reduzir pedidos repetidos. Se uma API falhar, o jogo continua com as categorias incluídas.

## Respostas pessoais

Quando uma resposta válida não é reconhecida, podes adicioná-la ao teu banco pessoal, confirmar que pertence à categoria e escolher o nível de raridade. A resposta fica guardada nesse navegador e passa a ser aceite nas rondas seguintes.

Depois de cada ronda, podes consultar a lista de respostas aceites de cada pergunta e ver a pontuação de cada uma.

O banco não é uma lista universal de todas as respostas possíveis. A normalização ignora acentos, artigos iniciais e pontuação comum, e sugere correções simples. Respostas ambíguas ou que não estejam no banco continuam a precisar de confirmação manual.

## Estatísticas e privacidade

O Grillon guarda no localStorage do navegador:
- recorde pessoal e média de pontuação;
- número de rondas e respostas com 80 ou mais pontos;
- melhor resultado do desafio diário;
- preferências de jogo e respostas pessoais adicionadas;
- cache das APIs.

Não existe conta, servidor próprio, leaderboard online ou envio das respostas. Limpar os dados do site no navegador remove estes dados.

## Executar localmente

Basta abrir index.html num navegador moderno. Para GitHub Pages, seleciona a branch main e a pasta raiz nas definições de Pages.

## Validação

O GitHub Actions executa uma verificação de sintaxe JavaScript e valida a estrutura e os elementos principais do projeto em cada push para main e em pull requests.
