# VIA Quest — Starter Web Prototype

A mobile-first, static website prototype for the VIA strengths cooperative mission game.

## Pages
- `player.html` — player flow: choose virtue category → choose strength → lock choice → choose mission → tap card to reveal mission-specific clue → end round.
- `gm.html` — GM mission list and read-aloud scripts, with private notes and clue reference.
- `data/missions.json` — mission content and strength-specific clues.
- `assets/cards/` — put your designed strength-card PNGs here.

## Card image filenames
Card PNG files should be **200 × 300 px** and named exactly after the VIA strength, followed by `.png`. Examples:

- `assets/cards/Creativity.png`
- `assets/cards/Love of Learning.png`
- `assets/cards/Appreciation of Beauty and Excellence.png`

All 24 expected filenames are listed below:
- `assets/cards/Creativity.png`
- `assets/cards/Curiosity.png`
- `assets/cards/Judgment.png`
- `assets/cards/Love of Learning.png`
- `assets/cards/Perspective.png`
- `assets/cards/Bravery.png`
- `assets/cards/Perseverance.png`
- `assets/cards/Honesty.png`
- `assets/cards/Zest.png`
- `assets/cards/Love.png`
- `assets/cards/Kindness.png`
- `assets/cards/Social Intelligence.png`
- `assets/cards/Teamwork.png`
- `assets/cards/Fairness.png`
- `assets/cards/Leadership.png`
- `assets/cards/Forgiveness.png`
- `assets/cards/Humility.png`
- `assets/cards/Prudence.png`
- `assets/cards/Self-Regulation.png`
- `assets/cards/Appreciation of Beauty and Excellence.png`
- `assets/cards/Gratitude.png`
- `assets/cards/Hope.png`
- `assets/cards/Humour.png`
- `assets/cards/Spirituality.png`

If a card PNG is not present yet, the player page displays a styled fallback card. Add your own artwork files later; no code changes are needed as long as filenames match.

## Run locally
Because the pages load `data/missions.json` with `fetch`, do not open the HTML files directly using a `file://` URL. Run a local static server from this folder, for example:

```bash
python -m http.server 8000
```

Then open:
- Player: `http://localhost:8000/player.html`
- GM: `http://localhost:8000/gm.html`

You can also host the folder using GitHub Pages.

## Important prototype limitations
- This is a static prototype. Each phone runs its own independent player session.
- The GM chooses the matching mission number manually after the team chooses it on their phones.
- There is no shared room, real-time sync, account system, or server-side authentication yet.
- `gm.html` is a separate page for convenience, **not secure access control**. Because this is a static site, the GM content and JSON can be inspected by anyone who can access the published files. If the game will be public and the GM scripts must be protected, add a backend/authenticated GM endpoint before publishing.
- Players can choose any strength; this prototype does not validate survey results.
