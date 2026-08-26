# Retorno da rodada 1 — wireframes

> Complemento a `design-direction.md`. Leia os dois juntos.
> Ordem: corrija o Tier 1 antes de qualquer redesenho estético.

---

## O que ficou bom e deve ser preservado

Não mexa nestes acertos ao aplicar o resto:

- **A tela Hoje do trainer é a tese do produto.** O feed cronológico com hora à
  esquerda, nome, treino e métrica responde *"meu aluno treinou?"* sem ele
  precisar procurar. Esse padrão fica.
- **"Precisa de atenção" com motivo textual** — *"Sem treinar há 6 dias"*,
  *"Aderência caiu para 38%"* — em vez de só um badge colorido.
- **Alvos de toque no mobile do aluno:** check 48px, steppers 44px, linha 56px.
- **A nota "Sem rede? Tudo fica salvo no aparelho e sincroniza depois"** na
  sessão ativa, no momento certo.
- **O modal de atribuição diz "o aluno recebe uma cópia congelada do template"** —
  a decisão de domínio virou copy visível.
- **Disciplina de mono.** Só em dado, nos cinco arquivos. Mantenha a regra.

**Sobre o nome:** "GymFlow" segue de propósito. A marca ainda não foi decidida.
Não substitua por placeholder.

---

## Tier 1 — bloqueadores

### 1.1 O aluno não consegue editar repetições

Na sessão ativa (`Aluno Mobile`, `Aluno Desktop`) só existem `decW` / `incW`.
**Não há stepper de repetições.**

Se o aluno fez 8 das 10 prescritas, não tem como registrar. Isso não é detalhe
de UI: reps alimenta volume, aderência e evolução de carga — ou seja, todo o
resto do produto. O app atual já tem os dois steppers.

**Fazer:** cada linha de série precisa de ajuste independente de **carga** e de
**repetições**. Ambos com alvo ≥44pt. Se o espaço apertar em telas estreitas,
empilhe carga e reps em duas linhas dentro do mesmo cartão — não remova o
controle.

### 1.2 Nenhum estado vazio existe

Nenhuma das cinco telas tem zero-state. O trainer no dia 1 tem zero alunos: vai
ver uma tabela com cabeçalho e nada embaixo, e quatro KPIs zerados. **É a
primeira tela que ele vê no produto.**

**Desenhar, no mínimo:**

| Tela | Estado vazio |
|---|---|
| Trainer · Hoje | ninguém treinou hoje ainda |
| Trainer · Alunos | zero alunos — com CTA de convite |
| Trainer · Aluno detalhe | aluno sem programa atribuído |
| Trainer · Construtor | programa sem exercícios |
| Aluno · Hoje | sem treino prescrito para hoje |
| Aluno · Histórico | nenhuma sessão concluída |

Cada um precisa de: o que aconteceu, por que está vazio, e a próxima ação.
Não use ilustração — a direção é restrição. Ícone contido, texto e um botão.

### 1.3 A semântica de cor estava errada — e os tokens já foram corrigidos

`Precisam de atenção` usava `--destructive`. **Está errado:** destructive é
ação destrutiva e erro. "Precisa de atenção", "atrasado" e "aderência caindo"
são `--warning`.

Havia também colisão de matiz que era falha do spec anterior, **já corrigida em
`packages/design-tokens`**:

| Token | Antes | Agora | Matiz |
|---|---|---|---|
| `destructive` claro | `#B4291F` | `#BE1D42` | 4° → 346° |
| `destructive` escuro | `#F06A5E` | `#F2556E` | 5° → 350° |

A separação em relação ao âmbar (18°) passou de **13°** para **27–32°**.
Vermelho puro fica perto demais do acento de marca e os dois viram o mesmo
sinal num relance; carmim continua lendo como perigo e se separa.

**Fazer:** repuxe os tokens e troque todo uso de destructive que signifique
"atenção" por warning. Destructive fica só em: excluir exercício, excluir
programa, remover aluno, e mensagem de erro.

---

## Tier 2 — estrutural

### 2.1 Três dos quatro KPIs repetem informação já visível na tela

- *"Sessões na semana 30/58"* e o card lateral *"Semana 52%"* são o mesmo número
- *"Precisam de atenção: 6"* é a contagem da lista que está logo ao lado

**Fazer:** reduzir a régua superior para **dois** cartões — *Treinaram hoje* e
*Precisam de atenção*. São os dois que respondem à pergunta central. Aderência
média e sessões na semana descem para a coluna lateral, ou saem da tela Hoje e
vão para uma visão semanal.

O espaço mais nobre da tela é visto todo dia. Métrica que o trainer olha uma vez
por semana não ocupa esse espaço.

### 2.2 Nav numerada sem atalho de teclado real

O `1 2 3 4` na sidebar imita Raycast e Linear — mas ali o número **é** o atalho.

**Escolha uma:** implemente `⌘1`–`⌘4` de verdade e mantenha a numeração, ou
remova os números. Ornamento que finge ser função é pior que ausência.

### 2.3 O badge "PRO" desenha uma decisão de negócio que não foi tomada

O modelo de preço está em aberto. **Remova** até existir.

### 2.4 Estado de sincronização não aparece no lado do trainer

O aluno registra offline e sincroniza depois. Um item no feed marcado `09:31`
não diz se chegou às 9:31 ou às 14:00.

**Fazer:** quando a sessão chegou com atraso, mostre a distinção — hora do
treino em destaque e um marcador discreto de quando sincronizou. Sem isso o
trainer tira conclusão errada sobre quem treinou quando.

---

## Tier 3 — detalhes

- **Valores hardcoded** no estado "treino de hoje feito" do `Aluno Mobile`:
  `52 min`, `5 420 kg`, `18/18 séries` não são variáveis de template.
- **`Aluno Desktop` tem cinco telas completas.** O briefing diz que o aluno é
  mobile-first. Antes de investir mais nessa superfície, ela precisa ser
  justificada — é esforço grande num contexto que talvez ninguém use.
- **`Trainer Mobile` não tem Biblioteca.** Defensável, mas decida
  explicitamente em vez de por omissão.

---

## Novo escopo — animação de fundo nas telas de auth

As telas de auth estão corretas mas inertes. Elas são o primeiro contato com o
produto e podem carregar a tese sem dizer nada.

### O conceito

**Progressão.** Linhas que se desenham lentamente da esquerda para a direita,
subindo — o gráfico de evolução de carga do produto reduzido a ambiente. Quem
faz login não percebe conscientemente; percebe que o app é sobre progredir.

Não é decoração genérica: é o componente central do produto virado atmosfera.

### Técnica

**Canvas 2D**, não SVG. É geração procedural — path de SVG escrito à mão
envelhece mal e não varia.

### Composição

- **3 a 4 polilinhas** atravessando a viewport na horizontal
- Cada uma com **8 a 12 pontos**, variação aleatória leve, tendência **ascendente**
  da esquerda para a direita
- Alturas e amplitudes diferentes entre linhas, para não parecerem paralelas
- Atrás delas, uma **grade vertical fraca** — só linhas verticais, como o eixo de
  tempo de um gráfico. Sem horizontais.
- Um **ponto na cabeça de cada linha**, onde o traço está sendo desenhado

### Valores

| Elemento | Escuro | Claro |
|---|---|---|
| Traço da linha | `--primary` @ `0.10` alpha | `--primary` @ `0.07` alpha |
| Ponto da cabeça | `--primary` @ `0.28` alpha, `r=2.5` | idem |
| Grade vertical | `--border` @ `0.5` alpha | `--border` @ `0.6` alpha |
| Espessura | `1.5px` | `1.5px` |

Leia os valores das CSS custom properties via `getComputedStyle`, não hardcode.
Ao trocar de tema, releia.

### Movimento

- Cada linha se desenha em **18–26s**, com duração própria
- Ao completar: segura ~3s, desvanece em ~2s, e redesenha com pontos novos
- As linhas são **desencontradas** — fases iniciais diferentes, nunca sincronizadas
- **Muito lento.** Se ao olhar você percebe movimento, está rápido demais.
  O alvo é notar só depois de alguns segundos parado.

### Restrições

1. **Fica atrás do cartão de auth**, nunca por cima. O cartão usa `--card`
   sólido, então o formulário nunca perde contraste.
2. **`prefers-reduced-motion: reduce`** → renderiza **uma composição estática**
   e não inicia loop nenhum. Sem `requestAnimationFrame`.
3. **Pausa quando a aba está oculta** (`document.hidden`) — bateria.
4. **`devicePixelRatio` limitado a 2** no dimensionamento do canvas.
5. **Abaixo de 640px:** só 2 linhas. Tela pequena, menos ruído.
6. **Uma cor só.** O âmbar. Nada de segunda cor, nada de gradiente multicolorido.

### O que não fazer

Estas são as saídas genéricas — todas proibidas:

- Partículas, pontos conectados, constelação
- Blobs, gradiente mesh, aurora, beams
- Qualquer coisa que pulse ou respire em ritmo regular (lê como *loading*)
- Foto ou vídeo de academia
- Formas geométricas girando

O componente `BeamsBackground` que existe hoje em
`apps/web/src/components/ui/beams-background.tsx` deve ser **substituído** por
este — ele é exatamente a saída genérica que estamos evitando.

---

## Ordem sugerida

1. Tier 1 inteiro — reps, estados vazios, semântica de cor
2. Tier 2.1 e 2.2 — reduzir KPIs, resolver a numeração
3. Animação de auth
4. Tier 2.4 e Tier 3
5. **Não** avance em `Aluno Desktop` nem em `Trainer Mobile` até essas telas
   serem justificadas pela conversa de descoberta com um trainer real
