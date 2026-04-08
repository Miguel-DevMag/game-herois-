const maxHealth = 100;
const fightRounds = 3;
const winRounds = 2;

const player1Element = document.getElementById("player-1");
const player2Element = document.getElementById("player-2");
const name1 = document.getElementById("fight-name-1");
const name2 = document.getElementById("fight-name-2");
const healthBar1 = document.getElementById("health-bar-1");
const healthBar2 = document.getElementById("health-bar-2");
const healthText1 = document.getElementById("health-1");
const healthText2 = document.getElementById("health-2");
const roundsText1 = document.getElementById("rounds-1");
const roundsText2 = document.getElementById("rounds-2");
const roundCounter = document.getElementById("round-counter");
const timerText = document.getElementById("timer");
const resultModal = document.getElementById("result-modal");
const resultText = document.getElementById("result-text");
const statTime = document.getElementById("stat-time");
const statRounds = document.getElementById("stat-rounds");
const statDamage = document.getElementById("stat-damage");
const statAttacks = document.getElementById("stat-attacks");
const btnRevanche = document.getElementById("btn-revanche");
const btnMenu = document.getElementById("btn-menu");
const btnStats = document.getElementById("btn-stats");
const arena = document.getElementById("arena");

const fighters = {
  player1: {
    id: "player1",
    name: "Hero",
    image: "src/images/thor.png",
    x: 80,
    y: 0,
    speed: 5,
    width: 140,
    health: maxHealth,
    rounds: 0,
    damageDealt: 0,
    damageTaken: 0,
    attacks: 0,
    attacking: false,
    hitRegistered: false,
    jumpVelocity: 0,
    grounded: true,
    attackPower: 14,
    dom: player1Element,
  },
  player2: {
    id: "player2",
    name: "Vilão",
    image: "src/images/ultron.png",
    x: 660,
    y: 0,
    speed: 5,
    width: 140,
    health: maxHealth,
    rounds: 0,
    damageDealt: 0,
    damageTaken: 0,
    attacks: 0,
    attacking: false,
    hitRegistered: false,
    jumpVelocity: 0,
    grounded: true,
    attackPower: 14,
    dom: player2Element,
  },
};

const controls = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  KeyA: false,
  KeyD: false,
  KeyW: false,
  KeyS: false,
};

let totalSeconds = 0;
let timerInterval = null;
let running = false;
let currentRound = 1;

function getSavedSelection() {
  const raw = localStorage.getItem("selectedPlayers");
  if (!raw) {
    return {
      player1: { name: "Thor", image: "src/images/thor.png" },
      player2: { name: "Ultron", image: "src/images/ultron.png" },
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      player1: { name: "Thor", image: "src/images/thor.png" },
      player2: { name: "Ultron", image: "src/images/ultron.png" },
    };
  }
}

function initializeFight() {
  const saved = getSavedSelection();
  fighters.player1.name = saved.player1.name || fighters.player1.name;
  fighters.player1.image = saved.player1.image || fighters.player1.image;
  fighters.player2.name = saved.player2.name || fighters.player2.name;
  fighters.player2.image = saved.player2.image || fighters.player2.image;

  name1.textContent = fighters.player1.name;
  name2.textContent = fighters.player2.name;
  player1Element.querySelector("img").src = fighters.player1.image;
  player2Element.querySelector("img").src = fighters.player2.image;

  resetMatch();
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  btnRevanche.addEventListener("click", handleRevanche);
  btnMenu.addEventListener(
    "click",
    () => (window.location.href = "index.html"),
  );
  btnStats.addEventListener("click", () =>
    resultModal.classList.toggle("hidden"),
  );
}

function handleKeyDown(event) {
  if (event.repeat) return;

  if (
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "KeyA",
      "KeyD",
      "KeyW",
      "KeyS",
    ].includes(event.code)
  ) {
    event.preventDefault();
  }

  if (event.code in controls) {
    controls[event.code] = true;
  }

  if (event.code === "KeyS") {
    triggerAttack(fighters.player1, fighters.player2);
  }

  if (event.code === "ArrowDown") {
    triggerAttack(fighters.player2, fighters.player1);
  }
}

function handleKeyUp(event) {
  if (event.code in controls) {
    controls[event.code] = false;
  }
}

function triggerAttack(attacker, defender) {
  if (!running || attacker.attacking) return;

  attacker.attacking = true;
  attacker.hitRegistered = false;
  attacker.attacks += 1;
  attacker.dom.classList.add("attack");

  setTimeout(() => {
    if (checkCollision(attacker.dom, defender.dom) && !attacker.hitRegistered) {
      defender.health = Math.max(0, defender.health - attacker.attackPower);
      attacker.damageDealt += attacker.attackPower;
      defender.damageTaken += attacker.attackPower;
      attacker.hitRegistered = true;
      updateHUD();
      evaluateRound();
    }
  }, 120);

  setTimeout(() => {
    attacker.attacking = false;
    attacker.dom.classList.remove("attack");
  }, 360);
}

function checkCollision(first, second) {
  const rect1 = first.getBoundingClientRect();
  const rect2 = second.getBoundingClientRect();
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function updateHUD() {
  healthText1.textContent = fighters.player1.health;
  healthText2.textContent = fighters.player2.health;
  healthBar1.style.width = `${fighters.player1.health}%`;
  healthBar2.style.width = `${fighters.player2.health}%`;
  roundsText1.textContent = fighters.player1.rounds;
  roundsText2.textContent = fighters.player2.rounds;
  roundCounter.textContent = `Round ${currentRound} / ${fightRounds}`;
}

function evaluateRound() {
  if (fighters.player1.health === 0 || fighters.player2.health === 0) {
    const winner =
      fighters.player1.health > fighters.player2.health
        ? fighters.player1
        : fighters.player2;
    winner.rounds += 1;
    updateHUD();

    if (winner.rounds >= winRounds) {
      endMatch(winner);
      return;
    }

    currentRound += 1;
    saveRoundSummary();
    setTimeout(resetRound, 700);
  }
}

function saveRoundSummary() {
  // placeholder for extensões futuras
}

function resetRound() {
  fighters.player1.health = maxHealth;
  fighters.player2.health = maxHealth;
  fighters.player1.x = 80;
  fighters.player2.x = arena.clientWidth - 220;
  fighters.player1.y = 0;
  fighters.player2.y = 0;
  fighters.player1.grounded = true;
  fighters.player2.grounded = true;
  fighters.player1.attacking = false;
  fighters.player2.attacking = false;
  fighters.player1.dom.classList.remove("attack", "jump");
  fighters.player2.dom.classList.remove("attack", "jump");
  updateHUD();
}

function resetMatch() {
  running = true;
  currentRound = 1;
  totalSeconds = 0;
  fighters.player1.health = maxHealth;
  fighters.player2.health = maxHealth;
  fighters.player1.rounds = 0;
  fighters.player2.rounds = 0;
  fighters.player1.damageDealt = 0;
  fighters.player2.damageDealt = 0;
  fighters.player1.damageTaken = 0;
  fighters.player2.damageTaken = 0;
  fighters.player1.attacks = 0;
  fighters.player2.attacks = 0;
  fighters.player1.x = 80;
  fighters.player2.x = arena.clientWidth - 220;
  fighters.player1.y = 0;
  fighters.player2.y = 0;
  fighters.player1.grounded = true;
  fighters.player2.grounded = true;
  fighters.player1.dom.classList.remove("attack", "jump");
  fighters.player2.dom.classList.remove("attack", "jump");
  resultModal.classList.add("hidden");
  updateHUD();

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    totalSeconds += 1;
    timerText.textContent = formatTime(totalSeconds);
  }, 1000);

  window.requestAnimationFrame(updateLoop);
}

function handleRevanche() {
  resetMatch();
}

function endMatch(winner) {
  running = false;
  clearInterval(timerInterval);
  resultText.textContent = `O vencedor é ${winner.name}!`;
  statTime.textContent = formatTime(totalSeconds);
  statRounds.textContent = `${winner.rounds} / ${fightRounds}`;
  statDamage.textContent = `${winner.damageDealt} de dano causado.`;
  statAttacks.textContent = `${winner.attacks} ataques.
`;
  resultModal.classList.remove("hidden");
}

function updatePositions() {
  const ground = 0;
  const gravity = 0.98;
  const maxLeft = 20;
  const maxRight = arena.clientWidth - 160;

  if (controls.KeyA) {
    fighters.player1.x = Math.max(
      maxLeft,
      fighters.player1.x - fighters.player1.speed,
    );
  }
  if (controls.KeyD) {
    fighters.player1.x = Math.min(
      maxRight,
      fighters.player1.x + fighters.player1.speed,
    );
  }
  if (controls.KeyW && fighters.player1.grounded) {
    fighters.player1.jumpVelocity = 13;
    fighters.player1.grounded = false;
    fighters.player1.dom.classList.add("jump");
  }

  if (controls.ArrowLeft) {
    fighters.player2.x = Math.max(
      maxLeft,
      fighters.player2.x - fighters.player2.speed,
    );
  }
  if (controls.ArrowRight) {
    fighters.player2.x = Math.min(
      maxRight,
      fighters.player2.x + fighters.player2.speed,
    );
  }
  if (controls.ArrowUp && fighters.player2.grounded) {
    fighters.player2.jumpVelocity = 13;
    fighters.player2.grounded = false;
    fighters.player2.dom.classList.add("jump");
  }

  if (!fighters.player1.grounded) {
    fighters.player1.y += fighters.player1.jumpVelocity;
    fighters.player1.jumpVelocity -= gravity;
    if (fighters.player1.y <= ground) {
      fighters.player1.y = ground;
      fighters.player1.grounded = true;
      fighters.player1.dom.classList.remove("jump");
    }
  }

  if (!fighters.player2.grounded) {
    fighters.player2.y += fighters.player2.jumpVelocity;
    fighters.player2.jumpVelocity -= gravity;
    if (fighters.player2.y <= ground) {
      fighters.player2.y = ground;
      fighters.player2.grounded = true;
      fighters.player2.dom.classList.remove("jump");
    }
  }

  fighters.player1.dom.style.left = `${fighters.player1.x}px`;
  fighters.player1.dom.style.bottom = `${10 + fighters.player1.y}px`;
  fighters.player2.dom.style.left = `${fighters.player2.x}px`;
  fighters.player2.dom.style.bottom = `${10 + fighters.player2.y}px`;
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function updateLoop() {
  if (!running) return;
  updatePositions();
  updateHUD();
  window.requestAnimationFrame(updateLoop);
}

initializeFight();
