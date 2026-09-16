# CTF Challenge Solutions & Testing Reference

Quick, concise reference for verifying and testing all 9 challenges in the application.

---

## Quick Flag Reference

| Level | Challenge Name | Points | Type | Submit Flag / Solution |
|---|---|---|---|---|
| **1.1** | The Intercepted Transmission | 100 | Static | `CTF{V33r4_N0d3_X92_S3rv3r}` |
| **1.2** | The Fragmented Server Map | 150 | Static | `CTF{K3rn3l_P4th_V4ult91}` |
| **1.3** | The Time-Locked Vault | 200 | Dynamic (Team) | `CTF{<first8(md5(teamName\|teamSize\|1\|THEEXTRACTION))>}` |
| **2.1** | The Corrupted Hash Trail | 250 | Static | `CTF{shadow99_valkyrie_crimson7}` |
| **2.2** | The JWT Inception | 300 | Static | `CTF{Minister_Staged_Treason_88x}` |
| **2.3** | The Pattern Lock | 350 | Dynamic (Team) | `CTF{<first8(sha256(teamName5THEEXTRACTION))>}` |
| **3.1** | The Payload Hunt | 400 | Static | `CTF{K1llsw17ch_0v3rr1d3_P4ck37}` |
| **3.2** | The Logic Bomb Defusal | 450 | Static | `CTF{D3fus3_L0g1c_B0mb_S41f99}` |
| **3.3** | The Master Vault | 1000 | Terminal + Static | `CTF{MASTER_a1b2c3_VAULT}` |

*Note: The backend normalizes submissions to lowercase for verification.*

---

## Round 1

### Level 1.1 — The Intercepted Transmission
- **Payload**: `GQ4cIQxpaShuBRRqPmkFAmNoBQlpKCxpKCc=`
- **How to Solve**:
  1. Base64 decode to raw bytes.
  2. XOR each byte with key `0x5A` (ASCII `'Z'`).
- **Submit Flag**:
  ```text
  CTF{V33r4_N0d3_X92_S3rv3r}
  ```

---

### Level 1.2 — The Fragmented Server Map
- **Payload**:
  - Fragment A: `103 124 106 173`
  - Fragment B: `P3im3o_K4gs_`
  - Fragment C: `7d 31 39 74 6c 75 34 56`
- **How to Solve**:
  1. **Fragment A**: Octal to ASCII -> `CTF{`
  2. **Fragment B**: Atbash cipher on letters -> `K3rn3l_P4th_`
  3. **Fragment C**: Reverse byte pairs (`56 34 75 6c 74 39 31 7d`), then Hex to ASCII -> `V4ult91}`
  4. Concatenate A + B + C.
- **Submit Flag**:
  ```text
  CTF{K3rn3l_P4th_V4ult91}
  ```

---

### Level 1.3 — The Time-Locked Vault (Team-Specific)
- **Format**: `CTF{<first 8 hex characters of MD5>}`
- **Formula**: `MD5(teamName|teamSize|1|THEEXTRACTION)`
  - `teamSize`: `1` if Solo (no 2nd member registered), `2` if Duo (2nd member registered).
- **Generate via Terminal**:
  ```powershell
  # Replace YOUR_TEAM and team size (1 or 2):
  node -e "const crypto=require('crypto'); const team='YOUR_TEAM', size=1; console.log('CTF{' + crypto.createHash('md5').update(`${team}|${size}|1|THEEXTRACTION`).digest('hex').slice(0,8) + '}');"
  ```
- **Example**:
  - Team: `ALPHA`, Size: `1`
  - Input: `ALPHA|1|1|THEEXTRACTION`
  - Result: `CTF{737d4c09}`

---

## Round 2

### Level 2.1 — The Corrupted Hash Trail
- **Payload**:
  - Database Alpha (MD5): `e8379b0f5d8f4c1dadaf39ee33fa5358` -> `shadow99`
  - Database Beta (SHA-1): `8f0881387e9339c6f0a61481a5b8ce8ac3893b7d` -> `valkyrie`
  - Database Gamma (SHA-256): `d48e93a43063be7e4d0f6672d435e90c24dccafb47b7c307f5fcf5284cef6378` -> `crimson7`
- **How to Solve**:
  - Crack hashes using CrackStation / standard wordlist. Join plaintext with underscores inside `CTF{...}`.
- **Submit Flag**:
  ```text
  CTF{shadow99_valkyrie_crimson7}
  ```

---

### Level 2.2 — The JWT Inception
- **Payload**: Hex string `65794a68624763694f694a...`
- **How to Solve**:
  1. Hex decode to ASCII to get the JWT:
     `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoX21pbmlzdGVyX29wcyIsImlzcyI6InNjY2NfaW50ZXJuYWxfcmVsYXkiLCJldmlkZW5jZSI6IlRXbHVhWE4wWlhKZlUzUmhaMlZrWDFSeVpXRnpiMjVmT0RoNCIsImlhdCI6MTcwNzg4NjgwMH0.k7WqHhK5gD8zZ4Fm5x8XJ2bY3cQ9pL1vN6sR0uT4wE2`
  2. Base64url decode payload to read `"evidence"`:
     `TWluaXN0ZXJfU3RhZ2VkX1RyZWFzb25fODh4`
  3. Base64 decode `"evidence"` value -> `Minister_Staged_Treason_88x`
- **Submit Flag**:
  ```text
  CTF{Minister_Staged_Treason_88x}
  ```

---

### Level 2.3 — The Pattern Lock (Team-Specific)
- **Format**: `CTF{<first 8 hex characters of SHA256>}`
- **Formula**: `SHA256(teamName5THEEXTRACTION)`
  - Direct concatenation: team name + number `5` + `THEEXTRACTION` (no spaces or delimiters).
- **Generate via Terminal**:
  ```powershell
  # Replace YOUR_TEAM:
  node -e "const crypto=require('crypto'); const team='YOUR_TEAM'; console.log('CTF{' + crypto.createHash('sha256').update(`${team}5THEEXTRACTION`).digest('hex').slice(0,8) + '}');"
  ```
- **Example**:
  - Team: `ALPHA`
  - Input: `ALPHA5THEEXTRACTION`
  - Result: `CTF{97663090}`

---

## Round 3

### Level 3.1 — The Payload Hunt
- **Payload**:
  - Fragment 1: `01000011 01010100 01000110 01111011 01001011 00110001 01101100 01101100`
  - Fragment 2: `7377313763685f`
  - Fragment 3: `MHYzcnIx`
  - Fragment 4: `q3_C4px37}`
- **How to Solve**:
  1. **Fragment 1**: 8-bit binary to ASCII -> `CTF{K1ll`
  2. **Fragment 2**: Hex to ASCII -> `sw17ch_`
  3. **Fragment 3**: Base64 decode -> `0v3rr1`
  4. **Fragment 4**: ROT13 decode -> `d3_P4ck37}`
  5. Concatenate fragments 1 + 2 + 3 + 4.
- **Submit Flag**:
  ```text
  CTF{K1llsw17ch_0v3rr1d3_P4ck37}
  ```

---

### Level 3.2 — The Logic Bomb Defusal
- **Payload**: Hex `64474e7854484d4555554a454247683742314147564768314231705661475144426c454f446b6f3d`
- **How to Solve**:
  1. Hex to ASCII -> `dGNxTHMEUUJEBGh7B1AGVGh1B1pVaGQDBlEODko=`
  2. Base64 decode into raw byte buffer.
  3. XOR all bytes with key `0x37` (ASCII `'7'`, decimal `55`).
- **Submit Flag**:
  ```text
  CTF{D3fus3_L0g1c_B0mb_S41f99}
  ```

---

### Level 3.3 — The Master Vault (Final Boss)
- **Terminal UI**: `/challenges/master-vault.html` (e.g. `http://localhost:3000/challenges/master-vault.html`)
- **Inputs to solve each prompt in sequence**:
  1. **Layer 1** (Decode Hex to Base64/JWT token):
     ```text
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ.89d1roG5HmocObazV9vRyQtqHnBFjqFUO7DP8NkKMSav0Zk0MJkRt_
     ```
  2. **Layer 2** (JWT Payload segment):
     ```text
     eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ
     ```
  3. **Layer 3** (Extracted `vault_key`):
     ```text
     42-17-89
     ```
  4. **Layer 4** (Confirm coordinates):
     ```text
     42-17-89
     ```
  5. **Layer 5** (6-character vault code):
     ```text
     a1b2c3
     ```
- **Submit Flag to CTF App**:
  ```text
  CTF{MASTER_a1b2c3_VAULT}
  ```

---

## Team Flags Generator Script

To instantly get both dynamic flags (1.3 & 2.3) for whatever team name you are testing with, run this in PowerShell or bash:

```powershell
node -e "const c = require('crypto'); const team = 'YOUR_TEAM', size = 1; console.log('Level 1.3 Flag:', 'CTF{' + c.createHash('md5').update(team + '|' + size + '|1|THEEXTRACTION').digest('hex').slice(0, 8) + '}'); console.log('Level 2.3 Flag:', 'CTF{' + c.createHash('sha256').update(team + '5THEEXTRACTION').digest('hex').slice(0, 8) + '}');"
```
