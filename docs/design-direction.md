# Direção de Design — Painel

> **Status:** direção visual aprovada · escopo de produto **ainda não validado**.
> A identidade abaixo é decisão fechada. A lista de telas é hipótese, pendente
> de uma conversa de descoberta com um personal trainer real.

---

## 1. Como usar este documento

Este é o briefing para desenhar o refactor de interface. Ele cobre **intenção,
identidade e regras** — coisas que o código não diz.

O repositório mostra o **produto antigo**. Não use as telas atuais como
referência de escopo, só como inventário do que já existe tecnicamente.

Ordem de leitura sugerida: seção 2 (a virada), seção 3 (os dois usuários),
depois tokens e regras.

---

## 2. A virada de produto

**Antes:** app de tracking pessoal. O usuário monta o próprio treino e registra
as séries. Nicho sem demanda comprovada — existem dezenas de apps gratuitos
melhores (Strong, Hevy, Jefit) e ninguém paga por mais um.

**Agora:** plataforma para **personal trainer prescrever treino aos alunos** e
acompanhar execução.

O que muda na prática:

| | Antes | Agora |
|---|---|---|
| Quem paga | o próprio usuário | o trainer |
| Quem monta o treino | o usuário | o trainer |
| Quem registra a série | o usuário | o aluno |
| Para quem serve o relatório | o usuário | o trainer |
| Modelo de dados | um usuário isolado | trainer possui N alunos |

As funções que já existem — volumetria, histórico, relatório de sessão —
**mudam de dono**. Elas sempre fizeram mais sentido para quem prescreve do que
para quem executa.

### A pergunta que o produto responde

> *"Meu aluno treinou?"*

Essa é a dor central levantada na pesquisa de mercado (ver `docs/` ou o dossiê
de concorrentes). Todo concorrente resolve **prescrição**. Quase nenhum resolve
o **loop de execução**. É onde o produto se diferencia.

---

## 3. Os dois usuários

O produto tem duas superfícies com contextos físicos opostos. Desenhar as duas
com a mesma linguagem é o erro mais provável.

### Trainer

- **Onde:** sentado, monitor grande, ambiente controlado, de dia
- **Quando:** planejando a semana, revisando execução, ajustando carga
- **Precisa:** densidade. Ver 20 alunos numa tela e saber quem falhou.
- **Tolera:** informação compacta, tabelas, atalhos de teclado
- **Referência mental:** Raycast, Superhuman — ferramenta de profissional

### Aluno

- **Onde:** em pé, academia, luz ruim, celular a um braço de distância, suado
- **Quando:** entre séries, 40 segundos de atenção
- **Precisa:** um número grande, um botão óbvio, zero leitura
- **Não tolera:** densidade, texto pequeno, alvo de toque apertado
- **Referência mental:** Oura — dado refinado, legível de relance

### A regra que resolve a tensão

> Mesma paleta, mesma tipografia, mesmos componentes.
> **Densidades diferentes.**

O aluno recebe a versão respirada do mesmo sistema. Não é outro design — é o
mesmo design com escala e espaçamento ajustados ao contexto.

---

## 4. Direção visual

### Referências e o que se extrai de cada

| Referência | O que entra |
|---|---|
| **Raycast** / **Superhuman** | fundo frio, densidade na lista do trainer, um acento só, posicionamento de ferramenta profissional |
| **Oura** | tratamento de dado — linha fina, área suave sob a curva, ponto final destacado, número em peso contido |
| **Technogym** | descartado como estética (madeira/latão não encaixou), mas mantido como **postura de marca**: premium por restrição, não por ornamento |

### A síntese

**Fundo frio + âmbar como único acento + dado tratado como instrumento.**

Nem o minimalismo gelado da Vercel, nem a energia gritada da Nike. Restrição
quente: calmo, preciso, profissional.

### O que evitar explicitamente

Levantamento dos concorrentes brasileiros (Tecnofit, MFIT, Treino Mestre,
Vedius, TreinoAI, Mobitrainer, Wiki4Fit, NextFit) mostrou que **todos parecem
SaaS genérico**. O território de "app que pertence ao mundo do treino" está vago.

Não use:

- Roxo, azul corporativo, gradiente roxo-azul
- Verde-limão neon sobre preto
- Foto de academia como hero
- Ícone de halter como elemento decorativo recorrente
- Ilustração 3D, blob, glassmorphism
- Emoji como marcador de seção

---

## 5. Tokens

Fonte de verdade: `packages/design-tokens/src/`.
Gerado para CSS por `scripts/build-tokens.mts` → `apps/web/src/app/tokens.css`.
Mapeado para Tailwind v4 via `@theme inline` em `apps/web/src/app/globals.css`.

**Nunca escreva hex direto em componente.** Sempre `bg-primary`,
`text-muted-foreground`, `border-border`.

### Cor semântica

| Papel | Claro | Escuro |
|---|---|---|
| `background` | `#F7F8F8` | `#0A0D0E` |
| `foreground` | `#12181B` | `#E4E9EC` |
| `card` | `#FFFFFF` | `#12181A` |
| `card-elevated` | `#EDEFEF` | `#1A2225` |
| `muted` | `#EDEFEF` | `#1E2426` |
| `muted-foreground` | `#566065` | `#98A2A8` |
| `border` | `#E2E6E6` | `#1E2426` |
| `border-strong` | `#C3C9CA` | `#2C3437` |
| `primary` | `#C9511C` | `#F0703A` |
| `primary-foreground` | `#FFFFFF` | `#FFFFFF` |
| `primary-soft` | `#FBEDE6` | `rgba(240,112,58,.14)` |
| `success` | `#1F7A4D` | `#52C48A` |
| `warning` | `#96650C` | `#D8AC52` |
| `destructive` | `#B4291F` | `#F06A5E` |
| `info` | `#1F5FA8` | `#6BA6E8` |

**A decisão mais importante da tabela:** o âmbar **não é o mesmo hex nos dois
modos**. `#F0703A` brilha no escuro e lava sobre branco; o claro usa `#C9511C`
— mesmo matiz (~18°), luminosidade ajustada. Um papel, dois valores. Isso vale
para toda cor semântica.

### Cor categórica — grupo muscular

Usada **só como faixa lateral ou chip**. Nunca como fundo de área grande,
nunca competindo com o âmbar.

`chest #D2564B` · `back #3B7BC4` · `shoulders #C88A2E` · `biceps #8B5FC0` ·
`triceps #C0568F` · `legs #3F9A63` · `core #2A93A8` · `glutes #D0743A` ·
`cardio #2FA083`

### Tipografia

Duas famílias, três papéis.

| Papel | Família | Uso |
|---|---|---|
| Corpo e UI | **Archivo** (`--font-body`) | tudo que é texto |
| Título | **Archivo** expandido | `font-stretch: 108–112%`, peso 600–700, tracking `-0.02em` |
| Dado | **JetBrains Mono** (`--font-mono`) | carga, repetição, tempo, data, porcentagem, volume |

**Regra dura:** mono **só** em dado. Mono em texto corrido transforma
instrumento em terminal — e essa é a diferença entre a direção aprovada e a
que foi descartada.

Números sempre com `font-variant-numeric: tabular-nums` quando alinharem em
coluna.

### Raio, sombra, movimento

- Raio: `xs .25rem` · `sm .375rem` · `md .5rem` · `lg .75rem` · `xl 1rem` · `2xl 1.25rem` · `3xl 1.75rem`
- Sombra: contida. **No modo escuro profundidade vem de `card-elevated`, não de sombra.**
- Easing: `--ease-out cubic-bezier(.16,1,.3,1)` é o padrão
- Duração: `fast 120ms` · `base 200ms` · `slow 320ms`

---

## 6. Regras de aplicação

1. **Um acento.** Se algo precisa de destaque e não é o âmbar, a resposta é
   hierarquia — peso, tamanho, espaço — não uma segunda cor.

2. **Estado em cor *e* forma.** Uma pílula "Feito" verde precisa dizer "Feito".
   Quem não distingue verde de laranja continua lendo.

3. **Alvo de toque ≥ 44pt na superfície do aluno.** Ele está suado e em
   movimento. Vale especialmente para marcar série concluída e ajustar carga.

4. **`prefers-reduced-motion` respeitado em toda animação.** Já existe hook
   `useReducedMotion` e regra global no `globals.css`.

5. **Modo padrão é o do sistema**, com troca manual. Ninguém escolhe pelo
   usuário. `next-themes` já está ligado.

6. **Toda string passa por i18n.** `next-intl`, pt e en em paridade.
   Nada de texto hardcoded.

7. **Unidade é variável.** kg é canônico no banco; a UI converte para lb quando
   o usuário escolher. Ver `apps/web/src/lib/units/`.

---

## 7. Inventário de componentes

### Já existe e deve ser reaproveitado

`apps/web/src/components/ui/`
: `button` (variants + loading) · `dialog` (+ variante `sheet-bottom`) ·
  `dropdown-menu` · `input` · `password-input` · `card` · `skeleton` ·
  `empty-state` · `typography` · `toaster` (Sonner)

`apps/web/src/components/workouts/`
: `set-row` · `ExerciseBlock` · `rest-timer` · `workout-header` (timer grande) ·
  `workout-list-item` · `training-streak` · `progress-bar` · `month-training-grid`

`apps/web/src/lib/`
: `units/` · `rest-timer/` · `haptic` · `use-reduced-motion` ·
  `muscle-group-color` · `toast` · `pwa-install`

### Precisa nascer

- **Lista de alunos do trainer** — a tela central. Densa, com estado de execução.
- **Detalhe do aluno** — histórico, aderência, evolução de carga.
- **Atribuição** — associar programa a aluno, com período.
- **Programa** — camada acima de treino (ver seção 8).
- **Convite de aluno** — fluxo de entrada sem fricção.
- **Feed de conclusão** — o que alimenta a resposta de *"meu aluno treinou?"*

---

## 8. Modelo de domínio a antecipar

O modelo atual é de usuário único. O novo precisa de:

```
Trainer ──< TrainerStudent >── Student
   │
   └──< Program ──< ProgramWorkout ──< WorkoutExercise ──> Exercise
             │
             └──< Assignment >── Student   (programa + período + observações)
                      │
                      └──< WorkoutSession ──< SessionExercise ──< SessionSet
```

Duas decisões que já foram tomadas e o desenho deve respeitar:

**Programa é uma camada nova.** Trainer não pensa em "um treino" — pensa em
*"Treino A/B/C, 8 semanas, 3x por semana"*. Sem isso a ferramenta não fala a
língua dele.

**Atribuição copia, não referencia.** Quando o trainer atribui um programa, o
aluno recebe uma cópia congelada com link de volta à origem. Editar o template
não muda o plano de quem está no meio da semana; a atualização é empurrada
explicitamente.

---

## 9. Telas a desenhar

> **Hipótese.** Sujeita a mudança após a conversa de descoberta.
> Priorize as marcadas com ★.

### Trainer — desktop primeiro

- ★ **Hoje** — quem treinou, quem faltou, o que precisa de atenção
- ★ **Alunos** — lista com estado de aderência
- ★ **Aluno (detalhe)** — histórico, evolução de carga, sessões
- ★ **Construtor de programa** — montar A/B/C com séries e repetições previstas
- **Biblioteca de exercícios** — catálogo + exercícios próprios
- **Atribuir programa** — escolher aluno, período, observações
- **Convidar aluno**

### Aluno — mobile primeiro

- ★ **Hoje** — o treino de hoje, um botão para começar
- ★ **Sessão ativa** — registrar série (já existe, precisa reler no novo sistema)
- **Histórico** — sessões concluídas
- **Progresso** — evolução por exercício

### Compartilhadas

- Login / cadastro / recuperar senha (existem, precisam reler os tokens novos)
- Preferências — tema, unidade, idioma (existe como `user-menu`)

---

## 10. Restrições técnicas

- **Next.js 16** App Router · React 19 · TypeScript strict
- **Tailwind v4** com `@theme inline` — tokens viram utilitários
- **PWA** com safe-area (`--app-safe-top` / `--app-safe-bottom`) — respeitar em
  qualquer elemento fixo
- **Offline-first na sessão ativa** — o aluno registra sem rede, sincroniza depois
- **i18n** pt/en via `next-intl`, paridade obrigatória
- **GraphQL** (Apollo) como única fronteira com a API NestJS

Breakpoint que separa as duas superfícies: **`lg` (1024px)**. Abaixo é
território do aluno; acima, do trainer.

---

## 11. O que NÃO desenhar agora

Tentador e fora de escopo até a validação:

- Chat entre trainer e aluno
- Nutrição / dieta
- Foto de progresso
- Pagamento e cobrança recorrente
- Anamnese / PAR-Q
- Vídeo de execução gravado pelo trainer
- IA para gerar treino (território já disputado pelo TreinoAI)

---

## Referências no repositório

- Tokens: `packages/design-tokens/src/`
- Gerador: `scripts/build-tokens.mts`
- Mapeamento Tailwind: `apps/web/src/app/globals.css`
- Fontes: `apps/web/src/app/layout.tsx`
- Tipos de domínio: `packages/domain-types/src/`
