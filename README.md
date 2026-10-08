# Liber – Mockup do Modo ADM

Protótipo do menu de configurações do dispositivo Liber e do painel do Modo ADM (React 18 + TypeScript + Vite + Tailwind).
Sem backend: os dados ficam no `sessionStorage`.

## Executar

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run typecheck  # tsc --noEmit
```

## Uso

- O app abre no menu inicial do dispositivo. Teclas: ↑/↓ navegam, Enter abre/confirma, Esc/Backspace volta.
- Também funciona com mouse: passar o mouse seleciona, clique executa, botão direito volta.
- Para entrar no painel: **Configurações → Modo ADM** (usuário e senha padrão definidos em `DEFAULT_PASSWORD`, `src/data/defaults.ts`; mockup, não usar em produção).

## Estrutura

- `src/App.tsx` – menu do dispositivo, login e painel do Modo ADM
- `src/data/settings.ts` – árvore de Configurações (fonte única do menu do dispositivo e do painel), presets por perfil, import/export XML
- `src/data/defaults.ts` – menu do dispositivo, perfis, usuários e senha padrão de demonstração
- `src/components/` – `SettingsPanel` (árvore +/−), `AppToggleButton`, `InfoTip`
- `src/types.ts` – tipos compartilhados

## Acessibilidade

- Menu do dispositivo: `role="menu"` com `aria-activedescendant`; o foco acompanha a troca de nível e os avisos (`alertdialog`), e o nome do menu é anunciado ao entrar.
- Painel: link "Ir para o conteúdo", título principal, árvore com `aria-expanded`, botões de alternância com `aria-pressed`/`role="switch"`, campos com rótulo associado, avisos em região `aria-live` e diálogos com foco preso e retorno do foco.
- Respeita `prefers-reduced-motion`.
