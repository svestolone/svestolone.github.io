const VIRTUES = [
  { name: "Wisdom", icon: "✦", subtitle: "Think, explore and understand", strengths: ["Creativity", "Curiosity", "Judgment", "Love of Learning", "Perspective"] },
  { name: "Courage", icon: "🔥", subtitle: "Act with strength and conviction", strengths: ["Bravery", "Perseverance", "Honesty", "Zest"] },
  { name: "Humanity", icon: "♡", subtitle: "Care for people and connect", strengths: ["Love", "Kindness", "Social Intelligence"] },
  { name: "Justice", icon: "⚖", subtitle: "Help groups work well together", strengths: ["Teamwork", "Fairness", "Leadership"] },
  { name: "Temperance", icon: "☯", subtitle: "Balance, restraint and care", strengths: ["Forgiveness", "Humility", "Prudence", "Self-Regulation"] },
  { name: "Transcendence", icon: "✧", subtitle: "Find meaning, wonder and hope", strengths: ["Appreciation of Beauty and Excellence", "Gratitude", "Hope", "Humour", "Spirituality"] }
];
const STRENGTH_DESCRIPTIONS = {
  "Creativity":"Finding original ways to solve problems",
  "Curiosity":"Exploring and asking questions",
  "Judgment":"Examining evidence before deciding",
  "Love of Learning":"Building knowledge and skills",
  "Perspective":"Seeing the bigger picture",
  "Bravery":"Facing challenges despite fear",
  "Perseverance":"Continuing when things are difficult",
  "Honesty":"Being genuine and truthful",
  "Zest":"Bringing energy and enthusiasm",
  "Love":"Valuing close relationships",
  "Kindness":"Offering care and help",
  "Social Intelligence":"Reading feelings and social situations",
  "Teamwork":"Contributing to a group",
  "Fairness":"Treating people justly",
  "Leadership":"Helping a group organise and move forward",
  "Forgiveness":"Giving people room to make amends",
  "Humility":"Letting actions speak without seeking attention",
  "Prudence":"Thinking ahead about risks and consequences",
  "Self-Regulation":"Managing impulses and responses",
  "Appreciation of Beauty and Excellence":"Noticing beauty, skill and excellence",
  "Gratitude":"Recognising and appreciating good things",
  "Hope":"Expecting and working towards a better future",
  "Humour":"Bringing playfulness and lightness",
  "Spirituality":"Connecting with meaning or a larger purpose"
};
const STRENGTH_ICONS = {
  "Creativity":"✦","Curiosity":"⌕","Judgment":"◇","Love of Learning":"▤","Perspective":"◉",
  "Bravery":"⚔","Perseverance":"⛰","Honesty":"◈","Zest":"☀","Love":"♡","Kindness":"❋","Social Intelligence":"☷",
  "Teamwork":"♧","Fairness":"⚖","Leadership":"♜","Forgiveness":"↺","Humility":"⌄","Prudence":"◷","Self-Regulation":"◌",
  "Appreciation of Beauty and Excellence":"✧","Gratitude":"❧","Hope":"☼","Humour":"☺","Spirituality":"✺"
};

let missions = [];
let chosenStrength = null;
let chosenVirtue = null;
let chosenMission = null;
let isFlipped = false;

const $ = (id) => document.getElementById(id);
const screens = ["step-category", "step-strengths", "step-confirm", "step-mission", "step-card"];

function showScreen(id) {
  screens.forEach(screenId => $(screenId).classList.toggle("hidden", screenId !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 2600);
}
function safeFileName(name) {
  // Card filenames are expected to match the VIA strength name, e.g. "Love of Learning.png".
  return `assets/cards/${name}.png`;
}
function renderCategories() {
  $("category-grid").innerHTML = "";
  VIRTUES.forEach(virtue => {
    const button = document.createElement("button");
    button.className = "category-tile";
    button.type = "button";
    button.innerHTML = `<span class="category-symbol">${virtue.icon}</span><strong>${virtue.name}</strong><small>${virtue.subtitle}</small>`;
    button.addEventListener("click", () => {
      chosenVirtue = virtue;
      $("strength-category-title").textContent = `${virtue.name} strengths`;
      renderStrengths(virtue);
      showScreen("step-strengths");
    });
    $("category-grid").appendChild(button);
  });
}
function renderStrengths(virtue) {
  const list = $("strength-list");
  list.innerHTML = "";
  virtue.strengths.forEach(strength => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "strength-option";
    button.innerHTML = `<span class="mini-symbol">${STRENGTH_ICONS[strength] || "✦"}</span><span><strong>${strength}</strong><small>${STRENGTH_DESCRIPTIONS[strength] || ""}</small></span><span class="chevron">›</span>`;
    button.addEventListener("click", () => {
      chosenStrength = strength;
      renderSelectedSummary();
      showScreen("step-confirm");
    });
    list.appendChild(button);
  });
}
function renderSelectedSummary() {
  $("selected-strength-summary").innerHTML = `<span class="summary-icon">${STRENGTH_ICONS[chosenStrength] || "✦"}</span><span><strong>${chosenStrength}</strong><small>${chosenVirtue.name} · ${STRENGTH_DESCRIPTIONS[chosenStrength] || ""}</small></span>`;
}
function renderMissions() {
  const grid = $("mission-grid");
  grid.innerHTML = "";
  missions.forEach((mission, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mission-tile";
    button.innerHTML = `<span class="mission-number">MISSION ${String(index + 1).padStart(2, "0")}</span><small>Tap to select · script read by GM</small>`;
    button.addEventListener("click", () => selectMission(mission.id));
    grid.appendChild(button);
  });
}
function selectMission(id) {
  chosenMission = missions.find(m => m.id === id);
  if (!chosenMission) return;
  isFlipped = false;
  $("flip-card").classList.remove("flipped");
  $("chosen-mission-label").textContent = `MISSION ${chosenMission.id.slice(1)}`;
  $("card-instruction").textContent = "Your clue stays hidden until you tap the card.";
  $("end-round").classList.add("hidden");
  renderCardFront();
  renderCardBack();
  showScreen("step-card");
}
function renderCardFront() {
  const image = $("strength-card-image");
  const fallback = $("card-front-fallback");
  image.onload = () => { image.classList.remove("hidden"); fallback.classList.add("hidden"); };
  image.onerror = () => { image.classList.add("hidden"); fallback.classList.remove("hidden"); };
  image.src = safeFileName(chosenStrength);
  image.alt = `${chosenStrength} VIA strength card`;
  $("fallback-category").textContent = chosenVirtue.name;
  $("fallback-strength").textContent = chosenStrength;
}
function renderCardBack() {
  const clue = chosenMission.strength_clues[chosenStrength];
  $("clue-strength-name").textContent = chosenStrength;
  if (clue) {
    $("clue-status").textContent = "Additional mission information";
    $("clue-text").textContent = clue;
  } else {
    $("clue-status").textContent = "No extra clue this time";
    $("clue-text").textContent = "Your strength does not reveal a special clue for this mission. You can still use it to contribute ideas, support your teammates, or help the party decide what to do.";
  }
}
function flipCard() {
  isFlipped = !isFlipped;
  $("flip-card").classList.toggle("flipped", isFlipped);
  $("card-instruction").textContent = isFlipped ? "Share your information with the team if you think it will help." : "Your clue stays hidden until you tap the card.";
  $("end-round").classList.toggle("hidden", !isFlipped);
}
async function init() {
  try {
    const response = await fetch("data/missions.json");
    if (!response.ok) throw new Error("Could not load mission data");
    const data = await response.json();
    missions = data.missions;
    renderCategories();
    renderMissions();
  } catch (error) {
    document.querySelector("main").innerHTML = `<section class="screen"><h2>Could not load the mission pack</h2><p class="intro">Open this site through a local web server or host it online. Browsers may block JSON loading when the HTML file is opened directly from your computer.</p></section>`;
  }
}
$("back-to-categories").addEventListener("click", () => showScreen("step-category"));
$("change-strength").addEventListener("click", () => showScreen("step-strengths"));
$("lock-strength").addEventListener("click", () => showScreen("step-mission"));
$("random-mission").addEventListener("click", () => {
  if (!missions.length) return;
  const mission = missions[Math.floor(Math.random() * missions.length)];
  selectMission(mission.id);
});
$("flip-card").addEventListener("click", flipCard);
$("end-round").addEventListener("click", () => {
  chosenStrength = null;
  chosenVirtue = null;
  chosenMission = null;
  isFlipped = false;
  showScreen("step-category");
});
init();
