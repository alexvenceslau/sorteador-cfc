"use strict";

const STORAGE_KEY = "sorteador-time__drafts";
const PLAYERS_STORAGE_KEY = "sorteador-time__players";
const MAX_HISTORY_ITEMS = 50;
const MIN_TEAMS = 2;
const MIN_PLAYERS_PER_TEAM = 1;
const MAX_PLAYERS = 256;

const state = {
  currentDraft: null,
  history: [],
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  hydrateStateFromStorage();
  loadSavedPlayers();
  updateCounters();
  renderCurrentDraft();
  renderHistory();
});

function cacheElements() {
  elements.playersTextarea = document.getElementById("players");
  elements.teamCountInput = document.getElementById("team-count");
  elements.playersPerTeamInput = document.getElementById("players-per-team");
  elements.feedbackBox = document.getElementById("feedback");
  elements.playersCounter = document.getElementById("players-count");
  elements.slotsCounter = document.getElementById("slots-count");
  elements.draftButton = document.getElementById("draft-button");
  elements.currentTeamsContainer = document.getElementById("current-teams");
  elements.historyContainer = document.getElementById("history-list");
  elements.clearHistoryButton = document.getElementById("clear-history");
  elements.configPanel = document.getElementById("config-panel");
  elements.newDraftButton = document.getElementById("new-draft-button");
}

function bindEvents() {
  elements.playersTextarea.addEventListener("change", () => {
    limitTextareaLines();
    updateCounters();
    savePlayers();
  });

  elements.teamCountInput.addEventListener("change", () => {
    enforceNumericBounds(elements.teamCountInput, MIN_TEAMS, 16);
    updateCounters();
  });

  elements.playersPerTeamInput.addEventListener("change", () => {
    enforceNumericBounds(
      elements.playersPerTeamInput,
      MIN_PLAYERS_PER_TEAM,
      25
    );
    updateCounters();
  });

  elements.draftButton.addEventListener("click", handleDraft);

  elements.newDraftButton.addEventListener("click", () => {
    showConfigPanel();
    elements.newDraftButton.style.display = "none";
    hideFeedback();
  });

  elements.clearHistoryButton.addEventListener("click", () => {
    state.history = [];
    state.currentDraft = null;
    persistHistory();
    renderCurrentDraft();
    renderHistory();
    showFeedback("Histórico limpo.", "success");
  });

  elements.historyContainer.addEventListener("click", (event) => {
    const target = event.target.closest("[data-draft-id]");
    if (!target) {
      return;
    }

    const draftId = target.getAttribute("data-draft-id");
    const draft = state.history.find((entry) => entry.id === draftId);
    if (draft) {
      state.currentDraft = draft;
      renderCurrentDraft();
      hideFeedback();
    }
  });
}

function hydrateStateFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.history = [];
      state.currentDraft = null;
      return;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.history = parsed.slice(0, MAX_HISTORY_ITEMS);
      state.currentDraft = state.history[0] || null;
    }
  } catch (error) {
    console.warn("Falha ao carregar histórico do armazenamento local.", error);
    state.history = [];
    state.currentDraft = null;
  }
}

function persistHistory() {
  try {
    const snapshot = state.history.slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Não foi possível salvar o histórico.", error);
  }
}

function limitTextareaLines() {
  const lines = elements.playersTextarea.value.split("\n");
  if (lines.length <= MAX_PLAYERS) {
    return;
  }
  elements.playersTextarea.value = lines.slice(0, MAX_PLAYERS).join("\n");
}

function enforceNumericBounds(input, min, max) {
  const value = Number(input.value);
  if (Number.isNaN(value)) {
    input.value = String(min);
    return;
  }

  input.value = String(Math.min(Math.max(value, min), max));
}

function updateCounters() {
  const players = getNormalizedPlayers();
  const teamCount = Number(elements.teamCountInput.value);
  const playersPerTeam = Number(elements.playersPerTeamInput.value);
  const totalSlots = teamCount * playersPerTeam;

  elements.playersCounter.textContent = `${players.length} jogadores`;
  elements.slotsCounter.textContent = `${totalSlots} vagas totais`;

  const validationError = validateDraft(players, teamCount, playersPerTeam);
  if (validationError) {
    elements.draftButton.disabled = true;
  } else {
    elements.draftButton.disabled = false;
    hideFeedback();
  }
}

function getNormalizedPlayers() {
  const rawPlayers = elements.playersTextarea.value
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  const uniquePlayers = Array.from(new Set(rawPlayers));
  return uniquePlayers;
}

function validateDraft(players, teamCount, playersPerTeam) {
  if (players.length < 2) {
    return "Informe pelo menos dois jogadores para realizar o sorteio.";
  }

  if (teamCount < MIN_TEAMS) {
    return "Defina pelo menos dois times.";
  }

  if (playersPerTeam < MIN_PLAYERS_PER_TEAM) {
    return "Defina pelo menos um jogador por time.";
  }

  if (teamCount * playersPerTeam > players.length) {
    return "Quantidade de jogadores insuficiente para preencher todos os times.";
  }

  return null;
}

function handleDraft() {
  const players = getNormalizedPlayers();
  const teamCount = Number(elements.teamCountInput.value);
  const playersPerTeam = Number(elements.playersPerTeamInput.value);

  const validationError = validateDraft(players, teamCount, playersPerTeam);
  if (validationError) {
    showFeedback(validationError, "error");
    return;
  }

  const draft = generateDraft(players, teamCount, playersPerTeam);
  state.currentDraft = draft;
  state.history = [draft, ...state.history].slice(0, MAX_HISTORY_ITEMS);
  persistHistory();
  renderCurrentDraft();
  renderHistory();
  hideConfigPanel();
  elements.newDraftButton.style.display = "inline-flex";
  showFeedback("Times sorteados com sucesso!", "success");
}

function generateDraft(players, teamCount, playersPerTeam) {
  const shuffled = shuffle(players);
  const teams = Array.from({ length: teamCount }, () => []);

  shuffled.forEach((player, index) => {
    const teamIndex = index % teamCount;
    if (teams[teamIndex].length < playersPerTeam) {
      teams[teamIndex].push(player);
      return;
    }

    const fallbackIndex = teams.findIndex(
      (team) => team.length < playersPerTeam
    );
    if (fallbackIndex >= 0) {
      teams[fallbackIndex].push(player);
      return;
    }

    teams[teamIndex].push(player);
  });

  return {
    id: generateUUID(),
    timestamp: Date.now(),
    config: {
      teams: teamCount,
      playersPerTeam,
    },
    players,
    teams,
  };
}

function shuffle(list) {
  const array = list.slice();
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = array[index];
    array[index] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}

function renderCurrentDraft() {
  elements.currentTeamsContainer.innerHTML = "";

  if (!state.currentDraft) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "Informe os jogadores e realize um sorteio para visualizar os times.";
    elements.currentTeamsContainer.appendChild(empty);
    return;
  }

  const summary = document.createElement("p");
  summary.className = "panel-header__caption";
  summary.textContent = `${
    state.currentDraft.players.length
  } jogadores distribuídos em ${state.currentDraft.config.teams} ${
    state.currentDraft.config.teams === 1 ? "time" : "times"
  }.`;
  elements.currentTeamsContainer.appendChild(summary);

  const teamsWrapper = document.createElement("div");
  teamsWrapper.className = "grid-layout";

  state.currentDraft.teams.forEach((team, index) => {
    const card = document.createElement("div");
    card.className = "team-card";

    const header = document.createElement("div");
    header.className = "team-card__header";
    header.innerHTML = `<span>Time ${index + 1}</span><span>${
      team.length
    } jogadores</span>`;
    card.appendChild(header);

    const list = document.createElement("ol");
    team.forEach((player) => {
      const item = document.createElement("li");
      item.textContent = player;
      list.appendChild(item);
    });
    card.appendChild(list);
    teamsWrapper.appendChild(card);
  });

  elements.currentTeamsContainer.appendChild(teamsWrapper);
}

function renderHistory() {
  elements.historyContainer.innerHTML = "";

  if (state.history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum sorteio salvo ainda.";
    elements.historyContainer.appendChild(empty);
    elements.clearHistoryButton.disabled = true;
    return;
  }

  state.history.forEach((draft) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-card";
    button.setAttribute("data-draft-id", draft.id);
    button.innerHTML = `
      <span>${formatTimestamp(draft.timestamp)}</span>
      <span>${draft.config.teams} ${
      draft.config.teams === 1 ? "time" : "times"
    } · ${draft.players.length} jogadores</span>
    `;
    elements.historyContainer.appendChild(button);
  });

  elements.clearHistoryButton.disabled = false;
}

function formatTimestamp(value) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (_error) {
    return "Data inválida";
  }
}

function showFeedback(message, type) {
  elements.feedbackBox.textContent = message;
  elements.feedbackBox.className = `feedback ${
    type === "success" ? "feedback--success" : ""
  }`;
  elements.feedbackBox.hidden = false;
}

function hideFeedback() {
  elements.feedbackBox.hidden = true;
}

function loadSavedPlayers() {
  try {
    const savedPlayers = window.localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (savedPlayers) {
      elements.playersTextarea.value = savedPlayers;
    }
  } catch (error) {
    console.warn("Falha ao carregar jogadores salvos.", error);
  }
}

function savePlayers() {
  try {
    window.localStorage.setItem(PLAYERS_STORAGE_KEY, elements.playersTextarea.value);
  } catch (error) {
    console.warn("Não foi possível salvar os jogadores.", error);
  }
}

function hideConfigPanel() {
  elements.configPanel.style.display = "none";
}

function showConfigPanel() {
  elements.configPanel.style.display = "grid";
}

function generateUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.random() * 16;
      const value =
        character === "x"
          ? Math.floor(random)
          : (Math.floor(random) & 0x3) | 0x8;
      return value.toString(16);
    }
  );
}
