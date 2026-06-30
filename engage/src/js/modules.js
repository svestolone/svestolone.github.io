// modules.js — Agents A-D managing Modules 1-4. Each agent owns its own
// DOM refs, timers, and state slice (state.m1 / state.m2 / state.m3) so they
// never collide with one another.
import { state, spendEnergy, addPoints, canAct, pauseEnergyRegen } from './game.js';

function randomQuestion() {
    const a = Math.floor(Math.random() * 40) + 1;
    const b = Math.floor(Math.random() * 40) + 1;
    return { a, b, answer: a + b };
}

// ===========================================================================
// Agent A — Module 1: Urgent & Important
// ===========================================================================
export const AgentA = {
    els: {},
    timerInterval: null,
    timeLeft: 0,
    question: null,
    attempted: false,

    init() {
        this.els = {
            panel: document.getElementById('m1-panel'),
            timer: document.getElementById('m1-timer'),
            task: document.getElementById('m1-task'),
            idle: document.getElementById('m1-idle'),
            question: document.getElementById('m1-question'),
            input: document.getElementById('m1-input'),
            submit: document.getElementById('m1-submit'),
            score: document.getElementById('m1-score'),
        };
        this.els.submit.addEventListener('click', () => this.submit());
    },

    startTask() {
        state.m1.active = true;
        this.attempted = false;
        this.question = randomQuestion();
        this.timeLeft = 10;

        this.els.question.textContent = `${this.question.a} + ${this.question.b} = ?`;
        this.els.input.value = '';
        this.els.task.classList.remove('hidden');
        this.els.idle.classList.add('hidden');
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) this.expire();
        }, 1000);
    },

    updateTimerDisplay() {
        this.els.timer.textContent = `${this.timeLeft}s`;
    },

    submit() {
        if (!canAct() || !state.m1.active) return;
        this.attempted = true;
        spendEnergy(20);

        const value = parseInt(this.els.input.value, 10);
        const correct = value === this.question.answer;
        this.resolve(correct);
    },

    expire() {
        if (!state.m1.active) return;
        // No deduction to energy if the player never attempted; points still penalized.
        this.resolve(false);
    },

    resolve(correct) {
        clearInterval(this.timerInterval);
        state.m1.totalTasks += 1;
        if (correct) {
            state.m1.correct += 1;
            addPoints(20);
        } else {
            addPoints(-20);
        }
        this.els.score.textContent = `Correct: ${state.m1.correct} / Total Tasks: ${state.m1.totalTasks}`;
        state.m1.active = false;
        this.els.task.classList.add('hidden');
        this.els.idle.classList.remove('hidden');
        this.els.timer.textContent = '';
    },

    stop() {
        clearInterval(this.timerInterval);
    },
};

// ===========================================================================
// Agent B — Module 2: Urgent & Not Important
// ===========================================================================
export const AgentB = {
    els: {},
    timerInterval: null,
    timeLeft: 0,
    question: null,

    init() {
        this.els = {
            panel: document.getElementById('m2-panel'),
            timer: document.getElementById('m2-timer'),
            task: document.getElementById('m2-task'),
            idle: document.getElementById('m2-idle'),
            question: document.getElementById('m2-question'),
            input: document.getElementById('m2-input'),
            submit: document.getElementById('m2-submit'),
            delegate: document.getElementById('m2-delegate'),
            score: document.getElementById('m2-score'),
        };
        this.els.submit.addEventListener('click', () => this.submit());
        this.els.delegate.addEventListener('click', () => this.delegate());
    },

    startTask() {
        state.m2.active = true;
        this.question = randomQuestion();
        this.timeLeft = 10;

        this.els.question.textContent = `${this.question.a} + ${this.question.b} = ?`;
        this.els.input.value = '';
        this.els.task.classList.remove('hidden');
        this.els.idle.classList.add('hidden');
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) this.expire();
        }, 1000);
    },

    updateTimerDisplay() {
        this.els.timer.textContent = `${this.timeLeft}s`;
    },

    submit() {
        if (!canAct() || !state.m2.active) return;
        spendEnergy(20);
        const value = parseInt(this.els.input.value, 10);
        const correct = value === this.question.answer;
        this.resolve(correct ? 'correct' : 'wrong');
    },

    delegate() {
        if (!canAct() || !state.m2.active) return;
        this.resolve('delegated');
    },

    expire() {
        if (!state.m2.active) return;
        this.resolve('expired');
    },

    resolve(outcome) {
        clearInterval(this.timerInterval);
        state.m2.totalTasks += 1;

        if (outcome === 'delegated') {
            state.m2.delegated += 1;
            addPoints(10);
        } else if (outcome === 'correct') {
            state.m2.correct += 1;
            addPoints(20);
        } else {
            // 'wrong' or 'expired'
            addPoints(-20);
        }

        this.els.score.textContent =
            `Delegated: ${state.m2.delegated} / Correct: ${state.m2.correct} / Total Tasks: ${state.m2.totalTasks}`;
        state.m2.active = false;
        this.els.task.classList.add('hidden');
        this.els.idle.classList.remove('hidden');
        this.els.timer.textContent = '';
    },

    stop() {
        clearInterval(this.timerInterval);
    },
};

// ===========================================================================
// Agent C — Module 3: Not Urgent & Important (Simon-says sequence)
// ===========================================================================
const SIMON_COLORS = ['red', 'yellow', 'green', 'blue'];
const MAX_SEQUENCE_LENGTH = 8;

export const AgentC = {
    els: {},
    squareEls: {},
    cycleTimeout: null,
    cycleTimer: null,
    cycleTimeLeft: 0,
    sequence: [],
    playerStep: 0,
    accepting: false,
    attemptedThisCycle: false,

    init() {
        this.els = {
            panel: document.getElementById('m3-panel'),
            timer: document.getElementById('m3-timer'),
            task: document.getElementById('m3-task'),
            idle: document.getElementById('m3-idle'),
            indicator: document.getElementById('m3-indicator'),
            message: document.getElementById('m3-message'),
            score: document.getElementById('m3-score'),
        };
        document.querySelectorAll('.simon-square').forEach((btn) => {
            this.squareEls[btn.dataset.color] = btn;
            btn.addEventListener('click', () => this.handlePlayerClick(btn.dataset.color));
        });
        this.sequence = [];
    },

    // Called by the orchestrator exactly at each minute mark.
    startCycle() {
        state.m3.active = true;
        this.cycleTimeLeft = 20;
        this.attemptedThisCycle = false;
        this.els.task.classList.remove('hidden');
        this.els.idle.classList.add('hidden');
        this.els.message.textContent = '';
        this.updateCycleTimerDisplay();

        if (this.sequence.length === 0) {
            this.sequence = [this.randomColor()];
        }

        this.cycleTimer = setInterval(() => {
            this.cycleTimeLeft -= 1;
            this.updateCycleTimerDisplay();
            if (this.cycleTimeLeft <= 0) this.endCycle();
        }, 1000);

        this.playSequence();
    },

    updateCycleTimerDisplay() {
        this.els.timer.textContent = `${this.cycleTimeLeft}s`;
    },

    randomColor() {
        return SIMON_COLORS[Math.floor(Math.random() * SIMON_COLORS.length)];
    },

    setIndicator(mode) {
        const el = this.els.indicator;
        el.classList.remove('bg-red-600', 'bg-green-600', 'text-white');
        if (mode === 'playing') {
            el.textContent = 'AGENT PLAYING - DO NOT PRESS';
            el.classList.add('bg-red-600', 'text-white');
        } else {
            el.textContent = 'YOUR TURN - REPEAT PATTERN';
            el.classList.add('bg-green-600', 'text-white');
        }
    },

    playSequence() {
        if (!state.m3.active) return;
        this.accepting = false;
        this.setIndicator('playing');
        this.playerStep = 0;

        this.sequence.forEach((color, i) => {
            setTimeout(() => {
                if (!state.m3.active) return;
                this.flashSquare(color);
                if (i === this.sequence.length - 1) {
                    setTimeout(() => {
                        if (!state.m3.active) return;
                        this.accepting = true;
                        this.setIndicator('turn');
                    }, 600);
                }
            }, i * 800);
        });
    },

    flashSquare(color) {
        const btn = this.squareEls[color];
        btn.classList.add('simon-flash');
        setTimeout(() => btn.classList.remove('simon-flash'), 500);
    },

    handlePlayerClick(color) {
        if (!canAct() || !state.m3.active || !this.accepting) return;

        if (!this.attemptedThisCycle) {
            this.attemptedThisCycle = true;
            spendEnergy(20);
        }

        this.flashSquare(color);

        if (color === this.sequence[this.playerStep]) {
            this.playerStep += 1;
            if (this.playerStep === this.sequence.length) {
                // Full sequence matched — points scale with sequence level (level N = N*10 pts).
                addPoints(this.sequence.length * 10);
                state.m3.sequencesCorrect += 1;
                this.els.score.textContent = `Sequences Correct: ${state.m3.sequencesCorrect}`;
                this.accepting = false;
                if (this.sequence.length < MAX_SEQUENCE_LENGTH) {
                    this.sequence.push(this.randomColor());
                }
                setTimeout(() => this.playSequence(), 800);
            }
        } else {
            this.accepting = false;
            this.els.message.textContent = 'WRONG!';
            setTimeout(() => {
                this.els.message.textContent = '';
                this.playSequence();
            }, 1000);
        }
    },

    endCycle() {
        clearInterval(this.cycleTimer);
        state.m3.active = false;
        this.els.task.classList.add('hidden');
        this.els.idle.classList.remove('hidden');
        this.els.timer.textContent = '';
        // Sequence/state is preserved on `this.sequence` for the next cycle.
    },

    stop() {
        clearInterval(this.cycleTimer);
        clearTimeout(this.cycleTimeout);
    },
};

// ===========================================================================
// Agent D — Module 4: Whack-A-Mole (free play, always available)
// ===========================================================================
export const AgentD = {
    holes: [],
    credits: 0,
    stars: 0,
    whackedTotal: 0,
    spawnTimeout: null,
    activeHole: null,
    moleVisibleTimeout: null,

    init() {
        this.holes = Array.from(document.querySelectorAll('.mole-hole'));
        this.scoreEl = document.getElementById('m4-score');
        this.holes.forEach((hole) => {
            hole.addEventListener('click', () => this.whack(hole));
        });
        this.scheduleSpawn();
    },

    scheduleSpawn() {
        const delay = 800 + Math.random() * 1200;
        this.spawnTimeout = setTimeout(() => this.spawnMole(), delay);
    },

    spawnMole() {
        if (state.gameOver) return;
        // Clear any currently-up mole first.
        if (this.activeHole) {
            this.activeHole.classList.remove('mole-up');
        }
        const hole = this.holes[Math.floor(Math.random() * this.holes.length)];
        this.activeHole = hole;
        hole.classList.add('mole-up');
        hole.dataset.whackable = 'true';

        this.moleVisibleTimeout = setTimeout(() => {
            hole.classList.remove('mole-up');
            hole.dataset.whackable = 'false';
            if (this.activeHole === hole) this.activeHole = null;
            // A missed mole breaks the consecutive-hit streak — no star without 5 in a row.
            this.credits = 0;
            this.scoreEl.textContent = `Whacked: ${this.credits} / 4  |  Stars: ${this.stars}`;
            this.scheduleSpawn();
        }, 1500);
    },

    whack(hole) {
        if (!canAct()) return;

        // Every click on Module 4 costs energy and delays passive regen — no
        // achievement points are ever awarded from this module.
        spendEnergy(5);
        pauseEnergyRegen(5);

        if (hole.dataset.whackable !== 'true') return; // missed click, mole already gone

        hole.classList.remove('mole-up');
        hole.dataset.whackable = 'false';
        clearTimeout(this.moleVisibleTimeout);
        if (this.activeHole === hole) this.activeHole = null;

        this.whackedTotal += 1;
        this.credits += 1;

        if (this.credits >= 5) {
            this.credits = 0;
            this.stars += 1;
        }

        this.scoreEl.textContent = `Whacked: ${this.credits} / 4  |  Stars: ${this.stars}`;
        this.scheduleSpawn();
    },
};
