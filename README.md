# Sorteador de Times

Aplicação estática desenvolvida apenas com HTML, CSS e JavaScript para distribuir jogadores em
times equilibrados.

## Como executar

1. Faça o download/clonagem do repositório.
2. Abra o arquivo `index.html` diretamente em um navegador moderno **ou** sirva o diretório com um
   servidor estático simples, por exemplo:
   ```bash
   npx serve .
   ```

## Funcionalidades

- Sorteio aleatório e balanceado dos jogadores.
- Validação de entradas e feedback visual imediato.
- Histórico local com até 50 sorteios utilizando `localStorage`.
- Tema escuro com destaque para as cores `#FD4C04` e `#FFCA05`.

## Estrutura

- `index.html` – marcação principal e ligação com os assets.
- `styles.css` – tema dark e componentes da interface.
- `script.js` – lógica de sorteio, validações e histórico.
- `public/logo.svg` – logo fornecida (substitua pelo arquivo oficial se necessário).
- `PROJECT-BRIEFING.MD` – briefing atualizado do produto.

## Fluxo de uso

1. Liste os jogadores, um por linha.
2. Ajuste o número de times e de jogadores por time.
3. Clique em “Sortear times” para gerar o resultado.
4. Consulte, recarregue ou limpe o histórico conforme necessário.
