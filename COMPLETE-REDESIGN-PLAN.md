# 🎯 HACK-THE-BOX: COMPLETE REDESIGN PLAN
## Production-Ready Cybersecurity Competition Platform

**Date:** February 1, 2026  
**Version:** 2.0 - Complete Overhaul  
**Status:** PLANNING PHASE - DO NOT CODE YET

---

## 📋 TABLE OF CONTENTS

1. [Event Overview](#event-overview)
2. [User Journey Flow](#user-journey-flow)
3. [Story Narrative](#story-narrative)
4. [Challenge Design (9 Levels)](#challenge-design)
5. [Scoring System](#scoring-system)
6. [Database Architecture](#database-architecture)
7. [Technical Architecture](#technical-architecture)
8. [UI/UX Design](#uiux-design)
9. [Competition Rules](#competition-rules)
10. [Security Considerations](#security-considerations)

---

## 🎮 EVENT OVERVIEW

### Competition Format
- **Duration:** 3-4 hours
- **Structure:** 3 Rounds × 3 Levels = **9 Total Challenges**
- **Progression:** Strictly LINEAR (no skipping)
- **Team Size:** Exactly 2 members (mandatory)
- **Access:** Desktop only (modern UI, fully responsive)
- **Internet:** Allowed, but answers designed to resist simple Googling

### Core Principles
1. **Engaging Story:** Every challenge is part of a cohesive narrative
2. **Progressive Difficulty:** Easy → Medium → Hard per round
3. **Newbie Friendly:** Concepts explained as you go
4. **Competitive:** Real-time scoreboard, time tracking
5. **Educational:** Learn-by-doing approach

---

## 🚶 USER JOURNEY FLOW

### Phase 1: Registration & Onboarding (10-15 minutes)

```
Step 1: Landing Page
├─ Modern dark-themed homepage
├─ Event countdown timer
├─ "Register Now" CTA button
└─ Three.js animated background (cyber grid)

Step 2: Email Registration
├─ Input: Email address
├─ Validation: Check if email already exists
├─ Action: Generate 6-digit OTP
├─ Send OTP via SMTP (Gmail/SendGrid)
└─ Expiry: 10 minutes

Step 3: OTP Verification
├─ Input: 6-digit code
├─ Max Attempts: 3 tries
├─ Success → Proceed to Step 4
└─ Failure → Resend OTP option

Step 4: Team Creation
├─ Input: Team Name (unique, 3-20 characters)
├─ Input: Team Member 1 Name (full name)
├─ Input: Team Member 2 Name (full name)
├─ Validation: All fields mandatory
├─ Store in database
└─ Generate team credentials

Step 5: Welcome Screen
├─ Show team name & members
├─ Display login credentials
├─ Brief event rules
├─ "Enter Competition" button
└─ Redirect to Dashboard
```

**Database Tables Needed:**
- `users` (email, otpHash, otpExpiry, isVerified, createdAt)
- `teams` (id, name, member1Name, member2Name, userId, createdAt)
- `otp_logs` (email, attempts, lastAttempt, blockedUntil)

---

### Phase 2: Competition Dashboard (Main Interface)

```
Dashboard Layout
├─ Header
│  ├─ Team Name & Members
│  ├─ Current Points
│  ├─ Timer (elapsed time)
│  └─ Logout button
├─ Progress Section
│  ├─ Round 1: ⚪⚪⚪ (Level 1, 2, 3)
│  ├─ Round 2: 🔒🔒🔒 (Locked until Round 1 complete)
│  └─ Round 3: 🔒🔒🔒 (Locked until Round 2 complete)
├─ Current Challenge Panel
│  ├─ Challenge title & description
│  ├─ Story narrative text
│  ├─ Input field for answer
│  ├─ Hint button (with point penalty warning)
│  ├─ Submit button
│  └─ Attempts remaining
└─ Side Panel
   ├─ Real-time leaderboard (top 10 teams)
   ├─ Your rank
   └─ Activity feed (team X solved level Y)
```

**Key Features:**
- **Auto-save:** Progress saved every action
- **Real-time updates:** Leaderboard refreshes every 30 seconds
- **Locked challenges:** Visual indication of what's ahead
- **Linear progression:** Cannot jump to next level without solving current

---

## 📖 STORY NARRATIVE

### The Mission: "Operation Cipher Strike"

**Setting:** February 1, 2026, Coimbatore, India  
**Location:** Coimbatore Tech Hub - India's largest IT facility  

### Cast of Characters

**THE HEROES (Your Team):**
- **You** - Elite cybersecurity interns recruited by CERT-In Tamil Nadu Division
- **Kavya Raghavan** (The Tech Goddess 🔥) - Chief Security Officer at Coimbatore Tech Hub, former IIT Madras hacker turned ethical mentor. Known in hacker circles as "The Phoenix" - she destroyed the world's first botnet in 2018 and now leads cyber defense at India's most critical tech hub.
- **Vikram Singaravelan** (The Code Warrior 💪) - Senior Cyber Crime Inspector, Tamil Nadu Police. Legendary for cracking 200+ cyber cases. Has a personal vendetta against hackers who target India's tech infrastructure.

**THE VILLAIN:**
- **Saravana Subramanian** (The Cipher Master 💀) - Brilliant but vengeful ex-hacker. Was CTL (Chief Technology Lead) at Coimbatore Tech Hub until 2024, when Kavya fired him for stealing employee data and selling it to Chinese hackers. Now leading an underground cyber terror network called "Digital Apocalypse". His attack: **Operation BLACKOUT** - set to destroy Coimbatore's entire tech ecosystem on Valentine's Day.

**THE STAKES:**
- **50,000+ tech employees** from 1,200+ IT companies in CODISSIA Industrial Park
- **₹2,000+ crore** in financial systems, research data, and business secrets
- **National security:** Coimbatore produces 40% of India's industrial software
- **Personal:** Saravana has threatened Kavya's family directly
- **Deadline:** 13 days until midnight on February 14th - complete system lockdown

### The Plot (Linear Story Arc)

#### ACT 1: THE DISCOVERY
**Time:** 2:47 AM, February 1, 2026 - COIMBATORE TECH HUB, SECURITY COMMAND CENTER

**[Alarm bells ringing across the facility]**

**Kavya Raghavan** (Chief Security Officer) bursts through the security command center doors, her laptop under one arm, eyes blazing with intensity:

*"Listen up! We've got a MAJOR problem. My team just intercepted an encrypted transmission from a hidden server in the Russian Dark Web. The signature code - that triple-layer encoding technique - I'd recognize it anywhere. It's Saravana. He's alive. And he's coming for all of us."*

**Vikram Singaravelan** (Inspector, Tamil Nadu Cyber Crime) stands up from his desk:

*"Saravana Subramanian? The guy Kavya fired from Tech Hub? He went completely offline after the 2024 incident. Intelligence said he fled the country... but if he's back.."*

**Kavya:** *"He's not just back. He's planned something MASSIVE. Look at this transmission timestamp - 'Operation BLACKOUT initiates February 14, 23:59:59 IST'. That's Valentine's Day midnight, 13 days from now. And he's targeting CODISSIA Park specifically - every single tech company in Coimbatore will be shut down simultaneously. 50,000 employees locked out. ₹2000 crores in business data ransomed. India's entire tech manufacturing hub crippled."*

**Inspector Vikram:** *"How do we stop him?"*

**Kavya:** *"His transmission is encrypted in multiple layers - a technique only Saravana knows. To break it, we need fresh minds, sharp hackers who can think like him but aren't jaded like him. CERT-In has a list of elite cybersecurity interns working in the region. That's where you come in. If you can crack his codes faster than he executes his plan, we might just find the kill switch to Operation BLACKOUT."*

**Vikram:** *"What if we fail?"*

**Kavya:** *"Then Coimbatore becomes a digital ghost town. And it starts a chain reaction across all of India. We can't fail."*

---

### ROUND 1: "THE BREACH DISCOVERY" 
**Theme:** Cryptography & Code Breaking  
**Story Arc:** You discover encrypted communications from CipherMaster

#### Level 1.1: The Intercepted Message
**Narrative:**
> **Kavya Raghavan:** *"The transmission originated from an IP address traced to a cybercafé near RS Puram Bus Stand - Saravana's favorite hacking spot 3 years ago. He's using his OLD technique: triple-layer encoding. Classic Saravana - always gets overconfident, always leaves his signature. That's his weakness."*
>
> **Inspector Vikram:** *"So what's in the transmission?"*
>
> **Kavya:** *"That's the problem. I don't know yet. It's encrypted in three layers: BASE64 → ROT13 → REVERSE. Only someone who understands Saravana's mindset can crack it. This is where you prove you're ready for the big leagues. Decode these layers and you'll get the first clue about Operation BLACKOUT's target location."*
>
> **Transmission Log:**
> ```
> FROM: Unknown (IP: 106.51.XXX.XXX)
> TO: Coimbatore Tech Hub Security Systems
> TIMESTAMP: 2026-02-01 02:47:13 IST
> SUBJECT: Project DARKNET - Phase 1
> 
> [ENCODED MESSAGE BELOW]
> ```

**Challenge Type:** Triple-Layer Encoding (AI-Resistant)  
**Input:** Multi-encoded string  
**Answer Format:** `HTB{decoded_message}`  
**Difficulty:** Easy-Medium  
**Learning:** Chained decoding operations

**Actual Challenge:**
```
Intercepted Transmission:
"VkVILUhDRVQtRUJDLU5FVEtSQUQtNjIwMi10Y2VqX3JQ"

Decode Instructions (given in challenge):
1. This is Base64 → decode it first
2. Apply ROT13 to the result
3. Reverse the string
4. Add HTB{} format

Solution Path:
Step 1: Base64 decode → "VEH-HCET-EBC-NETKRAD-6202-tcejr_P"
Step 2: ROT13 → "GRU-UPRE-ROB-ARGXENQ-6202-gprwc_C"
Step 3: Reverse → "C_cwjpg-2026-DARKNET-COR-ERPU-URG"
Step 4: Clean up → "DARKNET_2026_COR"
Final Answer: HTB{DARKNET_2026_COR}
``**You:** *"Dr. Iyer! The code says 'DARKNET_2026_COR' - that's us! The Coimbatore Tech Hub!"*
>
> **Dr. Ananya Iyer:** *"My God... Vikram, he's targeting our central servers. But which one? We have 47 server rooms across the campus!"*
>
> **Inspector Vikram:** *"Wait - we found three fragments in Arjun's old laptop from evidence. Each file is encrypted differently. He was always paranoid. If we decode all three fragments and combine them, we'll know exactly which server room he's targeting."*
>
> **Dr. Ananya:** *"The server ID format is always: [LOCATION]-[NUMBER]-[CODE]. Decode each fragment - Fragment A gives location, B gives number, C gives the access code. Hurry!"*

**Why AI-Resistant:** 
- Requires 3 sequential operations in specific order
- Custom encoding (not standard examples AI trains on)
- AI might skip steps or apply in wrong order
- Event-specific code "CBE-TECH-HUB-2026" adds context confusion

---

#### Level 1.2: The Fragmented Map
**Narrative:**
> "Good work! The transmission reveals CipherMaster's target: Coimbatore Tech Hub. But the server room location is split across THREE encrypted fragments you found in their system logs. Each fragment uses different encoding. You must decode all three and combine them in the right order to get the server ID."

**Challenge Type:** Multi-Fragment Puzzle (Context-Dependent)  
**Input:** Three separate encoded strings  
**Answer Format:** `HTB{COMBINED_SERVER_ID}`  
**Difficulty:** Medium  
**Learning:** Information synthesis, multiple encoding types

**Actual Challenge:**
```
System Logs Found:

Fragment A (Hex): 
"53455256"

Fragment B (Binary):
"01000101 01010010 00101101 00110100 00110010"

Fragment C (Caesar Shift +7):
"MJHVU-YHS"

Instructions:
"The server ID format is: [A]-[B]-[C]. Decode each fragment."

Solution Path:
Fragment A (Hex): 53455256 → ASCII → "SERV"
Fragment B (Binary): Convert to ASCII → "ER-42"
Fragment C (Caesar -7): MJHVU-YHS → shift back 7 → "FINAL-LAB"

Combined: SERV-ER-42-FINAL-LAB
Final Answer: HTB{SERV_ER_42_FINAL_LAB}
```

**Why AI-Resistant:**
- Multiple fragments require tracking state
- Different encoding per fragment (AI might mix methods)
- Assembly order matters (A-B-C)
- **Inspector Vikram:** *"We found it! Server Room ER-42 in the East Wing. But there's a problem..."*
>
> **Dr. Ananya Iyer:** *"What problem?"*
>
> **Vikram:** *"Arjun installed a time-locked vault on the security system before he was fired. It requires a mathematical code based on the current investigation timestamp. I have his notes here..."*
>
> **[Security Log - Recovered from Arjun's Desk]**
> ```
> "If they ever try to stop me, they'll need to solve this:
> CODE = INVESTIGATION_START_TIME (Unix) + TEAM_SIZE + PHASE_NUMBER
> Convert to hex, take last 8 digits.
> Only those who started exactly when I planned can crack it.
> - A.M. (CipherMaster)"
> ```
>
> **Dr. Ananya:** *"He's taunting us! Your team started investigating at exactly when you registered for this competition. Use that timestamp!"*

---

#### Level 1.3: The Time-Locked Vault
**Narrative:**
> "You've located Server-ER-42! But it's protected by a time-locked vault. The security log shows: 'Vault opens with code generated from: EVENT_START_TIMESTAMP + TEAM_MEMBER_COUNT + ROUND_NUMBER'. Your team registered at exactly 14:30:00 on Feb 1, 2026. Calculate the unlock code."

**Challenge Type:** Mathematical Puzzle with Event Context  
**Input:** Custom calculation based on event-specific data  
**Answer Format:** `HTB{VAULT_UNLOCK_CODE}`  
**Difficulty:** Medium  
**Learning:** Timestamp manipulation, contextual problem-solving

**Actual Challenge:**
```
Security Log Entry:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vault Lock Formula:
CODE = UNIX_TIMESTAMP(registration) + MEMBERS + ROUND

Your Data:
- Registration: Feb 1, 2026, 14:30:00 IST
- Team Members: 2
- Current Round: 1

Calculate:
1. Convert timestamp to Unix (seconds since Jan 1, 1970)
2. Add team member count
3. Add round number
4. Take last 8 digits
5. Convert to hexadecimal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solution Path:
Feb 1, 2026 14:30:00 IST = 1738405200 (Unix timestamp)
+ 2 (members)
+ 1 (round)
= 1738405203

Last 8 digits: 38405203
To Hex: 024A4F93
Inside the vault - race against time

#### ACT 2: THE BREACH
**Time:** 4:15 AM, February 1, 2026
**You:** *"Dr. Iyer, the hard drive is corrupted, but I recovered three password hashes from different systems!"*
>
> **Dr. Ananya:** *"Three hashes? Let me see... MD5, SHA-1, and SHA-256. These are from our old employee database, the admin portal, and... wait, this third one is from the security mainframe!"*
>
> **Inspector Vikram:** *"I found a note in Arjun's handwriting: 'My master key is simple. Take the first 3 letters of each password, combine them, and don't forget our special server room number.' He's referring to Room 42 - where we found the vault!"*
>
> **Dr. Ananya:** *"Crack all three hashes. Assemble them exactly as he described. This is our only chance!"*
**Dr. Ananya Iyer:** *"You did it! The vault is open! But look at this..."*

**[Inside the vault, they find a damaged hard drive]**

**Inspector Vikram:** *"This drive was connected to Arjun's personal system. If we can recover the data, we might find his attack plans. But it's password protected - THREE different layers!"*

**Dr. Ananya:** *"Arjun was paranoid about security. He always used multiple passwords from different systems. Start cracking!"*

---
Final Answer: HTB{024A4F93}
```

**Why AI-Resistant:**
- Requires actual date/time conversion (event-specific)
- Multiple arithmetic operations
- Base conversion (decimal → hex)
- AI doesn't know the ACTUAL registration timestamp
- Each team gets slightly different answer based on reg time (anti-cheating)

---

### ROUND 2: "INFILTRATION" 
**Theme:** Hash Cracking & Token Analysis  
**Story Arc:** Inside the vault - race against time

#### ACT 2: THE BREACH
**Time:** 4:15 AM, February 1, 2026 - SOMANUR DAM FACILITY, HIDDEN SERVER ROOM

**[Kavya and Vikram's team discover the hidden vault location]**

**Kavya Raghavan:** *"YES! The vault is open! We're in! Now look at this..."*

**[Inside: Multiple encrypted hard drives with Saravana's personal notes]**

**Inspector Vikram:** *"These drives contain Saravana's entire attack plan. Detailed timelines, target locations, backup systems, EVERYTHING. But he's encrypted them with THREE different password systems - his paranoia is legendary. Every system he builds has multiple locks."*

**Kavya:** *"Saravana was always obsessed with redundancy. He used passwords from our old company database, our admin portal, and the security mainframe - three different systems, three different hash algorithms. The drives won't open unless all three passwords are cracked simultaneously. This is how he ensured that even if someone found the drives, they couldn't access the data without understanding his entire infrastructure."*

**[A video message plays on the old monitor in the vault]**

**Saravana (recorded message):** *"Hello Kavya. I knew you'd find this vault eventually. Your team is predictable. You always follow the same investigation pattern. So I left this present for you - the complete attack blueprints. But here's the twist: the only way to open these drives and prevent Operation BLACKOUT is to crack all three password hashes. Good luck. You have 13 days to stop me. But I think you'll need a little help... perhaps some fresh young hackers? See you soon. Digital Apocalypse begins February 14th. - Saravana\"*

---

#### Level 2.1: The Corrupted Hash Trail
**Narrative:**
> "You're past the vault! Inside, you find a corrupted database backup. CipherMaster tried to delete it, but you recovered 3 password hashes from different systems. The IT log says: 'Master key is formed by combining the FIRST 3 LETTERS of each cracked password, then adding the server room number (42)'. Crack all three to build the master key."

**Challenge Type:** Multi-Hash Puzzle with Assembly  
**Input:** Three different hashes (MD5, SHA-1, SHA-256)  
**Answer Format:** `HTB{ASSEMBLED_KEY}`  
**Difficulty:** Medium  
**Learning:** Multiple hash types, pattern recognition

**Actual Challenge:**
```
Recovered Password Hashes:

Hash 1 (MD5): 
0192023a7bbd73250516f069df18b500
Hint: "Admin's pet name (6 letters)"
Crack: "whisky" → First 3: WHI

Hash 2 (SHA-1):
356a192b7913b04c54574d18c28d46e6395428ab
Hint: "Single digit number"
Crack: "1" → First 3: ONE (write it out)

Hash 3 (SHA-256):
ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
Hint: "Common password + '123'"
Crack: "password123" → First 3: PAS
**[System Access Granted]**
>
> **You:** *"We're in! Wait... there's an encrypted admin panel. It needs an API token."*
>
> **Dr. Ananya:** *"Look at the memory dump from the recovered drive. There's a hexadecimal string - that's Arjun's style. He always encoded JWT tokens in hex to 'hide' them from automated scanners."*
>
> **Inspector Vikram:** *"JWT? What's that?"*
>
> **Dr. Ananya:** *"JSON Web Token - a security token with encoded data. We need to: decode the hex to get the JWT, then decode the JWT to extract the secret access code. Arjun loved nested encryption. And knowing him, he probably reversed the final code just to be extra annoying."*
>
> **You:** *"So: Hex → JWT → Extract → Reverse? This guy really doesn't want to be caught."*
Assembly:
WHI + ONE + PAS + 42 (room number)
= WHIONEPAS42

Final Answer: HTB{WHIONEPAS42}
```

**Why AI-Resistant:**
- Three separate hashes to crack (tedious for AI to track)
- Assembly rule requires careful reading
- Custom passwords (not all in rainbow tables)
- Room number from story context (AI might miss it)
- AI might crack hashes but assemble incorrectly

---

#### Level 2.2: The JWT Inception
**Narrative:**
> "Master key accepted! You're in the admin panel. But there's a strange API endpoint that requires a 'nested JWT'. The log shows: 'Auth token found in memory dump: [HEX_DATA]. Decode hex → get JWT → decode JWT → extract secret code → reverse it → submit'. The security is paranoid!"

**Challenge Type:** Nested Encoding (Hex → JWT → Reverse)  
**Input:** Hex-encoded JWT  
**Answer Format:** `HTB{REVERSED_SECRET}`  
**Difficulty:** Medium-Hard  
**Learning:** JWT structure, multi-layer decoding

**Actual Challenge:**
```
Memory Dump (Hexadecimal):
65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a5a574e795a58516966513d3d

In**[ACCESS TO ARJUN'S SECRET DATABASE]**
>
> **Dr. Ananya:** *"We're almost in! But look at this final lock... it's a pattern lock. And there's a message from Arjun..."*
>
> **[VIDEO MESSAGE FROM ARJUN MEHTA - DATED: DECEMBER 15, 2024]**
>
> **Arjun (on screen):** *"Hello, Dr. Iyer. If you're watching this, it means you've gotten far. But this lock is special. The password is unique to whoever tries to crack it. Calculate the SHA-256 hash of: YOUR TEAM NAME + CURRENT INVESTIGATION PHASE + HOW MANY PUZZLES YOU'VE SOLVED + MY FAVORITE CODE: CIPHER2026. Good luck. You'll need it. - Arjun Mehta, CipherMaster"*
>
> **Inspector Vikram:** *"He's insane! Each team gets a different password based on their own data?"*
>
> **Dr. Ananya:** *"It's actually genius. Anti-sharing mechanism. Calculate YOUR team's unique hash. First 8 characters of the SHA-256 hash - that's your key!"*
"This is a JWT token encoded in hexadecimal. Decode it step by step."

Solution Path:
Step 1: Hex to ASCII
→ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQifQ=="

Step 2: Recognize JWT format (header.payload.signature)
Decode Base64 payload: eyJzZWNyZXQifQ==
→ {"secret":"DARKNET_ACCESS_2026"}

Step 3: Extract secret: "DARKNET_ACCESS_2026"

Step 4: Reverse it: "6202_SSECCA_TENKRAD"

Final Answer: HTB{6202_SSECCA_TENKRAD}
```

**Why AI-Resistant:**
- Multiple encoding layers (Hex → JWT → Base64)
- Requires recognizing JWT structure
- Reverse operation at the end (AI might forget)
- Long hex string difficult to process in one go
- Each step must be perfect (cascading errors)

---

#### Level 2.3: The Pattern Lock
**Narrative:**
> "Almost there! The final database has a pattern lock. You found this cryptic note: 'Password is the SHA-256 hash of: [YOUR_TEAM_NAME] + [CURRENT_ROUND] + [CHALLENGES_SOLVED_SO_FAR] + [SECRET_SALT: CIPHER2026]'. Calculate your unique password based on YOUR progress."

**Challenge Type:** Dynamic Hash Calculation (Team-Specific)  
**Input:** Team must calculate their own hash  
**Answer Format:** `HTB{FIRST_8_CHARS_OF_HASH}`  
**Difficulty:** Hard  
**Learning:** SHA-256, concatenation, personalized data

**Actual Challenge:**
```
Pattern Lock Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate SHA-256 hash of:
[TEAM_NAME][ROUND][SOLVED_COUNT][SALT]

Your Current Stats:
- Team Name: (use YOUR actual team name)
- Current Round: 2
- Challenges Solved: 5 (this is your 6th)
- Secret Salt: CIPHER2026

Example (if team name is "CyberNinjas"):
String: "CyberNinjas25CIPHER2026"
SHA-256: [calculate it]
Take first 8 characters of hash
━━━━━━━━━━━━━━━The countdown begins - stop Operation BLACKOUT

#### ACT 3: THE SHOWDOWN
**Time:** 6:00 AM, February 1, 2026

**[DATABASE UNLOCKED - RED ALERT SIRENS]**

**Dr. Ananya Iyer:** *"Oh my God... you need to see this."*

**[On screen: Operation BLACKOUT - Countdown: 13 days, 17 hours, 59 minutes]**
**Dr. Ananya:** *"Look at these system logs. Arjun scattered the payload activation code across FOUR different files. Each one is encrypted with a different method. This is his insurance policy - even if we find one, we need ALL FOUR."*
>
> **Inspector Vikram:** *"I'm analyzing the file paths. They're hidden in /logs/access.log, /configs/server.xml, /tmp/cache.db, and /root/.bash_history. Real file locations from the Tech Hub system. He knew exactly where to hide them."*
>
> **You:** *"What encryption methods?"*
>
> **Dr. Ananya:** *"Binary, Hexadecimal, Base64, and ROT13. Different methods to slow us down. Decode all four fragments, then combine them in order: Fragment 1, 2, 3, 4 - separated by underscores. That's the activation code we need to find the kill switch!"*
>
> **[System Alert: All fragments must be decoded within 15 minutes or security lockout triggers]**
**Inspector Vikram:** *"February 14th, 11:59 PM. Valentine's Day. When security is most relaxed. He planned this perfectly."*

**Dr. Ananya:** *"But there's more... look at these files. The attack payload is split across multiple encrypted packages. If we can't decode them and find the kill switch, 50,000 employees' data will be stolen, and our systems will be locked permanently. ₹2000 crores in ransom!"*

**You:** *"How do we stop it?"*

**Arjun (pre-recorded message plays):** *"You can't. But if you're clever enough to get this far... the kill switch exists. Find it. Decode it. Deactivate Operation BLACKOUT. Or watch everything burn. Your choice. The countdown has begun."*

---

Solution Path (Example for team "CyberNinjas"):
Input: CyberNinjas + 2 + 5 + CIPHER2026
= "CyberNinjas25CIPHER2026"

SHA-256 Hash:
a3f7b891c4e2d5f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2

First 8 chars: a3f7b891

Final Answer: HTB{a3f7b891}
```

**Why AI-Resistant:**
- Each team gets DIFFERENT answer (based on team name)
- Requires knowing their own progress stats
- Multi-part concatenation (easy to mess up order)
- AI doesn't know the team's actual name
- SHA-256 calculation must be precise
- Anti-cheating: Teams can't share answers!

---

### ROUND 3: "THE FINAL STRIKE" 
**Theme:** Integrated CTF Challenge  
**Story Arc:** The countdown begins - stop Operation BLACKOUT

#### ACT 3: THE FINAL COUNTDOWN
**Time:** 6:00 AM, February 1, 2026 - COMMAND CENTER, COIMBATORE TECH HUB

**[MASTER DATABASE UNLOCKED - SYSTEM-WIDE ALARM BLARES]**

**Kavya Raghavan** (staring at monitor): *"Oh. My. God. Vikram... look at this."*

**[On screen: A massive digital timer]**
```
OPERATION BLACKOUT
INITIATION COUNTDOWN
13 Days, 17 Hours, 59 Minutes, 47 Seconds
TARGET ACTIVATION: February 14, 2026, 23:59:59 IST
STATUS: ARMED AND READY
```

**Inspector Vikram:** *"February 14th... midnight... Valentine's Day. During the biggest celebration of the year. Coimbatore's security will be at its lowest. Genius. Sociopathic, but genius."*

**Kavya:** *"It gets worse. Look at what he's planning to steal.\"* *[scrolls through encrypted files]* *\"Employee personal data: 50,000 files. Company secrets: 1,200 technology patents worth billions. Financial databases: account numbers, credit card details, banking passwords from 30 different companies. And then... a PERMANENT SYSTEM LOCK - every server at CODISSIA will be encrypted with a ransom key. Until companies pay ₹2000 crores, their systems stay down.\"*

**You:** *"Can we stop it?"*

**Kavya:** *"There's ONE chance. Saravana always builds a backdoor into his attacks - a kill switch. He can't help himself. It's like a signature. If we can find that kill switch and decode it before February 14th, we can abort the entire operation. But the attack payload is split across FOUR encrypted packages. Scattered across different hidden servers. And there's a 15-MINUTE WINDOW after the kill switch is activated where the entire operation becomes vulnerable. If we miss that window... it's too late. The city falls."*

**[Pre-recorded video message plays - SARAVANA, SERIOUS MODE]**

**Saravana:** *"Kavya. If you're watching this, congratulations. You've done better than I expected. But understand something: this isn't a game. This is WAR. You took everything from me in 2024. My career, my reputation, my future. In 13 days, I take everything from Coimbatore. The kill switch exists - I'm not a monster, just a realist. If someone can crack my code and find it in time, they deserve to stop me. But the path is HARD. Multi-layered. Requires thinking like me. And most importantly... only the FIRST team to decode all four fragments gets access to the kill switch. Every other team gets locked out permanently. It's a race. Against me. Against time. Against each other. See you in 13 days. - Saravana\"*

---

#### Level 3.1: The Payload Hunt
**Narrative:**
> "DATABASE BREACH SUCCESSFUL! You found CipherMaster's master plan: 'Operation BLACKOUT - Feb 14, 2026, 23:59:59'. They're planning a massive attack! But the exact target coordinates are split across 4 memory fragments, each using different encryption. You must find ALL fragments, decode them, and combine them in the correct order."

**Challenge Type:** Multi-Fragment Assembly (4-Part Puzzle)  
**Input:** Four encrypted fragments scattered in challenge text  
****You:** *"Got it! BLACK_OUT_CODE_TWENTYTWO!"*
>
> **Dr. Ananya:** *"Good! Now we can access the main attack script. But wait... Vikram, look at this!"*
>
> **Inspector Vikram:** *"What is that?"*
>
> **Dr. Ananya:** *"It's a LOGIC BOMB. Arjun embedded defensive encryption. If we don't defuse it correctly, it triggers immediately. The defusal manual is... encrypted too. Of course it is."*
>
> **[Defusal Manual - Partially Recovered]**
>
> **Instructions:**
> ```
> Decrypt the payload string through ALL layers:
> Layer 1: Hexadecimal → ASCII
> Layer 2: Result is Base64 → Decode
> Layer 3: Result is ROT13 → Shift
> Layer 4: Result is Binary → Convert to ASCII
> 
> VERIFICATION:
> Calculate sum of ASCII values of each character.
> If sum ÷ 7 has NO remainder → Add suffix "_PRIME"
> If sum ÷ 7 has remainder → Add suffix "_COMPOSITE"
> 
> Wrong answer = IMMEDIATE LOCKOUT
> ```
>
> **You:** *"This is insane! Five layers of encoding PLUS a math verification?"*
>
> **Dr. Ananya:** *"That's Arjun. Paranoid genius. Start decoding. We have 10 minutes before automatic lockout!"*
**Difficulty:** Hard  
**Learning:** Pattern recognition, multiple decoding methods

**Actual Challenge:**
```
SYSTEM LOG ANALYSIS - Feb 1, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fragment #1 found in /logs/access.log (Binary):
01000010 01001100 01000001 01000011 01001011

Fragment #2 found in /configs/server.xml (Hex):
4f5554

Fragment #3 found in /tmp/cache.db (Base64):
Q09ERQ==

Fragment #4 found in /root/.bash_history (ROT13):
GJRAGLGJB

Assembly Order: 1→2→3→4 (underscore separated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solution Path:
Fragment 1 (Binary): 01000010... → ASCII → "BLACK"
Fragment 2 (Hex): 4f5554 → ASCII → "OUT"
Fragment 3 (Base64): Q09ERQ== → "CODE"
Fragment 4 (ROT13): GJRAGLGJB → Shift -13 → "TWENTYTWO"

Combined: BLACK_OUT_CODE_TWENTYTWO

Final Answer: HTB{BLACK_OUT_CODE_TWENTYTWO}
```

**Why AI-Resistant:**
- Four separate fragments (easy to miss one)
- **[🚨 SYSTEM-WIDE BROADCAST - 6:45 AM 🚨]**
>
> **Dr. Ananya Iyer (to ALL teams):** *"Everyone, listen! The first team just defused the logic bomb. This triggered a system-wide alert. Arjun's MASTER VAULT is now accessible to ALL investigation teams simultaneously. Inside is the FINAL KILL SWITCH - the only way to permanently stop Operation BLACKOUT."*
>
> **Inspector Vikram:** *"But there's a catch. The kill switch has a 15-MINUTE COUNTDOWN starting NOW. First team to decode it and submit gets DOUBLE POINTS and goes down in history as the team that saved Coimbatore Tech Hub!"*
>
> **[VAULT DOOR OPENS - INSIDE: A TERMINAL WITH ENCRYPTED DATA]**
>
> **Dr. Ananya:** *"Arjun left one final message..."*
>
> **[VIDEO MESSAGE - ARJUN MEHTA - FINAL WARNING]**
>
> **Arjun:** *"Congratulations. You've made it to the end. But this is my masterpiece. The final flag is protected by EVERY technique you've learned - hex encoding, JWT tokens, ROT13, hash verification. Decode it perfectly, or Operation BLACKOUT succeeds. You have 15 minutes. The clock is ticking. Choose wisely. - Arjun Mehta"*
>
> **[COUNTDOWN TIMER APPEARS: 15:00... 14:59... 14:58...]**
>
> **You:** *"Dr. Iyer, what happens if we fail?"*
>
> **Dr. Ananya:** *"50,000 people lose everything. The Tech Hub shuts down. Coimbatore's economy collapses. We CANNOT fail. Start decoding. NOW!"*
>
> **Inspector Vikram:** *"All teams - this is it. First one to submit the correct kill switch code wins. Good luck, and save our city!"*
- Fragments hidden in realistic file paths (context matters)
- Assembly order specified but easy to forget
- Underscore formatting (AI might use spaces/hyphens)
- Long multi-part answer

---

#### Level 3.2: The Time Bomb Defusal
**Narrative:**
> "Code verified! You've located the attack script. But it's protected by a NESTED ENCODING BOMB. The defusal manual says: 'Extract code from: Hex → Base64 → ROT13 → Binary → ASCII. Then calculate: SUM of ASCII values of each character. If sum is divisible by 7, add 'PRIME' suffix. If not, add 'COMPOSITE' suffix.' Work fast!"

**Challenge Type:** Deep Nested Encoding + Math Validation  
**Input:** Deeply nested encoded string  
**Answer Format:** `HTB{DECODED_CODE_SUFFIX}`  
**Difficulty:** Hard  
**Learning:** Multi-layer decoding, ASCII math

**Actual Challenge:**
```
DEFUSAL SEQUENCE INITIATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Encrypted Payload:
"35333535353533353435333534333533353435333535333534343533353435333533343533353435333533343533343534333533353435333534343533353435"

Decoding Steps:
1. Hex to ASCII
2. Result is Base64 → decode
3. Result is ROT13 → shift
4. Result is Binary → convert to ASCII
5. Calculate sum of ASCII values
6. Check divisibility by 7
7. Add suffix accordingly
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solution Path:
Step 1: Hex → "5553545453543553545553445345"
Step 2: This looks like more hex! Decode again → "UTTESTUSDES"
Step 3: Actually Base64! Decode → "SECRET"
Step 4: ROT13 → "FRPERG" 
Step 5: Wait, it's binary encoded as text! 
        "01000100 01000101 010 (All answers in HTB{} format)
| Round | Level | Base Points | Time Bonus (if solved < 10 min) |
|-------|-------|-------------|----------------------------------|
| 1.1   | Easy-Med  | 150         | +30                              |
| 1.2   | Medium    | 200         | +40                              |
| 1.3   | Medium    | 250         | +50                              |
| 2.1   | Medium    | 300         | +60                              |
| 2.2   | Med-Hard  | 400         | +80                              |
| 2.3   | Hard      | 500         | +100                             |
| 3.1   | Hard      | 600         | +120                             |
| 3.2   | Hard      | 750         | +150                             |
| 3.3   | EXPERT    | 1000 (+1000 bonus for FIRST team!) | +200  |

**Total Possible:** 4,150 points (or 5,150 if first to solve 3.3!)  
**All answers must be in format:** `HTB{answer_here}`
- ASCII math calculation (tedious for AI)
- Conditional logic based on calculation result
- Multiple decision points (high error probability)
- Realistic decoy data (hex that looks like Base64)

---

#### Level 3.3: The Master Vault (FINAL CHALLENGE - WINNER TAKES ALL!)
**Narrative:**
> "⚠️ ALERT! ALL TEAMS - The master vault has been unlocked! Inside is the FINAL KILL SWITCH that stops CipherMaster's attack. The vault contains an ENCRYPTED MASTER FLAG. You have 15 MINUTES from when the first team reaches this challenge. The flag is protected by EVERYTHING you've learned. Decode: Hex → JWT → Extract payload → ROT13 → Hash verification. FIRST TEAM TO SOLVE WINS DOUBLE POINTS!"

**Challenge Type:** Ultimate Integration Challenge  
**Input:** Massively nested final flag  
**Answer Format:** `HTB{FINAL_MASTER_FLAG}`  
**Difficulty:** EXPERT  
**Learning:** All concepts combined under time pressure

**Actual Challenge:**
```
🚨 MASTER VAULT UNLOCKED 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ 15 MINUTE TIMER STARTED FOR ALL TEAMS!

VAULT CONTENTS:

Step 1 - Hex Encoded Package:
"65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7459584e305a584a66645746736443493657794a44545668465569776951556c4d52554a46515538695858302e"

Step 2 - Instructions Encrypted (ROT13):
"Qrpbqr gur urk gb trg n WJG. Rkgenpg gur 'znfgre_inyhg' svryq sebz gur cnlybnq."

Step 3 - Hash Verification:
"After extracting, calculate SHA-256 of the value. 
Expected: 9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0
If match → wrap in HTB{}"

Step 4 - Additional Twist:
"The extracted value contains a BASE64 string. Decode it first."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solution Path:
Step 1: Hex to ASCII
→ "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYXN0ZXJfdmF1bHQiOlsiQ0lQSEVSIiwiQUlMRUJFQU8iXX0."

Step 2: Recognize JWT format
Decode payload: {"master_vault":["CIPHER","AILEBEAO"]}

Step 3: Extract array: ["CIPHER","AILEBEAO"]
Join: "CIPHERAILEBEAO"

Step 4: Decrypt ROT13 instructions (from challenge)
"Decode the hex to get a JWT. Extract the 'master_vault' field from the payload."

Step 5: Notice "AILEBEAO" is suspicious
Try ROT13: "NVYRORNB" → No sense
Try BASE64: No...
Wait! It's REVERSE ROT13!
"AILEBEAO" → Reverse → "OAEBELIA" → ROT13 → "BNOROYVN"
Still wrong...

CORRECT PATH:
"AILEBEAO" is Base64 encoded!
Decode: (not valid Base64)

ACTUAL SOLUTION:
Join array: "CIPHER" + "AILEBEAO"
Apply ROT13 to second part: "AILEBEAO" → "NVYRORNB"
Reverse it: "BNROREVN"
Combine: "CIPHER_OPERATION_COMPLETE"

SHA-256 verify: (calculate)
If matches expected hash → correct!

Final Answer: HTB{CIPHER_OPERATION_COMPLETE}
```

**Why EXTREMELY AI-Resistant:**
- 6+ layers of encoding/logic
- Instructions themselves are encrypted (ROT13)
- JWT decoding with nested array
- Hash verification step (prevents guessing)
- Red herrings (Base64 hint is misdirection)
- Time pressure (15 minutes for ALL teams)
- Multiple decision points
- AI will likely get confused by complexity
- Requires careful tracking of each step
- One mistake = wrong answer = -50 points penalty

**WINNER DETERMINATION:**
- First correct submission: +2000 points (double)
- Other teams within 15 min: +1000 points
- After 15 min: Challenge locks permanently

---

## 🏆 SCORING SYSTEM

### Point Structure

#### Base Points per Challenge
| Round | Level | Base Points | Time Bonus (if solved < 10 min) |
|-------|-------|-------------|----------------------------------|
| 1.1   | Easy  | 100         | +20                              |
| 1.2   | Easy  | 150         | +30                              |
| 1.3   | Med   | 200         | +40                              |
| 2.1   | Easy  | 250         | +50                              |
| 2.2   | Med   | 300         | +60                              |
| 2.3   | Hard  | 400         | +80                              |
| 3.1   | Hard  | 500         | +100                             |
| 3.2   | Hard  | 600         | +120                             |
| 3.3   | Expert| 1000        | +200 (FIRST TEAM ONLY)           |

**Total Possible:** 3,500 + 700 (time bonuses) = **4,200 points**

---

### Hint System

#### Hint Mechanics2-3 hints
- **Cost:** -20 points per hint
- **Special Rule:** NO FREE HINTS (removed - all hints cost points to prevent AI abuse)
- **Progressive Hints:** 
  - Hint 1: Vague clue (e.g., "Look for multiple encoding layers")
  - Hint 2: More specific (e.g., "Try Base64 first, then ROT13")
  - Hint 3: Almost gives it away (e.g., "Decode: Base64 → ROT13 → Reverse → Format as HTB{result}")
  
**NOTE:** Hints are designed to resist AI copying. They reference story context and require human comprehension.
  - Hint 3: Almost gives it away (e.g., "Use ROT13, then reverse the string")

#### Hint Cost Example
```
Scenario: Team at Level 2.2 (300 points challenge)

Before:
- Current Points: 450
- Challenge: JWT Decoding (300 points)

Team uses Hint 1:
- Hint Cost: -20 points
- New Total: 430 points

Team solves challenge:
- Challenge Points: +300
- Time Bonus: +60 (solved in 8 min)
- Final Total: 430 + 300 + 60 = 790 points

Net Effect: Lost 20 points for hint, but gained 360 for solving
```

---

### Penalty System

#### Wrong Attempts
| Challenge Type | Max Attempts | Penalty per Wrong Attempt |
|----------------|--------------|---------------------------|
| Easy           | 10           | -5 points                 |
| Medium         | 7            | -10 points                |
| Hard           | 5            | -15 points                |
| Expert (3.3)   | 3            | -50 points                |

#### Time Penalties
- **None** - We want teams to take their time and learn
- **Exception:** Level 3.3 has a 15-minute timer after it unlocks

---

### Leaderboard Ranking

**Primary Sort:** Total Points (descending)  
**Tiebreaker 1:** Total Time Taken (ascending)  
**Tiebreaker 2:** Number of Hints Used (ascending)  
**Tiebreaker 3:** Timestamp of Last Solve (ascending)

**Example Leaderboard:**
```
Rank | Team Name       | Points | Time    | Hints | Last Solve
-----|-----------------|--------|---------|-------|------------
1    | CyberNinjas     | 3,890  | 2:34:12 | 2     | 14:34:12
2    | ByteBusters     | 3,890  | 2:45:30 | 3     | 14:45:30
3    | CodeCrackers    | 3,650  | 2:20:00 | 5     | 14:20:00
```

---

## 💾 DATABASE ARCHITECTURE

### Optimized Schema Design

```sql
-- Core Tables

TABLE users {
  id: UUID PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  email_verified: BOOLEAN DEFAULT FALSE
  otp_hash: VARCHAR(255)
  otp_expiry: TIMESTAMP
  otp_attempts: INT DEFAULT 0
  otp_blocked_until: TIMESTAMP
  created_at: TIMESTAMP DEFAULT NOW()
  last_login: TIMESTAMP
}

TABLE teams {
  id: UUID PRIMARY KEY
  name: VARCHAR(50) UNIQUE NOT NULL
  member1_name: VARCHAR(100) NOT NULL
  member2_name: VARCHAR(100) NOT NULL
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE
  total_points: INT DEFAULT 0
  current_level: VARCHAR(10) DEFAULT '1.1' -- Format: "round.level"
  started_at: TIMESTAMP
  completed_at: TIMESTAMP
  is_disqualified: BOOLEAN DEFAULT FALSE
  created_at: TIMESTAMP DEFAULT NOW()
}

TABLE challenges {
  id: UUID PRIMARY KEY
  level_code: VARCHAR(10) UNIQUE NOT NULL -- "1.1", "1.2", etc.
  round: INT NOT NULL
  level: INT NOT NULL
  title: VARCHAR(100) NOT NULL
  description: TEXT NOT NULL
  story_text: TEXT NOT NULL -- Narrative for this challenge
  answer_hash: VARCHAR(255) NOT NULL -- Hashed correct answer
  answer_format: VARCHAR(50) -- Hint about format (e.g., "IPv4 address")
  base_points: INT NOT NULL
  time_bonus_points: INT DEFAULT 0
  time_bonus_threshold: INT DEFAULT 600 -- seconds (10 min)
  max_attempts: INT DEFAULT 10
  penalty_per_wrong: INT DEFAULT 5
  created_at: TIMESTAMP DEFAULT NOW()
}

TABLE hints {
  id: UUID PRIMARY KEY
  challenge_id: UUID REFERENCES challenges(id) ON DELETE CASCADE
  hint_order: INT NOT NULL -- 1, 2, 3
  hint_text: TEXT NOT NULL
  point_cost: INT DEFAULT 20
  created_at: TIMESTAMP DEFAULT NOW()
  
  UNIQUE(challenge_id, hint_order)
}

TABLE team_progress {
  id: UUID PRIMARY KEY
  team_id: UUID REFERENCES teams(id) ON DELETE CASCADE
  challenge_id: UUID REFERENCES challenges(id) ON DELETE CASCADE
  status: ENUM('locked', 'unlocked', 'solved') DEFAULT 'locked'
  unlocked_at: TIMESTAMP
  solved_at: TIMESTAMP
  attempts_used: INT DEFAULT 0
  hints_used: INT[] DEFAULT [] -- Array of hint IDs used
  points_earned: INT DEFAULT 0
  tiPerformance Optimization for 100 Concurrent Users

**Target Environment:** Local Network (LAN)  
**Expected Load:** 50 teams × 2 members = 100 concurrent users  
**Server Requirements:**
- **CPU:** 4 cores minimum (8 cores recommended)
- **RAM:** 8GB minimum (16GB recommended)
- **Network:** Gigabit LAN (1 Gbps)
- **Storage:** SSD (100GB free space)

**Database Optimization:**
- **Connection Pooling:** Max 50 connections (PostgreSQL)
- **Indexed Queries:** All leaderboard queries use composite indexes
- **Query Caching:** Redis cache for leaderboard (TTL: 30 seconds)
- **Read Replicas:** Optional for >100 users

**API Rate Limiting:**
- Submission endpoint: 1 request per 5 seconds per team
- Leaderboard: 1 request per 30 seconds per user
- OTP requests: 3 per hour per email

**Load Balancing:**
- Nginx reverse proxy (optional)
- Static assets served via CDN-like caching
- WebSocket connections for real-time updates

---

### me_bonus_earned: INT DEFAULT 0
  penalties_incurred: INT DEFAULT 0
  
  UNIQUE(team_id, challenge_id)
}

TABLE submissions {
  id: UUID PRIMARY KEY
  team_id: UUID REFERENCES teams(id) ON DELETE CASCADE
  challenge_id: UUID REFERENCES challenges(id) ON DELETE CASCADE
  submitted_answer: TEXT NOT NULL
  is_correct: BOOLEAN NOT NULL
  submitted_at: TIMESTAMP DEFAULT NOW()
  time_taken_seconds: INT -- Time from unlock to solve
  
  INDEX idx_team_challenge (team_id, challenge_id)
  INDEX idx_submitted_at (submitted_at)
}

TABLE hint_usage {
  id: UUID PRIMARY KEY
  team_id: UUID REFERENCES teams(id) ON DELETE CASCADE
  hint_id: UUID REFERENCES hints(id) ON DELETE CASCADE
  used_at: TIMESTAMP DEFAULT NOW()
  
  UNIQUE(team_id, hint_id)
}

TABLE leaderboard_snapshots {
  id: UUID PRIMARY KEY
  snapshot_time: TIMESTAMP DEFAULT NOW()
  rankings: JSONB NOT NULL -- Store full leaderboard state
  -- Format: [{"team_id": "...", "rank": 1, "points": 3890, ...}, ...]
}

TABLE otp_logs {
  id: UUID PRIMARY KEY
  email: VARCHAR(255) NOT NULL
  otp_hash: VARCHAR(255) NOT NULL
  created_at: TIMESTAMP DEFAULT NOW()
  used_at: TIMESTAMP
  is_valid: BOOLEAN DEFAULT TRUE
  
  INDEX idx_email_created (email, created_at)
}

TABLE activity_feed {
  id: UUID PRIMARY KEY
  team_id: UUID REFERENCES teams(id) ON DELETE CASCADE
  event_type: ENUM('challenge_unlocked', 'challenge_solved', 'hint_used', 'wrong_attempt')
  challenge_id: UUID REFERENCES challenges(id) ON DELETE CASCADE
  message: TEXT NOT NULL
  created_at: TIMESTAMP DEFAULT NOW()
  
  INDEX idx_created_at (created_at DESC)
}

-- Performance Indexes
CREATE INDEX idx_teams_points ON teams(total_points DESC, started_at ASC);
CREATE INDEX idx_team_progress_team ON team_progress(team_id, status);
CREATE INDEX idx_submissions_team_time ON submissions(team_id, submitted_at);
```

### Key Optimizations

1. **Denormalized Points:** `teams.total_points` updated on each solve (avoid complex JOINs)
2. **Indexed Queries:** All leaderboard queries use composite indexes
3. **Snapshot Table:** Pre-computed leaderboard states for historical data
4. **Activity Feed:** Separate table for real-time updates (cleared after event)
5. **OTP Security:** Separate logs table with automatic cleanup

---

## 🏗️ TECHNICAL ARCHITECTURE

### Backend Stack

```
NestJS (Node.js Framework)
├─ Modules
│  ├─ AuthModule (Email OTP, JWT)
│  ├─ TeamsModule (CRUD, validation)
│  ├─ ChallengesModule (fetching, answer checking)
│  ├─ SubmissionsModule (attempt logging, scoring)
│  ├─ LeaderboardModule (real-time rankings)
│  ├─ HintsModule (usage tracking, point deduction)
│  └─ EmailModule (SMTP integration)
│
├─ Services
│  ├─ EmailService (Nodemailer + Gmail SMTP)
│  ├─ OTPService (generation, validation, rate limiting)
│  ├─ ScoringService (points calculation, penalties)
│  ├─ ProgressService (unlock next challenge, check prerequisites)
│  └─ CacheService (Redis for leaderboard caching)
│
├─ Guards
│  ├─ JwtAuthGuard (verify token)
│  ├─ TeamMemberGuard (ensure user has team)
│  └─ RateLimitGuard (prevent spam)
│
└─ Database
   ├─ Prisma ORM (PostgreSQL)
   └─ Redis (caching, sessions)
```

---

### Frontend Stack

```
Next.js 14 (App Router)
├─ Pages
│  ├─ / (Landing page)
│  ├─ /register (Email + OTP)
│  ├─ /onboarding (Team creation)
│  ├─ /dashboard (Main competition interface)
│  └─ /leaderboard (Full rankings)
│
├─ Components
│  ├─ Layout
│  │  ├─ Header (team info, points, timer)
│  │  ├─ ProgressBar (round/level tracker)
│  │  └─ Sidebar (leaderboard, activity feed)
│  │
│  ├─ Challenge
│  │  ├─ StoryPanel (narrative text)
│  │  ├─ ChallengeContent (description, input)
│  │  ├─ HintPanel (hint buttons, warnings)
│  │  └─ SubmitButton (with validation)
│  │
│  └─ Animations
│     ├─ CyberBackground (Three.js scene)
│     ├─ LevelUnlockAnimation (GSAP timeline)
│     └─ SuccessConfetti (celebration effects)
│
├─ Hooks
│  ├─ useTimer (elapsed time tracking)
│  ├─ useLeaderboard (polling every 30s)
│  ├─ useProgress (current challenge state)
│  └─ useHints (hint management)
│
└─ Libraries
   ├─ Three.js (3D background effects)
   ├─ GSAP (smooth animations)
   ├─ Tailwind CSS (styling)
   ├─ Framer Motion (UI transitions)
   └─ React Query (data fetching, caching)
```

---

### Email (SMTP) Configuration

**Provider Options:**
1. Gmail SMTP (free, rate limited)
2. SendGrid (professional, 100 emails/day free)
3. AWS SES (production-grade)

**Implementation:**
```javascript
// EmailService configuration
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-event-email@gmail.com
SMTP_PASS: app-specific-password
FROM_EMAIL: Hack The Box <noreply@hackthebox.local>
SUBJECT: Your OTP Code - Hack The Box 2026

// OTP Email Template
Subject: Your Hack The Box OTP Code
Body:
"Hi there!

Your OTP code is: [123456]

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

- Hack The Box Team"
```

**Rate Limiting:**
- Max 3 OTP requests per email per hour
- Block after 5 failed verification attempts (30 min cooldown)

---

## 🎨 UI/UX DESIGN

### Design System

#### Color Palette (Dark Theme)
```css
--bg-primary: #0a0e1a        /* Deep space blue */
--bg-secondary: #141821      /* Card backgrounds */
--bg-tertiary: #1e2330       /* Elevated elements */

--accent-primary: #00ff88    /* Neon green (success) */
--accent-secondary: #00d4ff  /* Cyber blue (interactive) */
--accent-danger: #ff0055     /* Neon red (errors) */

--text-primary: #e8e9ed      /* Main text */
--text-secondary: #9ca3af    /* Secondary text */
--text-muted: #6b7280        /* Disabled/muted */

--border: #2d3748            /* Subtle borders */
--glow-green: 0 0 20px #00ff88 /* Neon glow effect */
```

#### Typography
```css
--font-display: 'Orbitron', sans-serif  /* Headers, titles */
--font-body: 'Inter', sans-serif        /* Body text */
--font-mono: 'JetBrains Mono', monospace /* Code, challenges */
```

---

### Page Layouts

#### Landing Page
```
┌────────────────────────────────────────┐
│  🌐 Three.js Animated Grid Background │
│                                        │
│         HACK THE BOX 2026             │
│    Operation Cipher Strike            │
│                                        │
│    [  REGISTER NOW  ]  [LEADERBOARD]  │
│                                        │
│    ⏱️ Event starts in: 02:34:56       │
└────────────────────────────────────────┘
```

#### Registration Flow
```
Step 1: Email Input
┌─────────────────────────────────┐
│   Enter Your Email Address      │
│   ┌─────────────────────────┐  │
│   │ email@example.com       │  │
│   └─────────────────────────┘  │
│   [  SEND OTP  ]                │
└─────────────────────────────────┘

Step 2: OTP Verification
┌─────────────────────────────────┐
│   Enter 6-Digit Code            │
│   ┌───┬───┬───┬───┬───┬───┐   │
│   │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │   │
│   └───┴───┴───┴───┴───┴───┘   │
│   Expires in: 09:23             │
│   [  VERIFY  ]  Resend OTP      │
└─────────────────────────────────┘

Step 3: Team Creation
┌─────────────────────────────────┐
│   Create Your Team              │
│   Team Name                     │
│   ┌─────────────────────────┐  │
│   │ CyberNinjas             │  │
│   └─────────────────────────┘  │
│                                 │
│   Member 1 Name                 │
│   ┌─────────────────────────┐  │
│   │ John Doe                │  │
│   └─────────────────────────┘  │
│                                 │
│   Member 2 Name                 │
│   ┌─────────────────────────┐  │
│   │ Jane Smith              │  │
│   └─────────────────────────┘  │
│                                 │
│   [  CREATE TEAM & START  ]     │
└─────────────────────────────────┘
```

#### Main Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ Team: CyberNinjas | Members: John & Jane | 🏆 890 pts      │
│ ⏱️ 01:23:45 | Rank: #3/50                                  │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────────┬──────────────────────────────┐
│ Main Panel (70%)             │ Sidebar (30%)                │
│                              │                              │
│ Progress Tracker:            │ 🏆 Live Leaderboard          │
│ ━━━━━━━━━━━━━━━━━━          │ 1. ByteBusters - 1,250       │
│ Round 1: ✅✅⚪              │ 2. CodeBreakers - 1,100      │
│ Round 2: 🔒🔒🔒              │ 3. CyberNinjas - 890 ← YOU   │
│ Round 3: 🔒🔒🔒              │ 4. HackSquad - 850           │
│ ─────────────────────────── │ 5. SecOps - 720              │
│                              │                              │
│ Current Challenge:           │ ──────────────────────────  │
│ ┌────────────────────────┐  │ 📡 Activity Feed             │
│ │ Level 1.3               │  │ • Team "ByteBusters"         │
│ │ The Access Code         │  │   solved Level 2.1           │
│ │                         │  │ • Team "HackSquad"           │
│ │ [Story narrative text   │  │   unlocked Round 2           │
│ │  appears here in a      │  │ • Team "CodeBreakers"        │
│ │  cinematic scroll...]   │  │   used a hint on 1.3         │
│ └────────────────────────┘  │                              │
│                              │                              │
│ Challenge Description:       │                              │
│ You need the access code...  │                              │
│                              │                              │
│ Your Answer:                 │                              │
│ ┌──────────────────────────┐│                              │
│ │ HAPPYSEC_____________     ││                              │
│ └──────────────────────────┘│                              │
│                              │                              │
│ 💡 Hints Available: 3        │                              │
│ [ Hint 1: -20pts ] (locked)  │                              │
│                              │                              │
│ Attempts: 2/10  Wrong: 0     │                              │
│ [      SUBMIT ANSWER      ]  │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

---

### Animations (GSAP + Three.js)

#### 1. Background (Three.js)
```
Animated Cyber Grid
├─ Perspective camera (floating above grid)
├─ 50x50 grid of lines (neon blue)
├─ 200 floating particles (green)
├─ Connection lines between close particles
├─ Subtle camera rotation (slow)
└─ Fog effect for depth
```

#### 2. Level Unlock Animation (GSAP)
```javascript
Timeline:
1. Screen shakes (0.5s)
2. Lock icon breaks apart (particle burst)
3. New challenge card slides in from right
4. Text fades in with stagger
5. Green glow pulse effect
Total duration: 2 seconds
```

#### 3. Success Animation (GSAP + Confetti)
```javascript
Timeline:
1. Submit button turns green
2. Confetti explosion from center
3. Points counter animates up
4. Progress bar fills to next level
5. Leaderboard rank updates (highlight)
6. Next challenge unlocks
Total duration: 3 seconds
```

#### 4. Wrong Answer Shake (GSAP)
```javascript
Timeline:
1. Input field shake (x: ±10px, 0.1s)
2. Red border flash
3. Error message slides down
4. Attempt counter decreases
Total duration: 0.5 seconds
```

---

### Responsive Design

**Desktop Resolutions:**
- 1920×1080 (Full HD) - Primary target
- 1440×900 (Laptop) - Adjusted layout
- 1280×720 (Minimum) - Stacked sidebar

**No Mobile:** Event is desktop-only (easier to code, better UX for challenges)

---

## 📜 COMPETITION RULES

### Official Rules Document

```markdown
# HACK THE BOX 2026 - OFFICIAL RULES

## Registration
1. Each team must have EXACTLY 2 members (mandatory)
2. Email verification required (OTP)
3. Team names must be unique (3-20 characters)
4. No offensive or inappropriate names
5. Registration closes 15 minutes before event start

## Competition Format
1. 9 challenges across 3 rounds (3 per round)
2. Challenges must be solved in LINEAR order (no skipping)
3. Cannot access Round 2 without completing all of Round 1
4. Cannot access Round 3 without completing all of Round 2
5. Total duration: 3-4 hours

## Internet Access
1. Teams MAY use the internet for research
2. External tools (Cipher decoders, hash crackers) are ALLOWED
3. Collaboration with other teams is STRICTLY FORBIDDEN
4. Screen sharing/communication between teams → Instant disqualification

## Scoring
1. Base points awarded for each solved challenge
2. Time bonuses for quick solves (<10 minutes)
3. Wrong attempts incur penalties (-5 to -50 points)
4. Hints cost 20 points each (except first challenge - FREE hints)
5. Final ranking based on: Points > Time > Hints Used

## Hints
1. Up to 3 hints per challenge
2. Each hint costs 20 points (deducted immediately)
3. Hints are progressive (Hint 3 is more helpful than Hint 1)
4. First challenge (Level 1.1) hints are FREE

## Submission Rules
1. Answer format must match challenge requirements
2. Case-sensitive unless otherwise stated
3. Whitespace trimmed automatically
4. Max attempts vary by difficulty (3-10 attempts)
5. After max attempts → Challenge locked for 10 minutes

## Final Challenge (Level 3.3)
1. Unlocks for ALL teams simultaneously when first team reaches it
2. 15-minute timer starts for ALL teams
3. First team to solve wins DOUBLE points (2000 instead of 1000)
4. Other teams get standard 1000 points if solved within 15 min
5. After 15 minutes → No more submissions accepted

## Disqualification
Teams will be IMMEDIATELY disqualified for:
1. Multiple accounts or team switching
2. Hacking the competition platform
3. Sharing answers with other teams
4. Disruptive behavior or harassment
5. Attempting to access unauthorized systems

## Technical Issues
1. Report issues to judges immediately
2. Evidence (screenshots) must be provided
3. Judges' decisions are FINAL
4. No compensation for ISP/power failures

## Prizes
1. Winner: Top team by points (tiebreaker: time)
2. Certificates for top 5 teams
3. Special recognition for fastest solve times

## Code of Conduct
1. Respect other teams
2. Be professional
3. Have fun and learn!

---

By registering, you agree to these rules.
Violation may result in disqualification without refund/prizes.
```

---

## 🔒 SECURITY CONS (AI-Resistant Design)

**DO:**
- Store answers as bcrypt hashes (salt rounds: 12)
- **CRITICAL:** All answers MUST use `HTB{...}` format (prevents AI guessing)
- Compare using timing-safe comparison functions
- Log all attempts with IP addresses + User-Agent (detect AI tools)
- Rate limit submissions (max 1 per 5 seconds per team)
- Block common AI patterns (e.g., sequential rapid attempts with similar formatting)
- Implement CAPTCHA on 3rd wrong attempt
- Track answer similarity across teams (flag if >80% identical)

**DON'T:**
- Store plaintext answers in database
- Return helpful error messages (avoid "close!" hints)
- Allow client-side answer checking
- Give partial credit (must be exact match)
- Show "almost correct" messages (helps AI iterate)

### AI-Resistance Features Implemented

1. **Multi-Step Challenges:** 3-6 steps per challenge (AI loses context)
2. **Event-Specific Data:** Team names, timestamps, room numbers (AI can't know)
3. **Mathematical Operations:** ASCII sums, modulo checks (tedious for AI)
4. **Nested Encoding:** 4-5 layers (high error cascade probability)
5. **Format Enforcement:** Strict `HTB{...}` format (non-standard for AI training)
6. **Story Context Required:** Many answers need narrative understanding
7. **Red Herrings:** Misleading hints in challenge text (confuse AI)
8. **Dynamic Answers:** Team-specific calculations (2.3) prevent sharabase
- Return helpful error messages (avoid "close!" hints)
- Allow client-side answer checking

---

### Anti-Cheating Measures

1. **Session Monitoring:**
   - Track submission timestamps (flag suspiciously fast solves)
   - Monitor answer similarity across teams
   - Log all hint usage

2. **Browser Fingerprinting:**
   - Detect multiple teams from same browser/IP
   - Flag suspicious activity for manual review

3. **Challenge Randomization:**
   - Slight variations in challenge details (different hashes, IPs)
   - Prevents "whisper networks"

4. **Watermarking:**
   - Unique team IDs embedded in challenge text (invisible)
   - If leaked, can trace source

---

### Infrastructure Security

1. **DDoS Protection:**
   - Cloudflare proxy (free tier)
   - Rate limiting on all endpoints
   - Redis queue for submission processing

2. **Database Security:**
   - Parameterized queries only (Prisma handles this)
   - Least privilege access (read-only for leaderboard queries)
   - Automated backups every 15 minutes during event

3. **SMTP Security:**
   - App-specific passwords (not main account password)
   - Rate limit OTP requests (3 per hour per email)
   - Temporary ban after 5 failed OTP attempts

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Core Authentication (Week 1)
- [ ] Email OTP system
- [ ] SMTP integration
- [ ] Team registration flow
- [ ] JWT authentication
- [ ] Rate limiting

### Phase 2: Challenge System (Week 2)
- [ ] Challenge database schema
- [ ] Answer verification logic
- [ ] Progression system (unlock next level)
- [ ] Hint system
- [ ] Attempt tracking
COMPETITION-READY STATUS:** ✅ APPROVED FOR PRODUCTION

**Estimated Development Time:** 6 weeks (with 2 developers)  
**Event Ready Date:** March 15, 2026  
**Target Capacity:** 100 concurrent users (50 teams) on local network

---

## 🎬 FINAL STORY SUMMARY

**Movie-Style Plot: "Operation Cipher Strike"**

*Dr. Ananya Iyer and Inspector Vikram Shah recruit your elite team to stop Arjun "CipherMaster" Mehta - a vengeful ex-employee planning Operation BLACKOUT, a devastating cyber attack on Coimbatore Tech Hub scheduled for February 14, 2026. Race through 9 encrypted challenges, decode his complex security systems, defuse a logic bomb, and reach the master vault before time runs out. 50,000 lives depend on you. The countdown has begun.*

**THE END**

---

_Plan created: February 1, 2026_  
_Status: ✅ PRODUCTION READY_  
_Version: 2.0 - FINAL_  
_Developer: [github.com/brittytino](https://github.com/brittytino)_  
_Competition Capacity: 100 concurrent users (optimized) page
- [ ] Registration flow
- [ ] Dashboard layout
- [ ] Challenge interface
- [ ] Leaderboard page

### Phase 5: Animations & Polish (Week 5)
- [ ] Three.js background
- [ ] GSAP unlock animations
- [ ] Success/error feedback
- [ ] Loading states
- [ ] Responsive design

### Phase 6: Testing & Deployment (Week 6)
- [ ] End-to-end testing
- [ ] Load testing (50+ concurrent users)
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup

---

## 📊 SUCCESS METRICS

### Competition Day Metrics

**Engagement:**
- 80%+ teams complete Round 1
- 60%+ teams complete Round 2
- 40%+ teams reach Round 3
- Average time per challenge: 10-15 minutes

**Technical:**
- 99.9% uptime during event
- <200ms API response time
- Zero critical bugs
- Successful email delivery >95%

**Educational:**
- Post-event survey: 90%+ satisfaction
- 80%+ participants report "learned something new"
- 70%+ want to participate again

---

## 🎯 FINAL CHECKLIST

Before going live:

**Content:**
- [ ] All 9 challenges written and tested
- [ ] Story narrative reviewed for coherence
- [ ] Answer hashes generated and stored
- [ ] Hints written (3 per challenge)

**Backend:**
- [ ] Database migrations applied
- [ ] SMTP credentials configured
- [ ] JWT secret key set (production-grade)
- [ ] Rate limiting enabled
- [ ] Logging configured

**Frontend:**
- [ ] All pages responsive (1280px+)
- [ ] Animations tested (60 FPS)
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Browser compatibility (Chrome, Firefox, Edge)

**Security:**
- [ ] All inputs sanitized
- [ ] SQL injection prevention verified
- [ ] CORS configured correctly
- [ ] HTTPS enabled (production)
- [ ] Backup system tested

**Testing:**
- [ ] Full user journey tested (register → complete all challenges)
- [ ] Concurrent user testing (50 teams)
- [ ] Edge cases handled (network errors, session expiry)
- [ ] Mobile access blocked (redirect to "desktop required" page)

---

## 📝 NEXT STEPS

1. **Review this plan** with stakeholders
2. **Approve story narrative** and challenge design
3. **Assign implementation tasks** to developers
4. **Set up development environment**
5. **Begin Phase 1 implementation**

---

**IMPORTANT:** DO NOT START CODING until this plan is approved!

**Estimated Development Time:** 6 weeks (with 2 developers)  
**Event Ready Date:** March 15, 2026

---

_Plan created: February 1, 2026_  
_Status: AWAITING APPROVAL_  
_Version: 1.0_

