# Project Briefing: Sorteador de Times

## Visão Geral do Projeto
Ferramenta web leve e estática para sortear times aleatórios a partir de uma lista de jogadores, executada apenas com HTML, CSS e JavaScript. A aplicação roda diretamente no navegador, sem frameworks ou build step, mantendo a simplicidade desejada.

## Objetivos
- Construir uma interface escura moderna e responsiva
- Permitir configuração flexível de quantidade de times e jogadores
- Exibir resultados de forma clara e visualmente marcante
- Guardar histórico local dos sorteios realizados

## Identidade Visual
- **Tema:** Dark-first
- **Cores principais:**
  - Branco: `#FFFFFF`
  - Laranja: `#FD4C04`
  - Amarelo: `#FFCA05`
- **Logo:** arquivo fornecido como anexo (usar em destaque no cabeçalho)

## Stack Tecnológico
- **Estrutura:** HTML5 sem bundler
- **Estilos:** CSS3 + variáveis CSS para cores
- **Interatividade:** JavaScript ES2020 módulo único (sem transpilar)
- **Storage:** LocalStorage do navegador
- **Deploy:** Entrega estática (Cloudflare Pages ou GitHub Pages)

## Funcionalidades

### Entrada de Dados
- Textarea para nomes (um por linha)
- Número de times (mínimo 2)
- Número de jogadores por time (mínimo 1)
- Indicador de jogadores totais vs. vagas necessárias

### Processamento
- Limpeza de linhas vazias e nomes duplicados
- Validação das combinações escolhidas
- Shuffle aleatório simples (Fisher-Yates)
- Distribuição balanceada, com tratamento para sobras

### Exibição
- Cards para cada time com contagem de jogadores
- Destaques usando as cores `#FD4C04` e `#FFCA05`
- Mensagens de feedback e estados vazios

### Histórico
- Lista lateral com até 50 sorteios
- Data/hora formatada (pt-BR)
- Botões para recarregar e limpar histórico

## Estrutura de Dados (LocalStorage)

```json
{
  "sorteios": [
    {
      "id": "uuid",
      "timestamp": 1730000000000,
      "config": {
        "teams": 2,
        "playersPerTeam": 5
      },
      "players": ["Nome 1", "Nome 2"],
      "teams": [["Nome 1", "Nome 4"], ["Nome 2", "Nome 3"]]
    }
  ]
}
```

## Fluxo de Uso
1. Usuário acessa página e vê logo + descrição
2. Informa jogadores e parâmetros
3. Clica em "Sortear Times"
4. Sistema valida, sorteia e exibe resultado
5. Sorteio é salvo no histórico automaticamente
6. Usuário pode repetir ou carregar sorteios anteriores

## Requisitos Técnicos
- Responsividade mobile-first (mínimo 320px)
- Compatibilidade com navegadores Chromium, Firefox e Safari modernos
- Lighthouse acima de 90 para Performance e Acessibilidade
- Sem dependências externas obrigatórias; uso de web fonts opcionais

## Roadmap de Entrega
1. Estruturar HTML base e aplicar tema dark com as cores definidas
2. Implementar lógica de sorteio e validações em JavaScript puro
3. Conectar histórico usando LocalStorage
4. Refinações visuais (microinterações, estados vazios, responsividade)
5. Integração da logo e ajustes finais de acessibilidade
6. Preparar README com instruções e realizar deploy estático

---

**Projeto:** Sorteador de Times  
**Data de Atualização:** 23/10/2025  
**Autor:** Bamboo Agência Digital
