const heroes = [
  { id: "thor", name: "Thor", image: "src/images/thor.png", type: "hero" },
  {
    id: "homem-de-ferro",
    name: "Homem de Ferro",
    image: "src/images/homem-de-ferro.png",
    type: "hero",
  },
  {
    id: "viuva-negra",
    name: "Viúva Negra",
    image: "src/images/viuva-negra.png",
    type: "hero",
  },
  { id: "hulk", name: "Hulk", image: "src/images/hulk.png", type: "hero" },
  {
    id: "capitao-america",
    name: "Capitão América",
    image: "src/images/capitao-america.png",
    type: "hero",
  },
  { id: "nova", name: "Nova", image: "src/images/nova.png", type: "hero" },
  { id: "fenix", name: "Fênix", image: "src/images/fenix.png", type: "hero" },
];

const villains = [
  {
    id: "ultron",
    name: "Ultron",
    image: "src/images/ultron.png",
    type: "villain",
  },
  {
    id: "doutor-doom",
    name: "Doutor Doom",
    image: "src/images/doutor-doom.png",
    type: "villain",
  },
  {
    id: "goblin",
    name: "Goblin",
    image: "src/images/goblin.png",
    type: "villain",
  },
  {
    id: "groot",
    name: "Groot",
    image: "src/images/groot.png",
    type: "villain",
  },
  {
    id: "jack",
    name: "Jack",
    image: "src/images/jack.png",
    type: "villain",
  },
  {
    id: "sangue-venom",
    name: "Sangue Venom",
    image: "src/images/sangue-venom.png",
    type: "villain",
  },
  {
    id: "thanos",
    name: "Thanos",
    image: "src/images/thanos.png",
    type: "villain",
  },
];

const state = {
  category: "heroes",
  selected: {
    player1: heroes[0],
    player2: villains[0],
  },
};

const categoryLabel = document.getElementById("categoria-label");
const toggleButton = document.getElementById("toggle-categoria");
const listaPersonagens = document.getElementById("lista-personagens");
const startButton = document.getElementById("start-game");
const jogador1Image = document.getElementById("personagem-jogador-1");
const jogador2Image = document.getElementById("personagem-jogador-2");
const jogador1Name = document.getElementById("nome-jogador-1");
const jogador2Name = document.getElementById("nome-jogador-2");

function loadSelection() {
  const saved = localStorage.getItem("selectedPlayers");

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.player1)
        state.selected.player1 = {
          ...state.selected.player1,
          ...parsed.player1,
        };
      if (parsed.player2)
        state.selected.player2 = {
          ...state.selected.player2,
          ...parsed.player2,
        };
    } catch (error) {
      console.warn("Falha ao ler seleção do localStorage.", error);
    }
  }

  updatePreview();
  renderList();
  updateStartButton();
}

function getCharacterList() {
  return state.category === "heroes" ? heroes : villains;
}

function updatePreview() {
  jogador1Image.src = state.selected.player1.image;
  jogador1Image.alt = `Herói ${state.selected.player1.name}`;
  jogador1Name.textContent = state.selected.player1.name;

  jogador2Image.src = state.selected.player2.image;
  jogador2Image.alt = `Vilão ${state.selected.player2.name}`;
  jogador2Name.textContent = state.selected.player2.name;
}

function saveSelection() {
  localStorage.setItem("selectedPlayers", JSON.stringify(state.selected));
}

function renderList() {
  categoryLabel.textContent = `Categoria: ${state.category === "heroes" ? "Heróis" : "Vilões"}`;
  toggleButton.textContent =
    state.category === "heroes" ? "Selecionar Vilões" : "Selecionar Heróis";
  listaPersonagens.innerHTML = "";

  getCharacterList().forEach((char) => {
    const item = document.createElement("li");
    item.className = "personagem";
    item.dataset.id = char.id;
    item.dataset.name = char.name;
    item.innerHTML = `
            <span class="tag">${state.category === "heroes" ? "1P" : "2P"}</span>
            <img src="${char.image}" alt="Personagem ${char.name}">
        `;

    const isActive =
      state.category === "heroes"
        ? state.selected.player1.id === char.id
        : state.selected.player2.id === char.id;

    if (isActive) {
      item.classList.add("selecionado");
    }

    item.addEventListener("click", () => {
      if (state.category === "heroes") {
        state.selected.player1 = char;
      } else {
        state.selected.player2 = char;
      }
      saveSelection();
      updatePreview();
      renderList();
      updateStartButton();
    });

    listaPersonagens.appendChild(item);
  });
}

function updateStartButton() {
  const enabled = Boolean(state.selected.player1 && state.selected.player2);
  startButton.disabled = !enabled;
  startButton.classList.toggle("disabled", !enabled);
}

toggleButton.addEventListener("click", () => {
  state.category = state.category === "heroes" ? "villains" : "heroes";
  renderList();
});

startButton.addEventListener("click", () => {
  saveSelection();
  window.location.href = "fight.html";
});

loadSelection();
