# 🎮 Operation Cipher Strike - Participant Guide

## 🌟 Welcome, Operative!

You are about to embark on **Operation Cipher Strike** - a story-driven Capture The Flag (CTF) competition that combines cybersecurity challenges with an immersive narrative thriller.

---

## 📖 The Story

**Date:** February 1, 2026  
**Location:** CODISSIA Tech Mall, Coimbatore, India  
**Crisis:** Terrorist siege with 1,200 hostages

A cyber-terrorist named **Umar Saif** has taken over the CODISSIA Tech Mall. His brother, **Umar Farooq**, is imprisoned in India. The demand: release Farooq, or hostages die.

Inside the mall, **Veera Raghavan** - a former RAW agent haunted by past failures - is fighting to save lives. But he can't do it alone. He needs **YOU** - an elite cyber operative - to decode encrypted messages, crack security systems, and stop a massive cyber attack called **Operation BLACKOUT**.

Every challenge you solve saves lives. Every flag you capture gives Veera critical intel. The fate of 50,000 jobs and ₹2,000 crore depends on your skills.

**Are you ready?**

---

## 🎯 Challenge Structure

### 🔴 ROUND 1: The Breach Discovery
**Veera infiltrates the mall and discovers the command center**

| Level | Challenge | Difficulty | Points | Skills Needed |
|-------|-----------|------------|--------|---------------|
| 1.1 | The Intercepted Transmission | Easy | 100 | Base64, ROT13, String Reversal |
| 1.2 | The Fragmented Server Map | Medium | 150 | Hex, Binary, Caesar Cipher |
| 1.3 | The Time-Locked Vault | Hard | 200 | MD5 Hashing, Mathematical Logic |

### 🟡 ROUND 2: Infiltration
**Exposing the Home Minister's betrayal and discovering Operation BLACKOUT**

| Level | Challenge | Difficulty | Points | Skills Needed |
|-------|-----------|------------|--------|---------------|
| 2.1 | The Corrupted Hash Trail | Medium | 250 | Hash Cracking (MD5, SHA-1, SHA-256) |
| 2.2 | The JWT Inception | Hard | 300 | JWT Decoding, Hex, Base64 |
| 2.3 | The Pattern Lock | Hard | 350 | SHA-256, Team-Specific Calculations |

### 🔴 ROUND 3: The Final Strike
**Race against time to defuse the cyber attack**

| Level | Challenge | Difficulty | Points | Skills Needed |
|-------|-----------|------------|--------|---------------|
| 3.1 | The Payload Hunt | Hard | 400 | Multi-encoding (Binary, Hex, Base64, ROT13) |
| 3.2 | The Logic Bomb Defusal | Hard | 450 | Nested Decryption, Logical Thinking |
| 3.3 | The Master Vault | Hard | **2000*** | ALL TECHNIQUES COMBINED |

***1st team within 30 minutes: 2000 points | Others within 30 min: 1000 points | After 30 min: LOCKED**

**Total Possible Points:** 4,200 (if you're first on 3.3)

---

## 🛠️ Tools You Can Use

### Essential Tools (Recommended)

1. **CyberChef** - https://gchq.github.io/CyberChef/
   - All-in-one encoding/decoding tool
   - Best for multi-step conversions

2. **Base64 Decoder** - https://www.base64decode.org/
   - Quick Base64 encoding/decoding

3. **MD5 / SHA Calculators**
   - https://www.md5hashgenerator.com/
   - https://emn178.github.io/online-tools/sha256.html

4. **Hash Crackers**
   - https://crackstation.net/ (for common password hashes)
   - https://md5decrypt.net/

5. **JWT Decoder** - https://jwt.io/
   - Decode JWT tokens
   - View headers and payloads

6. **ROT13 Decoder** - https://rot13.com/
   - Caesar cipher (ROT13) encoding/decoding

7. **Binary/Hex Converters**
   - https://www.rapidtables.com/convert/number/binary-to-ascii.html
   - https://www.rapidtables.com/convert/number/hex-to-ascii.html

### Programming Languages (Optional)

You can use Python, JavaScript, or any language you're comfortable with:

```python
# Python example - Base64 decode
import base64
decoded = base64.b64decode('SGVsbG8gV29ybGQ=')
print(decoded.decode())
```

```python
# Python example - MD5 hash
import hashlib
text = "example"
hash_object = hashlib.md5(text.encode())
print(hash_object.hexdigest())
```

---

## 📋 Rules & Guidelines

### ✅ Allowed

- ✅ Use online tools and decoders
- ✅ Write your own scripts
- ✅ Collaborate with your teammate
- ✅ Use AI for learning encoding concepts (but it won't help you solve)
- ✅ Take hints (50 point penalty per hint)
- ✅ Use Google to understand cryptographic concepts

### ❌ Not Allowed

- ❌ Sharing answers with other teams
- ❌ Hacking the platform itself
- ❌ DDoS or attacking the servers
- ❌ Sharing team-specific flags (1.3, 2.3)
- ❌ Multiple teams from same participants

### 📏 Challenge Rules

1. **Sequential Solving:** You must solve challenges in order (1.1 → 1.2 → 1.3 → 2.1 → etc.)
2. **Team-Specific Challenges:** Levels 1.3 and 2.3 require YOUR team name - answers cannot be shared
3. **Flag Format:** Most flags are in format `CTF{...}` (case-insensitive)
4. **Attempt Limits:** Some challenges have maximum attempts
5. **Time Limits:** Challenge 3.3 has a 30-minute countdown
6. **Hints:** Cost 50 points each, use wisely

---

## 🚀 Getting Started

### Step 1: Register Your Team
1. Go to the platform
2. Click "New Operative" (Register)
3. Enter team name and both participant names
4. Verify your email with OTP

### Step 2: Read the Story
- Click "Mission Briefing" to understand the narrative
- Learn about characters: Veera, Vikram, Althaf, Preethi
- See how your challenges fit into the story

### Step 3: Start Missions
- Go to "Active Missions" (Challenges page)
- Read challenge description and story context
- Submit your flag when solved
- Watch the live activity feed to see other teams' progress

---

## 💡 Tips for Success

### 1. **Read Carefully**
Every challenge description tells you exactly what to do. Don't skip instructions!

### 2. **Follow the Order**
If a challenge says "Hex → Base64 → ROT13", do it in THAT order.

### 3. **Check Your Format**
- Flags usually have format: `CTF{...}`
- Pay attention to case sensitivity
- Remove extra spaces

### 4. **Use CyberChef**
For multi-step challenges, CyberChef lets you chain operations:
```
1. From Hex
2. From Base64
3. ROT13
4. Reverse
```

### 5. **Team-Specific = Do the Math**
For challenges 1.3 and 2.3:
- Use YOUR exact team name (as registered)
- Follow the formula precisely
- Calculate the hash correctly
- These answers are unique to YOUR team

### 6. **Google is Your Friend**
- Don't know what MD5 is? Google it!
- Not sure about Base64? Google it!
- Need a hash calculator? Google it!

### 7. **Write Scripts for Complex Tasks**
Some challenges are easier with a quick Python/JavaScript script than clicking through tools.

### 8. **Check the Activity Feed**
See what other teams are solving. It tells you which challenges are solvable!

---

## 🎯 Challenge Solving Examples

### Example 1: Simple Base64
**Challenge:** Decode `SGFjayBUaGUgQm94`

**Solution:**
1. Recognize it's Base64 (ends with =, uses A-Z, a-z, 0-9, +, /)
2. Go to base64decode.org
3. Paste and decode
4. Result: `Hack The Box`
5. Submit: `CTF{Hack The Box}`

### Example 2: ROT13
**Challenge:** Decode `Pelcgur Gur Obk` (ROT13)

**Solution:**
1. Recognize Caesar cipher pattern
2. Go to rot13.com
3. Paste and decode
4. Result: `Cypher The Box`
5. Submit: `CTF{Cypher The Box}`

### Example 3: MD5 Hash
**Challenge:** Calculate MD5 of "example"

**Solution:**
1. Go to md5hashgenerator.com
2. Type "example"
3. Get: `1a79a4d60de6718e8e5b326e338ae533`
4. If challenge asks for first 8 chars: `1a79a4d6`
5. Submit: `CTF{1a79a4d6}`

---

## 🏆 Winning Strategy

1. **Speed Matters:** First team on 3.3 gets double points!
2. **Don't Get Stuck:** Use hints if you're blocked (better to lose 50 points than waste time)
3. **Divide and Conquer:** Split research between teammates
4. **Stay Calm:** Each challenge is solvable with the right approach
5. **Learn as You Go:** Each challenge teaches you skills for the next one

---

## 🆘 Common Mistakes

### ❌ Wrong Format
```
Wrong: ctf{answer}  (lowercase ctf)
Right: CTF{answer}
```

### ❌ Extra Spaces
```
Wrong: CTF{ answer }  (spaces inside)
Right: CTF{answer}
```

### ❌ Incomplete Decoding
```
Challenge: "Decode Base64 twice"
Wrong: Decode once and submit
Right: Decode → Decode again → Submit
```

### ❌ Wrong Team Name
```
For team-specific challenges:
Wrong: Using "Team1" when you registered as "CyberNinjas"
Right: Use exact team name from registration
```

---

## 📊 Scoring & Leaderboard

- **Points are awarded immediately** when you solve a challenge
- **Leaderboard updates in real-time** (live SSE updates)
- **First-solve bonus:** Challenge 3.3 gives 2000 points to first team (1000 to others)
- **Hint penalty:** -50 points per hint used
- **No partial credit:** Flag must be 100% correct

---

## 🎬 Interactive Challenges

Some challenges have **interactive HTML pages** for better experience:

- **Level 3.3 (Master Vault):** Special multi-layer interactive interface
  - Access at: `http://localhost:3001/public/challenges/master-vault.html`
  - Features: Live countdown, step-by-step validation, progress tracking

---

## 📞 Need Help?

### During the Competition

1. **Read the Hints:** Each challenge has built-in hints (costs 50 points)
2. **Check Console:** Some challenges have debug hints in browser console
3. **Ask Organizers:** For technical issues only (not for solutions!)

### Common Questions

**Q: Can I use AI to solve challenges?**  
A: AI can help you understand concepts, but these challenges require manual solving. AI won't give you the answer.

**Q: My flag is correct but marked wrong?**  
A: Check format (CTF{...}), case, spaces, special characters.

**Q: Can I skip a challenge?**  
A: No. You must solve sequentially. Stuck? Use a hint!

**Q: How long do I have?**  
A: Challenges 1.1-3.2 have no time limit. Challenge 3.3 has 30-minute countdown.

**Q: Can I re-try after wrong submission?**  
A: Yes, unless challenge has attempt limit (will be shown).

---

## 🎓 Learn More

Want to practice after the competition?

- **Hack The Box** - https://www.hackthebox.com/
- **OverTheWire** - https://overthewire.org/wargames/
- **picoCTF** - https://picoctf.org/
- **CryptoHack** - https://cryptohack.org/

---

## 🎉 Final Words

Remember:
- **Every challenge is solvable** - don't give up!
- **The story matters** - you're not just solving puzzles, you're saving lives
- **Learn and have fun** - CTF is about learning, not just winning
- **Help your teammate** - two brains are better than one

**Good luck, operative. The city is counting on you.**

---

**🚀 Operation Cipher Strike - BEGIN MISSION 🚀**
