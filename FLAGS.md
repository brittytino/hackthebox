# CTF Challenges - Flag List

This document lists all the flags for testing the HackTheBox challenges.

## 🔴 Round 1: The Breach Discovery

### Level 1.1: The Intercepted Transmission
**Flag:** `CTF{Server.Room-ER42,East-Wing}`

### Level 1.2: The Fragmented Server Map
**Flag:** `CTF#AccessGranted`

### Level 1.3: The Time-Locked Vault (Dynamic)
This challenge calculates the flag based on your team details.
**Formula:** `MD5(teamName + "|" + memberCount + "|" + currentRound + "|" + salt)`
- `memberCount` defaults to `2`
- `currentRound` defaults to `1`
- `salt` is fixed as `"CIPHER2026"`

**How to solve manually for testing:**
1. Get your Team Name from the dashboard.
2. String to hash: `YourTeamName|2|1|CIPHER2026`
3. Generate MD5 hash.
4. Flag: `CTF{first_8_chars_of_hash}` (lowercase)

*Example:* If team name is "Team1", string is "Team1|2|1|CIPHER2026". MD5 might be `e32...`. Flag: `CTF{e32...}`.

---

## 🟡 Round 2: Infiltration

### Level 2.1: The Corrupted Hash Trail
**Flag:** `CTF{pas+pas+pas+42}`

### Level 2.2: The JWT Inception
**Flag:** `CTF{RdfnC6oKbAy5cAyziD3g1DCF}`

### Level 2.3: The Pattern Lock (Dynamic)
This challenge uses a team-specific pattern lock.
**Formula:** `SHA256(teamName + "5" + "CIPHER2026")`
- `5` represents challenges solved so far.
- `salt` is `"CIPHER2026"`.

**How to solve manually for testing:**
1. Get your Team Name.
2. String to hash: `YourTeamName5CIPHER2026`
3. Generate SHA-256 hash.
4. Flag: `CTF{first_8_chars_of_hash}` (lowercase)

---

## 🔴 Round 3: The Final Strike

### Level 3.1: The Payload Hunt
**Flag:** `CTF{Blackout.Feb14.Payload}`

### Level 3.2: The Logic Bomb Defusal
**Flag:** `CTF{Defusal.Killswitch.Overrode}`

### Level 3.3: The Master Vault
**Flag:** `CTF{MASTER_a1b2c3_VAULT}`
*(Note: describing the calculation in the challenge text, but the seed data uses this static flag for validation)*
