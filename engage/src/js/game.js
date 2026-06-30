// game.js — Global state, Orchestrator (Module 5), Evaluator (Module 6).
import { AgentA, AgentB, AgentC, AgentD } from './modules.js';

// ---------------------------------------------------------------------------
// Global shared state. Each agent only touches its own slice of `state`.
// ---------------------------------------------------------------------------
export const state = {
    energy: 100,
    points: 0,
    gameOver: false,
    elapsedSeconds: 0,      // global game clock, ticks every 1s
    remainingSeconds: 300,  // master countdown (Module 6)

    m1: { totalTasks: 0, correct: 0, active: false },
    m2: { totalTasks: 0, correct: 0, delegated: 0, active: false },
    m3: { sequencesCorrect: 0, active: false },
};

const els = {
    timer: document.getElementById('m6-timer'),
    points: document.getElementById('m6-points'),
    energyBar: document.getElementById('m6-energy-bar'),
    energyText: document.getElementById('m6-energy-text'),
    status: document.getElementById('m6-status'),
    finalModal: document.getElementById('final-modal'),
    finalBreakdown: document.getElementById('final-breakdown'),
};

// ---------------------------------------------------------------------------
// Energy helpers — shared so every agent spends/locks energy consistently.
// ---------------------------------------------------------------------------
export function spendEnergy(amount) {
    state.energy = Math.max(0, state.energy - amount);
    renderHeader();
}

export function addPoints(amount) {
    state.points += amount;
    renderHeader();
}

export function isEnergyLocked() {
    return state.energy <= 0;
}

// Once energy hits 0 it stays locked until it climbs back above 20.
let energyLockedUntilRecharge = false;
function updateEnergyLockFlag() {
    if (state.energy <= 0) energyLockedUntilRecharge = true;
    if (energyLockedUntilRecharge && state.energy > 20) energyLockedUntilRecharge = false;
}
export function canAct() {
    return !energyLockedUntilRecharge;
}

function renderHeader() {
    updateEnergyLockFlag();
    els.points.textContent = state.points;
    els.energyBar.style.width = `${state.energy}%`;
    els.energyText.textContent = Math.round(state.energy);

    const minutes = Math.floor(state.remainingSeconds / 60);
    const seconds = state.remainingSeconds % 60;
    els.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.body.classList.toggle('energy-locked', !canAct());
}

// ---------------------------------------------------------------------------
// Module 5: The Orchestrator
// - Spawns tasks for M1/M2 at random intervals.
// - Triggers M3 exactly at each minute mark.
// - Grants passive energy regen when M1/M2/M3 are all idle.
// ---------------------------------------------------------------------------
let passiveRegenPausedUntil = 0; // elapsed-seconds timestamp; mole whacks push this out

export function pauseEnergyRegen(seconds) {
    passiveRegenPausedUntil = Math.max(passiveRegenPausedUntil, state.elapsedSeconds + seconds);
}

function scheduleNextM1Task() {
    if (state.gameOver) return;
    const delay = 15000 + Math.random() * 5000; // 15-20s
    setTimeout(() => {
        if (!state.gameOver && !state.m1.active) AgentA.startTask();
        scheduleNextM1Task();
    }, delay);
}

function scheduleNextM2Task() {
    if (state.gameOver) return;
    const delay = 15000 + Math.random() * 5000; // 15-20s
    setTimeout(() => {
        if (!state.gameOver && !state.m2.active) AgentB.startTask();
        scheduleNextM2Task();
    }, delay);
}

function orchestratorTick() {
    // M3 must fire exactly at :00 of every minute.
    if (state.elapsedSeconds % 60 === 0 && !state.m3.active) {
        AgentC.startCycle();
    }

    // Passive energy regen when no active tasks anywhere, OR when energy has
    // bottomed out to 0 even with a task present (so the player is never
    // stuck permanently locked out). Both cases respect the mole-whack pause.
    const noActiveTasks = !state.m1.active && !state.m2.active && !state.m3.active;
    const notPaused = state.elapsedSeconds >= passiveRegenPausedUntil;
    const regenAllowed = notPaused && (noActiveTasks || state.energy <= 0);
    if (regenAllowed && state.energy < 100) {
        state.energy = Math.min(100, state.energy + 10);
        renderHeader();
    }
}

// ---------------------------------------------------------------------------
// Module 6: The Evaluator — master clock + final scoring.
// ---------------------------------------------------------------------------
function masterTick() {
    if (state.gameOver) return;

    state.elapsedSeconds += 1;
    state.remainingSeconds -= 1;

    orchestratorTick();
    renderHeader();

    if (state.remainingSeconds <= 0) {
        endGame();
    }
}

function endGame() {
    state.gameOver = true;
    els.status.textContent = 'Finished';
    els.status.classList.remove('text-emerald-400');
    els.status.classList.add('text-rose-400');

    AgentA.stop();
    AgentB.stop();
    AgentC.stop();

    const baseM1 = state.m1.totalTasks * 20;
    const baseM2 = state.m2.totalTasks * 10;
    const baseM3 = (state.m3.sequencesCorrect + 1) * 10;
    const perfectTotal = baseM1 + baseM2 + baseM3;
    const actualPoints = state.points; // accumulated across M1/M2/M3 only — M4 stars cost energy, not points
    const overallPct = perfectTotal > 0 ? (actualPoints / perfectTotal) * 100 : 0;

    let level;
    if (overallPct <= 25) level = 'Level 1';
    else if (overallPct <= 50) level = 'Level 2';
    else if (overallPct <= 75) level = 'Level 3';
    else level = 'Level 4';

    els.finalBreakdown.innerHTML = `
        <p>Base M1 Potential: ${baseM1}</p>
        <p>Base M2 Potential: ${baseM2}</p>
        <p>Base M3 Potential: ${baseM3}</p>
        <p class="font-semibold text-white">Perfect Total Potential: ${perfectTotal}</p>
        <p class="font-semibold text-white">Actual Points Gathered: ${actualPoints}</p>
        <p class="text-lg font-bold text-emerald-400 mt-2">Overall Score: ${overallPct.toFixed(1)}%</p>
        <p class="text-xl font-bold text-amber-400">${level}</p>
    `;
    els.finalModal.classList.remove('hidden');
    els.finalModal.classList.add('flex');
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function init() {
    AgentA.init();
    AgentB.init();
    AgentC.init();
    AgentD.init();

    renderHeader();
    setInterval(masterTick, 1000);

    scheduleNextM1Task();
    scheduleNextM2Task();
}

init();
