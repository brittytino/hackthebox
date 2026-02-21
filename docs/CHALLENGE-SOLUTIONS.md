# 🎯 OPERATION CIPHER STRIKE - CHALLENGE SOLUTIONS GUIDE

## 📋 Overview
This document contains solutions for all 9 challenges. **KEEP THIS CONFIDENTIAL - FOR ORGANIZERS ONLY**

All cipher data below matches EXACTLY what is seeded in `prisma/seed.ts`.

---

## 🔴 ROUND 1: THE BREACH DISCOVERY

### Level 1.1: The Intercepted Transmission
**Difficulty:** Easy | **Points:** 100 | **Type:** Triple-layer decryption

**Cipher:**
```
dGF2Si1nZm5SLDI0RVItemJiRS5lcmllckY=
```

**Solution Process:**
1. **Base64 Decode:** → `tavJ-gfnR,24ER-zbbE.erierF`
2. **ROT13 Decode:** → `gniW-tsaE,24RE-mooR.revreS`
3. **Reverse String:** → `Server.Room-ER42,East-Wing`

**Flag:** `CTF{Server.Room-ER42,East-Wing}`

---

### Level 1.2: The Fragmented Server Map
**Difficulty:** Medium | **Points:** 150 | **Type:** Multi-encoding fragments

**Fragment A** — Hexadecimal:
```
43544623
```
→ `43`=C, `54`=T, `46`=F, `23`=# → **`CTF#`**

**Fragment B** — Binary (8-bit ASCII):
```
01000001 01100011 01100011 01100101 01110011 01110011
```
→ 0x41=A, 0x63=c, 0x63=c, 0x65=e, 0x73=s, 0x73=s → **`Access`**

**Fragment C** — Caesar Cipher (shift 7):
```
Nyhualk
```
→ N-7=G, y-7=r, h-7=a, u-7=n, a-7=t, l-7=e, k-7=d → **`Granted`**

**Combined:** `CTF#` + `Access` + `Granted`

**Flag:** `CTF#AccessGranted`

---

### Level 1.3: The Time-Locked Vault
**Difficulty:** Hard | **Points:** 200 | **Type:** Team-specific MD5

**Formula:**
```
Input:  {teamName}|2|1|CIPHER2026
Hash:   MD5(input)
Code:   first 8 lowercase hex characters
```

**Example (Team "AlphaSquad"):**
```
Input:  AlphaSquad|2|1|CIPHER2026
MD5:    (compute with any MD5 tool)
First 8 chars → submit as CTF{xxxxxxxx}
```

**Backend Validation:** `challenges.service.ts → calculateTeamSpecificFlag()` computes `MD5(teamName|2|1|CIPHER2026)` and compares first 8 chars.

**Flag:** `CTF{<team-specific-8-hex-chars>}` (unique per team)

---

## 🟡 ROUND 2: INFILTRATION

### Level 2.1: The Corrupted Hash Trail
**Difficulty:** Medium | **Points:** 250 | **Type:** Hash cracking

**Hash Alpha** (32 chars = MD5):
```
5f4dcc3b5aa765d61d8327deb882cf99
```
→ Cracks to: **`password`**

**Hash Beta** (40 chars = SHA-1):
```
5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
```
→ Cracks to: **`password`**

**Hash Gamma** (64 chars = SHA-256):
```
5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
```
→ Cracks to: **`password`**

All three resolve to the same well-known password. First 3 letters of each: `pas` + `pas` + `pas` + `42`

**Flag:** `CTF{pas+pas+pas+42}`

**Tools:** CrackStation, Hashcat, John the Ripper, or any online hash lookup.

---

### Level 2.2: The JWT Inception
**Difficulty:** Hard | **Points:** 300 | **Type:** Hex → JWT → Reverse

**Hex Token:**
```
65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e
65794a7a5a574e795a5851694f694a47513051785a7a4e456158703551574d316555466953
3238325132356d5a46496966512e62576c7a63326c766267
```
(No line breaks in actual data — shown wrapped for readability)

**Solution Process:**
1. **Hex → ASCII:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQiOiJGQ0QxZzNEaXp5QWM1eUFiS282Q25mZFIifQ.bWlzc2lvbg
   ```
   This is a JWT (three dot-separated Base64 sections).

2. **JWT Payload (middle section) Base64 decode:**
   ```
   eyJzZWNyZXQiOiJGQ0QxZzNEaXp5QWM1eUFiS282Q25mZFIifQ
   ```
   → `{"secret":"FCD1g3DizyAc5yAbKo6CnfdR"}`

3. **Extract secret:** `FCD1g3DizyAc5yAbKo6CnfdR`

4. **Reverse:** `RdfnC6oKbAy5cAyziD3g1DCF`

**Flag:** `CTF{RdfnC6oKbAy5cAyziD3g1DCF}`

---

### Level 2.3: The Pattern Lock
**Difficulty:** Hard | **Points:** 350 | **Type:** Team-specific SHA-256

**Formula:**
```
Input:  {teamName}5CIPHER2026      (no separators)
Hash:   SHA-256(input)
Code:   first 8 lowercase hex characters
```

**Example (Team "AlphaSquad"):**
```
Input:  AlphaSquad5CIPHER2026
SHA256: (compute with any SHA-256 tool)
First 8 chars → submit as CTF{xxxxxxxx}
```

**Backend Validation:** `challenges.service.ts → calculateTeamSpecificFlag()` computes `SHA256(teamName + "5" + "CIPHER2026")` first 8 chars.

**Flag:** `CTF{<team-specific-8-hex-chars>}` (unique per team)

---

## 🔴 ROUND 3: THE FINAL STRIKE

### Level 3.1: The Payload Hunt
**Difficulty:** Hard | **Points:** 400 | **Type:** Multi-fragment decoding

**Fragment 1** — Binary (8-bit ASCII):
```
01000011 01010100 01000110 01111011
```
→ 0x43=C, 0x54=T, 0x46=F, 0x7B={ → **`CTF{`**

**Fragment 2** — Hexadecimal:
```
426c61636b6f75742e
```
→ B,l,a,c,k,o,u,t,. → **`Blackout.`**

**Fragment 3** — Base64:
```
RmViMTQu
```
→ **`Feb14.`**

**Fragment 4** — ROT13:
```
Cnlybnq}
```
→ C→P, n→a, l→y, y→l, b→o, n→a, q→d, }→} → **`Payload}`**

**Combined:** `CTF{` + `Blackout.` + `Feb14.` + `Payload}`

**Flag:** `CTF{Blackout.Feb14.Payload}`

---

### Level 3.2: The Logic Bomb Defusal
**Difficulty:** Hard | **Points:** 450 | **Type:** Multi-layer nested decryption

**Cipher:** Long hex blob (see seed.ts for full data)

**Solution Process:**
1. **Hex → ASCII:** Produces a Base64 string
2. **Base64 → Text:** Produces 8-digit binary groups (space-separated)
3. **Binary → ASCII:** Each 8-bit group converts to an ASCII character

The final decoded output is the complete flag string.

**Flag:** `CTF{Defusal.Killswitch.Overrode}`

**Note:** The ROT13 step in the original chain is a no-op/red herring since binary strings contain only digits (0, 1) and spaces, which ROT13 does not affect.

---

### Level 3.3: The Master Vault (FINAL BOSS)
**Difficulty:** Hard | **Points:** 1000 (2x for first team) | **Type:** Multi-layer vault

**Hex Data:**
```
65794a306232746c62694936496d5635536d686952324e7054326c4b535656365354646f
61556c7a535735534e574e4453545a4a61334259566b4e4b4f53356c65556f7957566857
633252474f584a615747747054326c4b645531584f486c6a524531705a6c4575596c6447
656d5248566e6b6966513d3d
```
(No line breaks in actual data — shown wrapped for readability)

**Solution Process:**
1. **Hex → ASCII:**
   ```
   eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNESTZJa3BYVkNKOS5leUoyWVhWc2RGOXJaWGtpT2lKdU1XOHljRE1pZlEuYldGemRHVnkifQ==
   ```

2. **Base64 → JSON:**
   ```json
   {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YXVsdF9rZXkiOiJuMW8ycDMifQ.bWFzdGVyeQ=="}
   ```

3. **Extract JWT** from `token` field:
   - Header: `{"alg":"HS256","typ":"JWT"}`
   - **Payload:** `{"vault_key":"n1o2p3"}`
   - Signature: `mastery`

4. **ROT13 decode** `vault_key`:
   ```
   n→a, 1→1, o→b, 2→2, p→c, 3→3
   ```
   → **`a1b2c3`**

5. **Format:** `CTF{MASTER_a1b2c3_VAULT}`

**Flag:** `CTF{MASTER_a1b2c3_VAULT}`

---

## 🛠️ Recommended Tools

| Category | Tools |
|----------|-------|
| Multi-tool | CyberChef (gchq.github.io/CyberChef/) |
| Hash Cracking | CrackStation, Hashcat, John the Ripper |
| JWT Decode | jwt.io |
| Encoding | Base64Decode.org, RapidTables |
| ROT13 | rot13.com |

---

## 📊 Scoring Summary

| Level | Challenge | Points | Difficulty | Flag Type |
|-------|-----------|--------|------------|-----------|
| 1.1 | Intercepted Transmission | 100 | Easy | Static |
| 1.2 | Fragmented Server Map | 150 | Medium | Static |
| 1.3 | Time-Locked Vault | 200 | Hard | Team-specific |
| 2.1 | Corrupted Hash Trail | 250 | Medium | Static |
| 2.2 | JWT Inception | 300 | Hard | Static |
| 2.3 | Pattern Lock | 350 | Hard | Team-specific |
| 3.1 | Payload Hunt | 400 | Hard | Static |
| 3.2 | Logic Bomb Defusal | 450 | Hard | Static |
| 3.3 | Master Vault | 1000* | Hard | Static |

*First team to solve gets 2x points.

**Maximum Total:** 3,200 pts (or 4,200 for first-solve bonus on 3.3)

---

## 🚨 Important Notes

1. **Team-Specific Challenges (1.3 & 2.3):**
   - Backend computes correct flag per team via `calculateTeamSpecificFlag()`
   - Cannot be shared between teams
   - Validates against team name from database

2. **Challenge Order:**
   - Must be solved sequentially (1.1 → 1.2 → ... → 3.3)
   - Backend enforces linear progression via `team.currentLevel`

3. **Hints:**
   - Cost points (configurable penalty)
   - Provide moderate guidance, not walkthroughs
   - Once unlocked, can be toggled without additional cost

4. **Flag Validation:**
   - Case-insensitive comparison
   - Static flags checked against `getAcceptedFlagsForLevel()`
   - Team-specific flags computed at validation time

---

**🔐 KEEP THIS DOCUMENT SECURE - ORGANIZERS ONLY**
