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
- Tools:
  - CyberChef (From Base64, ROT13, Reverse)
  - dcode.fr Base64 Decoder (optional)
- Steps:
  1) Identify Base64 by `=` padding and limited charset.
  2) Decode Base64 to text.
  3) Apply ROT13 to the decoded text.
  4) Reverse the final string to get the flag.
- Player hint (non-spoiler): Identify encoding from character set and `=` padding, then re-check if output is still transformed.
- Operator tip: If teams stall, prompt them to look for a final string reversal after readable words begin to appear.

### Level 1.2 - The Fragmented Server Map
- Difficulty: Medium
- Points: 150
- Flag: `CTF#AccessGranted`
- Tools:
  - CyberChef (From Decimal, From Octal, Atbash)
  - dcode.fr (ASCII, Atbash)
- Steps:
  1) Fragment A: treat numbers as decimal ASCII codes -> decode to `CTF#`.
  2) Fragment B: treat numbers as octal ASCII codes -> decode to `Access`.
  3) Fragment C: apply Atbash -> decode to `Granted`.
  4) Concatenate A + B + C exactly in order.
- Player hint (non-spoiler): Decode each fragment independently first; combine only after all three are plain text.
- Operator tip: Remind teams to preserve fragment order A -> B -> C.

### Level 1.3 - The Time-Locked Vault (Team-Specific)
- Difficulty: Hard
- Points: 200
- Flag pattern: `CTF{xxxxxxxx}`
- Tools:
  - CyberChef (MD5)
  - Hashcalc / MD5 Online (any MD5 calculator)
- Steps:
  1) Build the exact input string: `teamName|2|1|HACKTHEBOX2026`.
  2) Hash with MD5.
  3) Take the first 8 lowercase hex characters.
  4) Submit as `CTF{xxxxxxxx}`.
- Player hint (non-spoiler): Team name is part of a deterministic hash input; separators and order must be exact.
- Operator tip: Most failures come from team name mismatch (spacing/case) or wrong delimiter placement; nudge teams to verify the exact input string before hashing.

## Round 2 - Infiltration

### Level 2.1 - The Corrupted Hash Trail
- Difficulty: Medium
- Points: 250
- Flag: `CTF{pas+dra+mon+42}`
- Tools:
  - CrackStation (hash lookup)
  - Hashes.com (hash lookup)
  - Hashcat or John the Ripper (local cracking)
- Steps:
  1) Identify hash types by length: 32 hex = MD5, 40 hex = SHA-1, 64 hex = SHA-256.
  2) Crack each hash using common wordlists (rockyou.txt).
  3) Take first 3 letters of each cracked password in order Alpha, Beta, Gamma.
  4) Append `42`, format as `CTF{pas+dra+mon+42}`.
- Player hint (non-spoiler): Use hash length to identify likely algorithms, then crack each hash separately.
- Operator tip: If needed, suggest focusing on common-word passwords before custom brute-force.

### Level 2.2 - The JWT Inception
- Difficulty: Medium
- Points: 300
- Flag: `CTF{RdfnC6oKbAy5cAyziD3g1DCF}`
- Tools:
  - CyberChef (From Hex, Reverse)
  - jwt.io (JWT decode)
- Steps:
  1) Decode the hex blob to text (CyberChef: From Hex).
  2) You will get a JWT-like token with 3 parts separated by `.`.
  3) Decode the payload (middle part) with jwt.io to extract the `secret` value.
  4) Apply the final transform (reverse the string) to get the credential.
  5) Wrap in `CTF{...}`.
- Player hint (non-spoiler): Decode outer hex first, then inspect token sections split by `.`.
- Operator tip: If teams reach readable token fields but no flag, hint one additional transformation on the credential value.

### Level 2.3 - The Pattern Lock (Team-Specific)
- Difficulty: Hard
- Points: 350
- Flag pattern: `CTF{xxxxxxxx}`
- Tools:
  - CyberChef (SHA-256)
  - Any SHA-256 calculator
- Steps:
  1) Build the exact input string: `teamName5HACKTHEBOX2026` (no separators).
  2) Hash with SHA-256.
  3) Take the first 8 lowercase hex characters.
  4) Submit as `CTF{xxxxxxxx}`.
- Player hint (non-spoiler): This is also team-specific; construct the exact team-bound input before hashing.
- Operator tip: Remind teams this level has no separators in the input string and requires SHA-256.

## Round 3 - The Final Strike

### Level 3.1 - The Payload Hunt
- Difficulty: Medium
- Points: 400
- Flag: `CTF{Blackout.Feb14.Payload}`
- Tools:
  - CyberChef (From Binary, From Hex, From Base64, ROT13)
- Steps:
  1) Fragment 1: Binary -> text.
  2) Fragment 2: Hex -> text.
  3) Fragment 3: Base64 -> text.
  4) Fragment 4: ROT13 -> text.
  5) Concatenate fragments in order 1, 2, 3, 4 to get the flag.
- Player hint (non-spoiler): Each fragment uses a different representation; decode independently, then merge by fragment index.
- Operator tip: Encourage teams to verify each fragment yields meaningful partial text before combining.

### Level 3.2 - The Logic Bomb Defusal
- Difficulty: Hard
- Points: 450
- Flag: `CTF{Defusal.Killswitch.Overrode}`
- Tools:
  - CyberChef (From Hex, From Base64, From Binary)
- Steps:
  1) Decode the outer hex string -> yields Base64.
  2) Decode Base64 -> yields space-separated binary.
  3) Decode binary -> yields plaintext flag.
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
- Tools:
  - CyberChef (From Hex, From Base64, ROT13)
  - jwt.io (JWT decode)
- Steps:
  1) Layer 1: Decode the hex string -> JWT string. Paste into Layer 1 input.
  2) Layer 2: Take the JWT payload (middle segment) and submit it as the Layer 2 input.
  3) Layer 3: Decode the JWT payload JSON and extract `vault_key`.
  4) Layer 4: Apply ROT13 to `vault_key` to get coordinates. Submit coordinates.
  5) Layer 5: Use the coordinates and prior layer data to derive the 6-character code. Submit the code to reveal the final flag.
- Player hint (non-spoiler): Reuse techniques from earlier levels as a full decoding pipeline.
- Operator tip: Advise teams to keep intermediate outputs and only finalize once vault code extraction is unambiguous.

## Validation Notes
- Static accepted flags (backend): levels 1, 2, 4, 5, 7, 8, 9.
- Team-specific accepted flags (backend): levels 3 and 6.
- Matching is case-insensitive at submission time.
- Hint text now prioritizes DB-seeded hints before backend fallback defaults.
