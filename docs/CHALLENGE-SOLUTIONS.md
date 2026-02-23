# OPERATION CIPHER STRIKE - ORGANIZER SOLUTION SHEET

Confidential internal reference for event operators.
This file is aligned with seeded data in `apps/backend/prisma/seed.ts` and validation logic in `apps/backend/src/challenges/challenges.service.ts`.

## Difficulty Flow (Current)
- Round 1: Easy -> Medium -> Hard
- Round 2: Medium -> Medium -> Hard
- Round 3: Medium -> Hard -> Hard

## Round 1 - The Breach Discovery

### Level 1.1 - The Intercepted Transmission
- Difficulty: Easy
- Points: 100
- Flag: `CTF{Server.Room-ER42,East-Wing}`
- Solve outline: Base64 decode -> ROT13 transform -> reverse string.

### Level 1.2 - The Fragmented Server Map
- Difficulty: Medium
- Points: 150
- Flag: `CTF#AccessGranted`
- Solve outline:
  - Fragment A (`67 84 70 35`) -> decimal ASCII -> `CTF#`
  - Fragment B (`101 143 143 145 163 163`) -> octal ASCII -> `Access`
  - Fragment C (`Tizmgvw`) -> Atbash -> `Granted`
  - Combine -> `CTF#AccessGranted`

### Level 1.3 - The Time-Locked Vault (Team-Specific)
- Difficulty: Hard
- Points: 200
- Flag pattern: `CTF{xxxxxxxx}`
- Runtime formula:
  - Input: `teamName|2|1|CIPHER2026`
  - Hash: MD5
  - Output: first 8 lowercase hex chars

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

### Level 2.2 - The JWT Inception
- Difficulty: Medium
- Points: 300
- Flag: `CTF{RdfnC6oKbAy5cAyziD3g1DCF}`
- Solve outline: Hex -> JWT-like token -> extract secret -> final transform to credential.

### Level 2.3 - The Pattern Lock (Team-Specific)
- Difficulty: Hard
- Points: 350
- Flag pattern: `CTF{xxxxxxxx}`
- Runtime formula:
  - Input: `teamName5CIPHER2026`
  - Hash: SHA-256
  - Output: first 8 lowercase hex chars

## Round 3 - The Final Strike

### Level 3.1 - The Payload Hunt
- Difficulty: Medium
- Points: 400
- Flag: `CTF{Blackout.Feb14.Payload}`
- Solve outline: decode 4 fragments using their respective encodings and concatenate in sequence.

### Level 3.2 - The Logic Bomb Defusal
- Difficulty: Hard
- Points: 450
- Flag: `CTF{Defusal.Killswitch.Overrode}`
- Solve outline: nested multi-layer decoding from outer encoded blob to final plaintext flag.

### Level 3.3 - The Master Vault (Final Boss)
- Difficulty: Hard
- Points: 1000 (first solve can be treated as bonus in app logic/UI)
- Flag: `CTF{MASTER_a1b2c3_VAULT}`
- Solve outline: layered decoding pipeline ending with extraction of the 6-character vault code.

## Validation Notes
- Static accepted flags (backend): levels 1, 2, 4, 5, 7, 8, 9.
- Team-specific accepted flags (backend): levels 3 and 6.
- Matching is case-insensitive at submission time.
- Hint text now prioritizes DB-seeded hints before backend fallback defaults.
