# THE EXTRACTION - ORGANIZER SOLUTION SHEET

Confidential internal reference for event operators.
This file is aligned with seeded data in `apps/backend/prisma/seed.ts`, canonical flags in `flags.md`, and validation logic in `apps/backend/src/challenges/challenges.service.ts`.

## Difficulty Flow (Hardened & AI-Resistant)
- Round 1: Medium-Hard -> Medium-Hard -> Hard
- Round 2: Medium-Hard -> Medium-Hard -> Hard
- Round 3: Tough -> Tough -> Tough

## Flow Continuity (Authoritative)
- Progression is strictly linear: teams must solve the current active level before the next level unlocks.
- Level path is fixed: 1.1 -> 1.2 -> 1.3 -> 2.1 -> 2.2 -> 2.3 -> 3.1 -> 3.2 -> 3.3.
- All levels support a 2-tier hint architecture separated by `||`:
  - **Tier 1 (Minimal)**: Directional guidance highlighting encoding traits or artifact nature without naming specific ciphers or tools.
  - **Tier 2 (Useful, Non-Spoiler)**: Actionable cryptographic or conversion concepts without giving away explicit steps or raw plaintexts.

---

## Round 1 - The Breach Discovery

### Level 1.1 - The Intercepted Transmission
- **Story Context**: Veera intercepts an encrypted transmission from the terrorist comms relay containing command center coordinates.
- **Difficulty**: Medium-Hard
- **Points**: 100
- **Seeded Payload**:
  `GQ4cIQxpaShuBRRqPmkFAmNoBQlpKCxpKCc=`
- **Flag**: `CTF{V33r4_N0d3_X92_S3rv3r}`
- **Tools**:
  - CyberChef (From Base64, XOR)
  - Python / Node.js script
- **Steps**:
  1) Identify Base64 encoding by the character set and trailing `=` padding. Decode the Base64 string to obtain 26 raw non-printable bytes:
     `\x19\x0e\x1c\x21\x0c\x69\x69\x28\x6e\x05\x14\x6a\x3e\x69\x05\x02\x63\x68\x05\x09\x69\x28\x2c\x69\x28\x27`.
  2) Known-plaintext analysis: standard CTF flags begin with `CTF{`.
     - First byte `0x19 ^ 'C' (0x43) = 0x5A`.
     - Second byte `0x0e ^ 'T' (0x54) = 0x5A`.
     - Third byte `0x1c ^ 'F' (0x46) = 0x5A`.
     - Fourth byte `0x21 ^ '{' (0x7B) = 0x5A`.
  3) XOR all bytes with single-byte key `0x5A` (ASCII `'Z'`, decimal `90`).
  4) Output yields: `CTF{V33r4_N0d3_X92_S3rv3r}`.
- **Hint 1 (Minimal)**: The transmission payload is armored in standard transport encoding, but decodes into non-printable binary telemetry rather than plain text.
- **Hint 2 (Useful, Non-Spoiler)**: Standard flag headers always begin with known characters. Compare the first few raw bytes against the expected protocol header to recover the single-byte masking key.
- **Operator Tip**: If teams try to read the Base64 output as text, guide them to examine byte-level representations and suggest crib-dragging against the known prefix `CTF{`.

---

### Level 1.2 - The Fragmented Server Map
- **Story Context**: Veera needs the access code for Server Room ER-42, split across three independent relay files.
- **Difficulty**: Medium-Hard
- **Points**: 150
- **Seeded Payload**:
  ```
  FRAGMENT A:
  103 124 106 173

  FRAGMENT B:
  P3im3o_K4gs_

  FRAGMENT C:
  7d 31 39 74 6c 75 34 56
  ```
- **Flag**: `CTF{K3rn3l_P4th_V4ult91}`
- **Tools**:
  - CyberChef (From Octal, Atbash, Reverse, From Hex)
  - dcode.fr
- **Steps**:
  1) **Fragment A**: Space-separated octal values (base-8).
     - 103 -> 67 -> `'C'`
     - 124 -> 84 -> `'T'`
     - 106 -> 70 -> `'F'`
     - 173 -> 123 -> `'{'`
     - Output: `CTF{`
  2) **Fragment B**: Classical Atbash (mirror alphabet) on Latin letters:
     - `P` -> `K`, `3` -> `3`, `i` -> `r`, `m` -> `n`, `3` -> `3`, `o` -> `l`, `_` -> `_`, `K` -> `P`, `4` -> `4`, `g` -> `t`, `s` -> `h`, `_` -> `_`.
     - Output: `K3rn3l_P4th_`
  3) **Fragment C**: Reversed byte sequence in hexadecimal.
     - Reverse hex pairs: `56 34 75 6c 74 39 31 7d`.
     - Convert hex to ASCII: `V4ult91}`.
  4) Concatenate A + B + C in order: `CTF{K3rn3l_P4th_V4ult91}`.
- **Hint 1 (Minimal)**: The three pieces originate from separate comms relays: an ancient computer base, a symmetric classical alphabet inversion, and a reversed byte capture.
- **Hint 2 (Useful, Non-Spoiler)**: Resolve Fragment A using base-8 byte values, apply standard Atbash substitution to alphabetical characters in Fragment B, and invert the byte order of the final hex stream before decoding.
- **Operator Tip**: Emphasize that Fragment B preserves digits and symbols while mirroring letters, and Fragment C requires reversing pairs (bytes), not single characters.

---

### Level 1.3 - The Time-Locked Vault (Team-Specific)
- **Story Context**: Veera finds a biometric archive vault holding Saif's attack blueprint, bound to team identity.
- **Difficulty**: Hard
- **Points**: 200
- **Flag Pattern**: `CTF{<first8(md5(teamName|teamSize|1|THEEXTRACTION))>}`
- **Tools**:
  - CyberChef (MD5)
  - Any MD5 calculator / Terminal `md5sum`
- **Steps**:
  1) Determine registered team size: `1` for Solo, `2` for Duo.
  2) Construct the exact seed string:
     `<teamName>|<teamSize>|1|THEEXTRACTION`
     *(Example for team `ALPHA_TEAM` with Duo: `ALPHA_TEAM|2|1|THEEXTRACTION`)*
  3) Calculate the MD5 hash of the seed string.
  4) Take the first 8 lowercase hexadecimal characters of the digest.
  5) Wrap in `CTF{...}` format.
- **Hint 1 (Minimal)**: The vault lock combines team registration telemetry with mission parameters using a strict pipe-delimited schema.
- **Hint 2 (Useful, Non-Spoiler)**: Construct the lock seed using your exact team name, operational headcount (1 or 2), round index 1, and mission codename separated by pipes. Digest with MD5 and extract the first 8 characters into standard flag format.
- **Operator Tip**: Most failures are due to whitespace mismatches in team name or selecting the wrong team size. Ensure the string is hashed without trailing newlines.

---

## Round 2 - Infiltration

### Level 2.1 - The Corrupted Hash Trail
- **Story Context**: Three seized databases secure sleeper cell identities, financial backers, and the payload.
- **Difficulty**: Medium-Hard
- **Points**: 250
- **Seeded Payload**:
  ```
  DATABASE ALPHA:
  e8379b0f5d8f4c1dadaf39ee33fa5358

  DATABASE BETA:
  8f0881387e9339c6f0a61481a5b8ce8ac3893b7d

  DATABASE GAMMA:
  d48e93a43063be7e4d0f6672d435e90c24dccafb47b7c307f5fcf5284cef6378
  ```
- **Flag**: `CTF{shadow99_valkyrie_crimson7}`
- **Tools**:
  - CrackStation / Hashes.com
  - Hashcat / John the Ripper (`rockyou.txt`)
- **Steps**:
  1) Identify algorithm by hash length:
     - Alpha (32 hex = 128-bit): MD5
     - Beta (40 hex = 160-bit): SHA-1
     - Gamma (64 hex = 256-bit): SHA-256
  2) Crack using dictionary lookup or `rockyou.txt`:
     - Alpha: `shadow99`
     - Beta: `valkyrie`
     - Gamma: `crimson7`
  3) Assemble with underscore delimiters:
     `CTF{shadow99_valkyrie_crimson7}`.
- **Hint 1 (Minimal)**: Identify each digest family by length and analyze their bit footprints before choosing dictionary recovery tactics.
- **Hint 2 (Useful, Non-Spoiler)**: The three artifacts span 128-bit, 160-bit, and 256-bit cryptographic digest standards. Recover the operational passwords using standard CTF wordlists and join them with underscores.
- **Operator Tip**: Standard online lookup tables (CrackStation) resolve all three words instantly; offline hashcat will crack them within seconds using rockyou.txt.

---

### Level 2.2 - The JWT Inception
- **Story Context**: Veera discovers evidence in the hostile admin panel that the Home Minister's execution was staged.
- **Difficulty**: Medium-Hard
- **Points**: 300
- **Seeded Payload**:
  `65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a645749694f694a686458526f58323170626d6c7a644756795832397763794973496d6c7a63794936496e4e6a59324e66615735305a584a7559577866636d567359586b694c434a6c646d6c6b5a57356a5a534936496c52586248566857453477576c684b5a6c557a556d68614d6c5a725744465365567058526e70694d6a566d5430526f4e434973496d6c68644349364d5463774e7a67344e6a67774d48302e6b37577148684b356744387a5a34466d357838584a32625933635139704c31764e36735230755434774532`
- **Flag**: `CTF{Minister_Staged_Treason_88x}`
- **Tools**:
  - CyberChef (From Hex, From Base64)
  - jwt.io / JSON Web Token debugger
- **Steps**:
  1) Decode the hex blob to plain ASCII to obtain a standard three-part JWT:
     `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoX21pbmlzdGVyX29wcyIsImlzcyI6InNjY2NfaW50ZXJuYWxfcmVsYXkiLCJldmlkZW5jZSI6IlRXbHVhWE4wWlhKZlUzUmhaMlZrWDFSeVpXRnpiMjVmT0RoNCIsImlhdCI6MTcwNzg4NjgwMH0.k7WqHhK5gD8zZ4Fm5x8XJ2bY3cQ9pL1vN6sR0uT4wE2`
  2) Inspect the payload (middle segment between dots) by base64url-decoding:
     ```json
     {
       "sub": "auth_minister_ops",
       "iss": "sccc_internal_relay",
       "evidence": "TWluaXN0ZXJfU3RhZ2VkX1RyZWFzb25fODh4",
       "iat": 1707886800
     }
     ```
  3) Decode the Base64 value of `"evidence"`:
     `TWluaXN0ZXJfU3RhZ2VkX1RyZWFzb25fODh4` -> `Minister_Staged_Treason_88x`.
  4) Wrap in `CTF{...}`: `CTF{Minister_Staged_Treason_88x}`.
- **Hint 1 (Minimal)**: The artifact is wrapped in byte hex format; stripping the outer representation exposes a modern standard web authentication structure.
- **Hint 2 (Useful, Non-Spoiler)**: Extract the payload segment from the three-part token and inspect the operational claims for encoded operational intelligence. Decode the evidence field to reveal the treason string.
- **Operator Tip**: Teams do not need to forge or brute-force the JWT HMAC signature; the token payload is readable and contains the base64-encoded intelligence.

---

### Level 2.3 - The Pattern Lock (Team-Specific)
- **Story Context**: Veera hijacks the negotiation frequency by cracking the dynamic pattern lock on the final database.
- **Difficulty**: Hard
- **Points**: 350
- **Flag Pattern**: `CTF{<first8(sha256(teamName5THEEXTRACTION))>}`
- **Tools**:
  - CyberChef (SHA-256)
  - Terminal `sha256sum`
- **Steps**:
  1) Build the seed string:
     `<teamName>5THEEXTRACTION`
     *(Note: no spaces, no pipes, exact case of registered team designation).*
  2) Compute the SHA-256 hash of the seed string.
  3) Extract the first 8 lowercase hexadecimal characters.
  4) Format as `CTF{xxxxxxxx}`.
- **Hint 1 (Minimal)**: This pattern lock binds your team's specific callsign directly to mission constants with zero delimiter padding.
- **Hint 2 (Useful, Non-Spoiler)**: Concatenate your exact team designation, the stage constant 5, and the operation codename THEEXTRACTION. Compute a 256-bit cryptographic digest and extract the leading 8 lowercase hex characters.
- **Operator Tip**: Verify that teams do not insert spaces or underscores before or after the number 5.

---

## Round 3 - The Final Strike

### Level 3.1 - The Payload Hunt
- **Story Context**: Veera and Preethi recover four encrypted shards of the activation payload to build the lockdown kill switch.
- **Difficulty**: Tough
- **Points**: 400
- **Seeded Payload**:
  ```
  FRAGMENT 1:
  01000011 01010100 01000110 01111011 01001011 00110001 01101100 01101100

  FRAGMENT 2:
  7377313763685f

  FRAGMENT 3:
  MHYzcnIx

  FRAGMENT 4:
  q3_C4px37}
  ```
- **Flag**: `CTF{K1llsw17ch_0v3rr1d3_P4ck37}`
- **Tools**:
  - CyberChef (From Binary, From Hex, From Base64, ROT13)
- **Steps**:
  1) **Fragment 1**: 8-bit binary bytes:
     `01000011` (C) `01010100` (T) `01000110` (F) `01111011` ({) `01001011` (K) `00110001` (1) `01101100` (l) `01101100` (l) -> `CTF{K1ll`
  2) **Fragment 2**: Hexadecimal bytes:
     `73` (s) `77` (w) `31` (1) `37` (7) `63` (c) `68` (h) `5f` (_) -> `sw17ch_`
  3) **Fragment 3**: Base64 string:
     `MHYzcnIx` -> `0v3rr1`
  4) **Fragment 4**: ROT13 substitution:
     `q3_C4px37}` -> `d3_P4ck37}`
  5) Concatenate fragments 1 + 2 + 3 + 4 in order:
     `CTF{K1llsw17ch_0v3rr1d3_P4ck37}`.
- **Hint 1 (Minimal)**: The shards are segregated by encoding protocols: raw digital bits, byte hex stream, transport radix-64, and classic alphabetic rotation.
- **Hint 2 (Useful, Non-Spoiler)**: Translate each shard independently into ASCII: parse 8-bit binary, decode raw hex bytes, decode base64, and rotate the final alphabetic cipher by 13 positions before joining 1 through 4.
- **Operator Tip**: Ensure teams keep symbols and case intact when combining all four fragments.

---

### Level 3.2 - The Logic Bomb Defusal
- **Story Context**: A fail-deadly logic bomb is armed inside Saif's attack script. Defusing it requires peeling multiple nested encoding barriers.
- **Difficulty**: Tough
- **Points**: 450
- **Seeded Payload**:
  `64474e7854484d4555554a454247683742314147564768314231705661475144426c454f446b6f3d`
- **Flag**: `CTF{D3fus3_L0g1c_B0mb_S41f99}`
- **Tools**:
  - CyberChef (From Hex, From Base64, XOR)
- **Steps**:
  1) **Layer 1 (Hex)**: Convert hex stream to ASCII text to yield a Base64 string:
     `dGNxTHMEUUJEBGh7B1AGVGh1B1pVaGQDBlEODko=`
  2) **Layer 2 (Base64)**: Decode Base64 to 28 raw bytes:
     `\x74\x63\x71\x4c\x73\x04\x51\x42\x44\x04\x68\x7b\x07\x50\x06\x54\x68\x75\x07\x5a\x55\x68\x64\x03\x06\x51\x0e\x0e`
  3) **Layer 3 (Known-Plaintext XOR)**:
     - Target begins with `CTF{`.
     - Byte 0: `0x74 ^ 'C' (0x43) = 0x37` (decimal 55, ASCII `'7'`).
     - Byte 1: `0x63 ^ 'T' (0x54) = 0x37`.
     - Byte 2: `0x71 ^ 'F' (0x46) = 0x37`.
     - Byte 3: `0x4C ^ '{' (0x7B) = 0x37`.
  4) XOR the entire byte stream with key `0x37` (55 decimal):
     Output: `CTF{D3fus3_L0g1c_B0mb_S41f99}`.
- **Hint 1 (Minimal)**: The defusal payload is wrapped across multiple conversion barriers, terminating in a single-byte masked binary stream.
- **Hint 2 (Useful, Non-Spoiler)**: Strip the hexadecimal representation to reach the transport encoding, decode into raw bytes, and perform a known-plaintext XOR analysis against the standard flag prefix.
- **Operator Tip**: When participants reach the raw binary layer, remind them that standard CTF crib-dragging easily reveals single-byte XOR keys.

---

### Level 3.3 - The Master Vault (Final Boss)
- **Story Context**: Joint RAW-Police raid secures Farooq's server. Crack the master vault interactive terminal to permanently stop Operation The Extraction.
- **Difficulty**: Tough (Boss)
- **Points**: 1000
- **Seeded Payload**:
  `65794a306232746c62694936496d5635536d686952324e7054326c4b535656365354646f61556c7a535735534e574e4453545a4a61334259566b4e4b4f53356c65556f7957566857633252474f584a615747747054326c4b645531584f486c6a524531705a6c4575596c6447656d5248566e6b6966513d3d`
- **Interactive Terminal Endpoint**: `/public/challenges/master-vault.html`
- **Flag**: `CTF{MASTER_a1b2c3_VAULT}`
- **Tools**:
  - Web Browser (Interactive terminal)
  - CyberChef (From Hex, From Base64, ROT13)
  - jwt.io
- **Terminal Execution Steps**:
  1) Open `/public/challenges/master-vault.html`. The interactive multi-layer security challenge starts a countdown.
  2) **Layer 1 (Hex Decode)**:
     - Decode the hex payload into text to reveal the Base64 token payload:
       `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ.89d1roG5HmocObazV9vRyQtqHnBFjqFUO7DP8NkKMSav0Zk0MJkRt_`
     - Paste into Layer 1 and submit.
  3) **Layer 2 (JWT Payload Extraction)**:
     - Isolate the middle segment of the JWT (`eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ`).
     - Submit into Layer 2.
  4) **Layer 3 (Extract Vault Coordinates)**:
     - Decode the base64url payload JSON:
       `{"vault_key":"42-17-89","data":"kllswitch"}`
     - Key/Coordinates: `42-17-89`.
     - Submit into Layer 3.
  5) **Layer 4 (Confirm Coordinates)**:
     - Confirm operational coordinates: `42-17-89`.
  6) **Layer 5 (Derive Vault Code)**:
     - Submit the derived 6-character vault code `a1b2c3`.
     - Terminal unlocks and outputs the final flag:
       `CTF{MASTER_a1b2c3_VAULT}`.
- **Hint 1 (Minimal)**: Access the designated interactive terminal and trace the multi-stage cryptographic authority chain in real time.
- **Hint 2 (Useful, Non-Spoiler)**: Resolve each authentication layer in the terminal interface sequentially: decode the outer packet to extract the token claim, recover the vault coordinates, and derive the 6-character unlock code.
- **Operator Tip**: Advise teams to keep intermediate outputs in an editor so they can quickly supply inputs to the interactive vault console.

---

## Validation Summary

| Level | Difficulty | Flag | Hash/Type |
|---|---|---|---|
| **1.1** | Medium-Hard | `CTF{V33r4_N0d3_X92_S3rv3r}` | Static / Server verification |
| **1.2** | Medium-Hard | `CTF{K3rn3l_P4th_V4ult91}` | Static / Server verification |
| **1.3** | Hard | Dynamic team MD5: `CTF{<first8>}` | Team-specific (`team\|size\|1\|THEEXTRACTION`) |
| **2.1** | Medium-Hard | `CTF{shadow99_valkyrie_crimson7}` | Static / Server verification |
| **2.2** | Medium-Hard | `CTF{Minister_Staged_Treason_88x}` | Static / Server verification |
| **2.3** | Hard | Dynamic team SHA256: `CTF{<first8>}` | Team-specific (`team5THEEXTRACTION`) |
| **3.1** | Tough | `CTF{K1llsw17ch_0v3rr1d3_P4ck37}` | Static / Server verification |
| **3.2** | Tough | `CTF{D3fus3_L0g1c_B0mb_S41f99}` | Static / Server verification |
| **3.3** | Tough (Boss)| `CTF{MASTER_a1b2c3_VAULT}` | Static & Interactive Terminal |

- Validation comparison is normalized and case-insensitive.
- Tiered hints in DB take priority over fallback code defaults.
- All flags and payloads are mathematically tested and verified.
