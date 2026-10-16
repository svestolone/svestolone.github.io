let missions = [];
const $ = id => document.getElementById(id);
async function initGM() {
  try {
    const response = await fetch("data/missions.json");
    if (!response.ok) throw new Error("Could not load mission data");
    const data = await response.json();
    missions = data.missions;
    renderGMButtons();
  } catch (error) {
    $("gm-mission-grid").innerHTML = "<p>Could not load mission data. Open this site through a local web server or host it online.</p>";
  }
}
function renderGMButtons() {
  const grid = $("gm-mission-grid");
  grid.innerHTML = "";
  missions.forEach((mission, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mission-tile";
    button.innerHTML = `<span class="mission-number">MISSION ${String(index + 1).padStart(2, "0")}</span><small>${mission.difficulty} · Click to open script</small>`;
    button.addEventListener("click", () => showScript(mission));
    grid.appendChild(button);
  });
}
function showScript(mission) {
  $("gm-mission-grid").parentElement.classList.add("hidden");
  $("gm-script-panel").classList.remove("hidden");
  $("gm-script-content").innerHTML = `
    <div class="step-label">MISSION SCRIPT</div>
    <h2>${escapeHTML(mission.title)}</h2>
    <p class="mission-meta">${escapeHTML(mission.id)} · ${escapeHTML(mission.difficulty)} · ${mission.clue_count} strengths have additional information</p>
    <div class="gm-section-label">Read aloud to players</div>
    <div class="read-aloud">${escapeHTML(mission.gm_read_aloud)}</div>
    <div class="gm-section-label">GM notes — keep private</div>
    <div class="gm-notes warning">${escapeHTML(mission.gm_notes)}</div>
    <div class="gm-section-label">Clue reference</div>
    <p class="gm-notes">If needed, use this as your private reference for the additional information assigned to each strength. Players should reveal clues by tapping their own cards.</p>
    <details>
      <summary>View all strength clues (${mission.clue_count})</summary>
      <div class="gm-clue-list">${Object.entries(mission.strength_clues).filter(([, clue]) => clue).map(([strength, clue]) => `<p><strong>${escapeHTML(strength)}:</strong> ${escapeHTML(clue)}</p>`).join("")}</div>
    </details>
  `;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
$("gm-back").addEventListener("click", () => {
  $("gm-script-panel").classList.add("hidden");
  $("gm-mission-grid").parentElement.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
initGM();
