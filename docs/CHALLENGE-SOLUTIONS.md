# OPERATION CIPHER STRIKE - ORGANIZER SOLUTION SHEET

Confidential internal reference for event operators.
This file is aligned with seeded data in `apps/backend/prisma/seed.ts` and validation logic in `apps/backend/src/challenges/challenges.service.ts`.

## Difficulty Flow (Current)
- Round 1: Medium -> Medium -> Hard
- Round 2: Medium -> Medium -> Hard
- Round 3: Medium -> Hard -> Hard

## Flow Continuity (Authoritative)
- Progression is strictly linear: teams must solve current level before next level unlocks.
- Level path is fixed: 1.1 -> 1.2 -> 1.3 -> 2.1 -> 2.2 -> 2.3 -> 3.1 -> 3.2 -> 3.3.
- Hard levels use two hint tiers in-app (tiered penalties by round); hints are intentionally progressive, not direct answers.

## Round 1 - The Breach Discovery

### Level 1.1 - The Intercepted Transmission
- Difficulty: Medium
- Points: 100
- Flag: `CTF{Server.Room-ER42,East-Wing}`
- Solve outline: Base64 decode -> ROT13 transform -> reverse string.
- Player hint (non-spoiler): Identify encoding from character set and `=` padding, then re-check if output is still transformed.
- Operator tip: If teams stall, prompt them to look for a final string reversal after readable words begin to appear.

### Level 1.2 - The Fragmented Server Map
- Difficulty: Medium
- Points: 150
- Flag: `CTF#AccessGranted`
- Solve outline:
  - Fragment A (`67 84 70 35`) -> decimal ASCII -> `CTF#`
  - Fragment B (`101 143 143 145 163 163`) -> octal ASCII -> `Access`
  - Fragment C (`Tizmgvw`) -> Atbash -> `Granted`
  - Combine -> `CTF#AccessGranted`
- Player hint (non-spoiler): Decode each fragment independently first; combine only after all three are plain text.
- Operator tip: Remind teams to preserve fragment order A -> B -> C.

### Level 1.3 - The Time-Locked Vault (Team-Specific)
- Difficulty: Hard
- Points: 200
- Flag pattern: `CTF{xxxxxxxx}`
- Runtime formula:
  - Input: `teamName|2|1|HACKTHEBOX2026`
  - Hash: MD5
  - Output: first 8 lowercase hex chars
- Player hint (non-spoiler): Team name is part of a deterministic hash input; separators and order must be exact.
- Operator tip: Most failures come from team name mismatch (spacing/case) or wrong delimiter placement; nudge teams to verify the exact input string before hashing.

## Round 2 - Infiltration

### Level 2.1 - The Corrupted Hash Trail
- Difficulty: Medium
- Points: 250
- Flag: `CTF{pas+dra+mon+42}`
- Solve outline:
  - Alpha hash -> `password`
  - Beta hash -> `dragon`
  - Gamma hash -> `monkey`
  - Build flag with first 3 chars of each + `42`
- Player hint (non-spoiler): Use hash length to identify likely algorithms, then crack each hash separately.
- Operator tip: If needed, suggest focusing on common-word passwords before custom brute-force.

### Level 2.2 - The JWT Inception
- Difficulty: Medium
- Points: 300
- Flag: `CTF{RdfnC6oKbAy5cAyziD3g1DCF}`
- Solve outline: Hex -> JWT-like token -> extract secret -> final transform to credential.
- Player hint (non-spoiler): Decode outer hex first, then inspect token sections split by `.`.
- Operator tip: If teams reach readable token fields but no flag, hint one additional transformation on the credential value.

### Level 2.3 - The Pattern Lock (Team-Specific)
- Difficulty: Hard
- Points: 350
- Flag pattern: `CTF{xxxxxxxx}`
- Runtime formula:
  - Input: `teamName5HACKTHEBOX2026`
  - Hash: SHA-256
  - Output: first 8 lowercase hex chars
- Player hint (non-spoiler): This is also team-specific; construct the exact team-bound input before hashing.
- Operator tip: Remind teams this level has no separators in the input string and requires SHA-256.

## Round 3 - The Final Strike

### Level 3.1 - The Payload Hunt
- Difficulty: Medium
- Points: 400
- Flag: `CTF{Blackout.Feb14.Payload}`
- Solve outline: decode 4 fragments using their respective encodings and concatenate in sequence.
- Player hint (non-spoiler): Each fragment uses a different representation; decode independently, then merge by fragment index.
- Operator tip: Encourage teams to verify each fragment yields meaningful partial text before combining.

### Level 3.2 - The Logic Bomb Defusal
- Difficulty: Hard
- Points: 450
- Flag: `CTF{Defusal.Killswitch.Overrode}`
- Solve outline: nested multi-layer decoding from outer encoded blob to final plaintext flag.
- Player hint (non-spoiler): Work one decode layer at a time and reassess output type after each pass.
- Operator tip: If they are guessing randomly, redirect them to pattern-based decoding order and intermediate validation.

### Level 3.3 - The Master Vault (Final Boss)
- Difficulty: Hard
- Points: 1000 (first solve can be treated as bonus in app logic/UI)
- Flag: `CTF{MASTER_a1b2c3_VAULT}`
- Solve outline: layered decoding pipeline ending with extraction of the 6-character vault code.
- Required artifact endpoint (served by backend static assets): `/public/challenges/master-vault.html`
- Access note (recommended for players): open on frontend host directly (example: `http://<frontend-host>:<frontend-port>/public/challenges/master-vault.html`) because frontend rewrites this route to backend static assets.
- Fallback direct backend URL: `http://<backend-host>:<backend-port>/public/challenges/master-vault.html`.
- Player hint (non-spoiler): Reuse techniques from earlier levels as a full decoding pipeline.
- Operator tip: Advise teams to keep intermediate outputs and only finalize once vault code extraction is unambiguous.

## Validation Notes
- Static accepted flags (backend): levels 1, 2, 4, 5, 7, 8, 9.
- Team-specific accepted flags (backend): levels 3 and 6.
- Matching is case-insensitive at submission time.
- Hint text now prioritizes DB-seeded hints before backend fallback defaults.
