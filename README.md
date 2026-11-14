# Grillon

Um quiz de respostas abertas em que as respostas menos óbvias valem mais pontos.

## Como jogar

1. Abre \`index.html\` num navegador ou publica o repositório com GitHub Pages.
2. Antes da ronda, escolhe 5, 7 ou 10 perguntas e 15, 25 ou 40 segundos por pergunta.
3. Abre **Escolher temas** para ativar apenas as categorias que queres. O jogo não repete categorias na mesma ronda; se escolheres menos temas do que perguntas, a ronda ajusta-se ao número de temas.
4. Escreve uma resposta válida. Respostas mais raras valem mais pontos.
5. No fim, consulta as respostas, a pontuação e a profundidade. O recorde é guardado como percentagem para comparar rondas de tamanhos diferentes. As tuas preferências de perguntas, tempo e temas também ficam guardadas neste navegador.

## Pontuação

Cada pergunta vale até 100 pontos. Os seis níveis são 5, 15, 30, 55, 80 e 100 pontos. A pontuação máxima da ronda adapta-se ao número de perguntas.

Nas categorias incluídas no projeto, os níveis de raridade são definidos manualmente. Nas categorias externas, são estimados a partir de indicadores dos dados: população nos países e taxa de captura nos Pokémon. Estes indicadores não correspondem a estatísticas reais das respostas dos jogadores.

## Fontes de perguntas

- **Perguntas incluídas:** natureza, comida, clubes e futebolistas, gaming, cinema, motores, personagens, capitais, música, séries, desporto e tecnologia.
- **REST Countries:** lista de países, nomes alternativos e população.
- **PokéAPI:** espécies Pokémon, nomes localizados e taxas de captura.

As APIs são públicas e não exigem uma chave. Os dados são guardados no navegador durante 24 horas para reduzir pedidos repetidos. Se uma API falhar, as categorias incluídas continuam disponíveis.

O banco de respostas não é uma lista universal de todas as respostas possíveis. A validação ignora acentos e pontuação, aceita algumas variantes de escrita e sugere correções simples, mas uma resposta válida que não esteja no banco pode continuar a ser rejeitada.

## Recorde e privacidade

O recorde fica guardado no \`localStorage\` do navegador. Não existe conta, servidor próprio nem envio de respostas pessoais. Limpar os dados do site no navegador também apaga o recorde e a cache das APIs.

## Tecnologias

HTML, CSS e JavaScript sem dependências de build, sem chaves de API e sem backend.

## Executar localmente

Basta abrir \`index.html\` no navegador. Para GitHub Pages, seleciona a branch \`main\` e a pasta raiz nas definições de Pages.
