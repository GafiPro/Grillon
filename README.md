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

## Editor de perguntas e cópias de segurança

Na secção **Oficina do Grillon**, podes criar até 100 categorias pessoais, editar ou apagar cada uma e definir até 100 respostas por pergunta. Introduz uma resposta por linha no formato:

```text
Resposta | pontos | alias1, alias2
```

Os pontos aceites são 5, 15, 30, 55, 80 e 100. Cada resposta pode ter até oito aliases. As categorias pessoais aparecem no treino livre, mas não alteram o desafio diário.

Usa **Exportar cópia** para guardar as tuas perguntas, respostas pessoais, preferências, estatísticas e recordes num ficheiro JSON. **Importar cópia** repõe esses dados noutro navegador ou dispositivo. A importação pede confirmação e tenta preservar os dados anteriores caso o armazenamento falhe. Guarda a cópia num local seguro: não existe sincronização automática na cloud.

## Progressão, conquistas e histórico

A área **O teu percurso** acompanha a evolução neste navegador:

- **Sequência diária:** conta os dias consecutivos em que concluíste o desafio diário. O contador mantém a sequência ativa durante o dia seguinte e reinicia quando falhas um dia completo.
- **Oito conquistas:** desbloqueiam-se ao concluir a primeira ronda, chegar a 80%, encontrar uma resposta lendária, acumular respostas raras, obter 100%, manter uma sequência de três dias, completar dez rondas ou criar uma pergunta.
- **Histórico:** guarda as últimas 50 rondas e apresenta as cinco mais recentes, com modo, data e percentagem.
- **Temas visuais:** escolhe entre Oceano, Abismo e Coral no topo da página. A preferência fica guardada.

As conquistas e as sequências são calculadas a partir das rondas concluídas. As tentativas incompletas ou abandonadas não contam.

## Estatísticas e privacidade

O Grillon guarda no localStorage do navegador:
- recorde pessoal e média de pontuação;
- número de rondas e respostas com 80 ou mais pontos;
- melhor resultado do desafio diário e sequência diária;
- histórico recente e conquistas desbloqueadas;
- tema visual, preferências de jogo e respostas pessoais adicionadas;
- cache das APIs.

As cópias de segurança incluem agora o histórico e o tema visual, além das perguntas, respostas, preferências e estatísticas. As cópias antigas continuam a poder ser importadas, mas não contêm o histórico que ainda não existia.

Não existe conta, servidor próprio, leaderboard online ou envio das respostas. Limpar os dados do site no navegador remove estes dados.

## Executar localmente

Para iniciar no Windows, faz duplo clique em `start-grillon.bat`. O lançador abre o jogo no navegador e inicia um servidor local ligado apenas a `127.0.0.1`. Fecha a janela **Grillon - servidor local** para desligar o servidor.

Também podes iniciar manualmente, dentro da pasta do projeto:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Depois abre http://127.0.0.1:8000. Se o comando `py` não estiver disponível, usa `python -m http.server 8000 --bind 127.0.0.1`. Este método é recomendado para garantir que as APIs externas e o armazenamento local funcionam corretamente.

Para GitHub Pages, seleciona a branch main e a pasta raiz nas definições de Pages.

## Validação

O GitHub Actions executa uma verificação de sintaxe JavaScript e valida a estrutura e os elementos principais do projeto em cada push para main e em pull requests.
