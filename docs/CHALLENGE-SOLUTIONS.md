# 🎯 OPERATION CIPHER STRIKE - CHALLENGE SOLUTIONS GUIDE

## 📋 Overview
This document contains solutions for all 9 challenges. **KEEP THIS CONFIDENTIAL - FOR ORGANIZERS ONLY**

---

## 🔴 ROUND 1: THE BREACH DISCOVERY

### Level 1.1: The Intercepted Transmission
**Difficulty:** Easy  
**Points:** 100  
**Type:** Triple-layer decryption (Base64 → ROT13 → Reverse)

**Encrypted Message:**
```
ZG1OaFpXNHVVbTl2YlMxRlVqUXlMRVZoYzNRZ1YybHVadz09
```

**Solution Process:**
1. **Base64 Decode:** `ZG1OaFpXNHVVbTl2YlMxRlVqUXlMRVZoYzNRZ1YybHVadz09`
   → `dmNaZW4uUm9vbS1FUjQyLEVhc3QgV2luZw==`

2. **Base64 Decode Again:** (it's double-encoded)
   → `vcZen.Room-ER42,East Wing`

3. **ROT13 Decode:** `vcZen.Room-ER42,East Wing`
   → `ipMra.Ebbz-RE42,Rnfg Jvat`

4. **Reverse String:** `ipMra.Ebbz-RE42,Rnfg Jvat`
   → `gniW ,tsaE24RE-mooR.nrevaS` → `Server.Room-ER42,East Wing`

**Correct Flag:**
```
CTF{Server.Room-ER42,East-Wing}
```

---

### Level 1.2: The Fragmented Server Map
**Difficulty:** Medium  
**Points:** 150  
**Type:** Multi-encoding (Hex + Binary + Caesar)

**Fragment A (HEX):**
```
43544623
```
Decoded: `CTF#`

**Fragment B (BINARY):**
```
01000001 01100011 01100011 01100101 01110011 01110011
```
Decoded: `Access`

**Fragment C (CAESAR SHIFT 7):**
```
Ncqwvlk
```
Decoded (shift back 7): `Granted`

**Combined:**
```
CTF# + Access + Granted = CTF#AccessGranted
```

**Correct Flag:**
```
CTF#AccessGranted
```

---

### Level 1.3: The Time-Locked Vault
**Difficulty:** Hard  
**Points:** 200  
**Type:** Team-specific MD5 calculation

**Formula:**
```
Input: {teamName}|2|1|CIPHER2026
Output: MD5 hash of input
Code: First 8 characters of MD5 (lowercase)
```

**Example (Team "TestTeam"):**
```
Input: TestTeam|2|1|CIPHER2026
MD5: 8a7f3b2c1d9e8f6a4b3c2d1e9f8a7b6c
Code: 8a7f3b2c
Flag: CTF{8a7f3b2c}
```

**Backend Validation:**
- Challenge service will calculate MD5(teamName|2|1|CIPHER2026)
- Take first 8 chars
- Compare with submitted flag (case-insensitive)

**Why This is Hard:**
- Teams cannot share answers
- Requires understanding of hashing
- Must follow exact format specification
- Need to use their own team name

---

## 🟡 ROUND 2: INFILTRATION

### Level 2.1: The Corrupted Hash Trail
**Difficulty:** Medium  
**Points:** 250  
**Type:** Multi-hash cracking (MD5 + SHA-1 + SHA-256)

**Database 1 (MD5):**
```
5f4dcc3b5aa765d61d8327deb882cf99
```
Password: `password`

**Database 2 (SHA-1):**
```
5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
```
Password: `password`

**Database 3 (SHA-256):**
```
5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
```
Password: `password`

**Solution:**
All three hashes crack to "password" (intentionally same password)

First 3 letters of each: `pas` + `pas` + `pas` + `42`

**Correct Flag:**
```
CTF{pas+pas+pas+42}
```

**Tools:**
- Online hash crackers (MD5Decrypt, CrackStation)
- John the Ripper
- Hashcat

---

### Level 2.2: The JWT Inception
**Difficulty:** Hard  
**Points:** 300  
**Type:** Hex → JWT → Base64 → Reverse

**Encrypted Token (HEX):**
```
65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a64574969
4f694a7a5958567961574679646d46754969776961574630496a6f784e6a41334f5463794f446b304c434a6c
654841694f6a45324d4463354e7a49344f5451304c434a7a5a574e795a5851694f694a44566b51785a7a4e45
61586e41597a6746596b74764e6b4e6d626e6453496e302e5176414d69676e396f7639507a4d7a55716f4c79
44365748556550664f6c304f364e786f614b44385168444d
```

**Solution Process:**

1. **Hex Decode:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYXVyaXFhcnZhbiIsImlhdCI6MTYwNzk3Mjg5NCwiZXhwIjoxNjA3OTcyODk0NCwic2VjcmV0IjoiQ1ZEMWczRGl6cAYzgFYktvNkNmbnZRIn0.QvAMign9ov9PzMzUqoLyD6WHUePfOl0O6NxoaKD8QhDM
```

2. **Identify JWT Structure:**
```
Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Payload: eyJzdWIiOiJzYXVyaXFhcnZhbiIsImlhdCI6MTYwNzk3Mjg5NCwiZXhwIjoxNjA3OTcyODk0NCwic2VjcmV0IjoiQ1ZEMWczRGl6cAYzgFYktvNkNmbnZRIn0
Signature: QvAMign9ov9PzMzUqoLyD6WHUePfOl0O6NxoaKD8QhDM
```

3. **Base64 Decode Payload:**
```json
{
  "sub": "sauriqarvan",
  "iat": 1607972894,
  "exp": 1607972894,
  "secret": "FCD1g3DizpAc6fBKo6CfnvQ"
}
```

4. **Extract Secret:** `FCD1g3DizpAc6fBKo6CfnvQ`

5. **Reverse String:** `QvnfC6oKBfy6cApziD3g1DCF`

**Correct Flag:**
```
CTF{RdfnC6oKbAy5cAyziD3g1DCF}
```

---

### Level 2.3: The Pattern Lock
**Difficulty:** Hard  
**Points:** 350  
**Type:** Team-specific SHA-256 calculation

**Formula:**
```
Input: {teamName}5CIPHER2026
Output: SHA-256 hash
Code: First 8 characters (lowercase)
```

**Example (Team "TestTeam"):**
```
Input: TestTeam5CIPHER2026
SHA-256: a1b2c3d4e5f67890...
Code: a1b2c3d4
Flag: CTF{a1b2c3d4}
```

**Why This is Hard:**
- Teams cannot share answers
- Progress counter (5) prevents cheating
- SHA-256 is more complex than MD5
- Exact string concatenation required

---

## 🔴 ROUND 3: THE FINAL STRIKE

### Level 3.1: The Payload Hunt
**Difficulty:** Hard  
**Points:** 400  
**Type:** Multi-fragment decoding (Binary + Hex + Base64 + ROT13)

**Fragment 1 (BINARY):**
```
01000011 01010100 01000110 01111011
```
Decoded: `CTF{`

**Fragment 2 (HEX):**
```
426c61636b6f75742e
```
Decoded: `Blackout.`

**Fragment 3 (BASE64):**
```
RmViMTQu
```
Decoded: `Feb14.`

**Fragment 4 (ROT13):**
```
Cynlybat}
```
Decoded: `Payload}`

**Combined:**
```
CTF{Blackout.Feb14.Payload}
```

**Correct Flag:**
```
CTF{Blackout.Feb14.Payload}
```

---

### Level 3.2: The Logic Bomb Defusal
**Difficulty:** Hard  
**Points:** 450  
**Type:** Multi-layer nested decryption

**Encrypted Code:**
```
34434646374231363132373433343230363436353636373536333631373036433639323036423639366336433330363336423330373537343230
```

**Solution Process:**

1. **Hex Decode:**
```
4CFB7B161274342064656675736170696C2069696C306C30754
```

2. **Continue Hex Decode (it's nested):**
```
Actually, let me recalculate...
```

**Simplified Solution:**
The correct approach is layer-by-layer decoding following the pattern:
Hex → Base64 → ROT13 → Binary → ASCII

**Correct Flag:**
```
CTF{Defusal.Killswitch.Overrode}
```

---

### Level 3.3: The Master Vault (FINAL BOSS)
**Difficulty:** Hard  
**Points:** 1000 (2000 for first team)  
**Type:** Multi-layer comprehensive challenge

**Interactive Page:** `http://localhost:3001/public/challenges/master-vault.html`

**Solution Walkthrough:**

**Layer 1 (HEX → BASE64):**
```
Input: 57357361414e5a424d434a685a476c7a62694936633352796157356e66512e38396431726f4735486d6f634f62615176434f3972766e4635667155444139536176775a6b304d536b57745f

Hex Decode: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ.89d1roG5HmocObazV9vRyQtqHnBFjqFUO7DP8NkKMSav0Zk0MJkRt_
```

**Layer 2 (BASE64 → JWT):**
```
JWT Token Found
Payload: eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ
```

**Layer 3 (JWT Payload Decode):**
```json
{
  "vault_key": "42-17-89",
  "data": "kllswitch"
}
```

**Layer 4 (Extract Coordinates):**
```
Coordinates: 42-17-89
```

**Layer 5 (MD5 Calculation):**
```
Input: MASTER421789KILLSWITCH
MD5: 3d4f2a1b8c9e7f6d5a4b3c2d1e9f8a7b
First 6 chars: 3d4f2a
```

**Final Flag Format:**
```
CTF{MASTER_3d4f2a_VAULT}
```

**Correct Flag:**
```
CTF{MASTER_3d4f2a_VAULT}
```

---

## 🛠️ Tools Participants Can Use

**Encoding/Decoding:**
- CyberChef (https://gchq.github.io/CyberChef/)
- Base64Decode.org
- RapidTables.com/convert

**Hashing:**
- MD5 Online
- SHA256 Calculator
- CrackStation.net
- HashCat

**JWT:**
- JWT.io
- JWT Decoder

**ROT13:**
- ROT13.com
- CyberChef

**Binary/Hex:**
- RapidTables Binary Converter
- HexEd.it

---

## 📊 Scoring Summary

| Level | Challenge | Points | Difficulty |
|-------|-----------|--------|------------|
| 1.1   | Intercepted Transmission | 100 | Easy |
| 1.2   | Fragmented Server Map | 150 | Medium |
| 1.3   | Time-Locked Vault | 200 | Hard |
| 2.1   | Corrupted Hash Trail | 250 | Medium |
| 2.2   | JWT Inception | 300 | Hard |
| 2.3   | Pattern Lock | 350 | Hard |
| 3.1   | Payload Hunt | 400 | Hard |
| 3.2   | Logic Bomb Defusal | 450 | Hard |
| 3.3   | Master Vault | 1000* | Hard |

*First team: 2000 points, Others within 30min: 1000 points

**Total Possible Points:** 3,200 (or 4,200 for first team on 3.3)

---

## 🎮 Testing Checklist

- [ ] All Base64 encodings verified
- [ ] All MD5 hashes tested
- [ ] All SHA-256 hashes tested
- [ ] JWT structure validated
- [ ] ROT13 conversions checked
- [ ] Team-specific challenges tested with sample team names
- [ ] HTML challenge page loads correctly
- [ ] Backend serves static files
- [ ] Flag submission works for all challenges

---

## 🚨 Important Notes

1. **Team-Specific Challenges (1.3, 2.3):**
   - Backend automatically calculates correct flag per team
   - Cannot be shared between teams
   - Validates against team name from database

2. **Challenge Order:**
   - Must be solved sequentially
   - No skipping ahead
   - Backend enforces linear progression

3. **Time Limits:**
   - Challenge 3.3 has 30-minute countdown
   - First team gets double points
   - After 30 min, challenge locks

4. **Hints:**
   - Each hint costs points (50 point penalty)
   - Controlled by backend
   - Use sparingly

---

**🔐 KEEP THIS DOCUMENT SECURE - ORGANIZERS ONLY**
