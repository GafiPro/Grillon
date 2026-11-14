# Grillon

Um quiz de respostas abertas em que a raridade da resposta determina a pontuação.

## Como jogar

1. Abre `index.html` num navegador ou publica o repositório com GitHub Pages.
2. Cada ronda tem 7 perguntas e 25 segundos por pergunta.
3. Escreve uma resposta válida. Respostas mais raras valem mais pontos.
4. Cada ronda pode chegar aos 700 pontos. O recorde pessoal fica guardado no armazenamento local do navegador.

## Fontes de perguntas

- **Perguntas incluídas:** categorias de animais, comida, futebol, gaming, cinema, motores e personagens. As respostas e pontuações são definidas no próprio projeto.
- **REST Countries:** fornece a lista de países, nomes alternativos e população. A raridade é estimada por escalões de população.
- **PokéAPI:** fornece espécies Pokémon e taxas de captura. A raridade é estimada por escalões de taxa de captura.

As estimativas das APIs são apenas critérios de jogo: não representam a frequência com que os jogadores respondem com cada opção. O banco de respostas também é uma seleção limitada, pelo que uma resposta válida que não esteja incluída pode não ser aceite.

## Tecnologias

HTML, CSS e JavaScript sem dependências de build nem chaves de API. Os dados de REST Countries e PokéAPI são guardados localmente durante 24 horas para reduzir pedidos repetidos.

## Executar localmente

Basta abrir `index.html` no navegador. Para GitHub Pages, seleciona a branch `main` e a pasta raiz nas definições de Pages.
