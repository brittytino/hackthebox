import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hackthebox.local' },
    update: {},
    create: {
      email: 'admin@hackthebox.local',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.username);
  console.log('   📧 Email: admin@hackthebox.local');
  console.log('   🔑 Password: admin123');

  // Create Rounds with Story Context
  const round1 = await prisma.round.upsert({
    where: { order: 1 },
    update: {},
    create: {
      name: 'Round 1: The Breach Discovery',
      type: 'DECODE_THE_SECRET',
      order: 1,
      status: 'ACTIVE',
      description: 'Veera infiltrates the mall, discovers the command center. Decode encrypted terrorist communications.',
    },
  });
  console.log('✅ Round 1 created');

  const round2 = await prisma.round.upsert({
    where: { order: 2 },
    update: {},
    create: {
      name: 'Round 2: Infiltration',
      type: 'FIND_AND_CRACK',
      order: 2,
      status: 'PENDING',
      description: 'Veera discovers the Home Minister\'s betrayal. Crack password hashes and JWT tokens to expose the conspiracy.',
    },
  });
  console.log('✅ Round 2 created');

  const round3 = await prisma.round.upsert({
    where: { order: 3 },
    update: {},
    create: {
      name: 'Round 3: The Final Strike',
      type: 'CATCH_THE_FLAG',
      order: 3,
      status: 'PENDING',
      description: 'Race against time to decode the cyber attack payload and defuse Operation BLACKOUT.',
    },
  });
  console.log('✅ Round 3 created');

  // Ensure challenge seed is idempotent (prevents duplicate levels on repeated startup)
  await prisma.challenge.deleteMany({
    where: {
      roundId: {
        in: [round1.id, round2.id, round3.id],
      },
    },
  });
  console.log('🧹 Existing seeded challenges cleared');

  // ================================================================================
  // ROUND 1 CHALLENGES - THE BREACH DISCOVERY
  // ================================================================================

  const challenges1 = [
    {
      title: 'Level 1.1: The Intercepted Transmission',
      description: `Veera has tapped into the terrorist network and intercepted an encrypted transmission.
      
**INTERCEPTED MESSAGE:**
\`\`\`
dGF2Si1nZm5SLDI0RVItemJiRS5lcmllckY=
\`\`\`

**ENCRYPTION LAYERS DETECTED:** Base64 → ROT13 → Reverse

**VEERA'S BRIEFING:** "They're using triple-layer encryption. First decode Base64, then apply ROT13, then reverse the string. The command center location will be revealed."

**HOSTAGE STATUS:** 1,200 trapped | 0 rescued
**TERRORISTS:** Unknown number, all armed

Submit the decoded location in this format: \`CTF{decoded_location}\``,
      storyContext: `TIME: 3:47 AM | LOCATION: Hidden server room, basement level

Veera has managed to access the mall's backup server room. He's monitoring terrorist communications, but they're using triple-layer encryption. Decode this transmission to reveal the location of Saif's command center.`,
      characterMessage: "I've tapped into their network. They're overconfident—using predictable encoding. Decode this transmission and tell me where their command center is. I'll handle the rest. Move fast.",
      flag: 'CTF{Server.Room-ER42,East-Wing}',
      points: 100,
      order: 1,
      difficulty: 'easy',
      hints: 'Use this exact order only: 1) Base64 decode the intercepted string 2) apply ROT13 to that result 3) reverse the full string. Submit exactly as shown (including punctuation) inside CTF{...}.',
    },
    {
      title: 'Level 1.2: The Fragmented Server Map',
      description: `Saif has fragmented the server room access code across three encrypted files. You need to decode all three fragments and combine them to form the complete access code.

**FRAGMENT A (HEX):**
\`\`\`
43544623
\`\`\`

**FRAGMENT B (BINARY):**
\`\`\`
01000001 01100011 01100011 01100101 01110011 01110011
\`\`\`

**FRAGMENT C (CAESAR CIPHER - Shift 7):**
\`\`\`
Nyhualk
\`\`\`

**VIKRAM'S BRIEFING:** "We've intercepted three encrypted files from their network. Each fragment uses different encryption: Hex, Binary, and Caesar cipher with shift 7. Decode all three and assemble them in order (A + B + C) to form the access code."

**HOSTAGE STATUS:** 1,200 trapped | 0 rescued  
**TIME TO NEXT EXECUTION:** 15 minutes

Combine the three decoded fragments: Fragment_A + Fragment_B + Fragment_C`,
      storyContext: `TIME: 4:15 AM | LOCATION: Approaching Server Room ER-42

Veera needs the access code, but it's split across three encrypted files. Each one is encrypted differently (Hex, Binary, Caesar cipher). Decode all three and combine them to unlock the door before Veera is discovered by patrols.`,
      characterMessage: "Decode them all and assemble in order: Fragment A, Fragment B, Fragment C. Veera's counting on you.",
      flag: 'CTF#AccessGranted',
      points: 150,
      order: 2,
      difficulty: 'medium',
      hints: 'Decode each fragment separately: A (hex→ASCII), B (binary bytes→ASCII), C (Caesar shift -7). Then concatenate strictly as A+B+C with no spaces. Expected pattern starts with CTF#.',
    },
    {
      title: 'Level 1.3: The Time-Locked Vault',
      description: `Server Room ER-42 contains a biometric time-locked vault. The vault uses a team-specific mathematical formula based on timestamps and parameters.

**VAULT ACCESS FORMULA:**
\`\`\`
code = MD5(teamName + "|" + memberCount + "|" + currentRound + "|" + salt)
where salt = "CIPHER2026"
\`\`\`

**YOUR TASK:**
1. Use YOUR team name (as registered)
2. Member count = 2 (standard)
3. Current round = 1
4. Salt = "CIPHER2026"
5. Concatenate: teamName|2|1|CIPHER2026
6. Calculate MD5 hash
7. Take first 8 characters

**EXAMPLE (Team "TestTeam"):**
\`\`\`
Input: TestTeam|2|1|CIPHER2026
MD5: aabbccdd11223344...
Code: aabbccdd
\`\`\`

**VEERA'S BRIEFING:** "The vault is time-locked with personalized security. Every team calculates their own code. Use the formula with YOUR team data."

**HOSTAGE STATUS:** 1,180 trapped | 20 rescued  
**BREAKING:** First hostage executed on live TV

Submit in format: \`CTF{first_8_chars_of_md5}\` (lowercase)`,
      storyContext: `TIME: 4:45 AM | LOCATION: Inside Server Room ER-42

Veera finds the vault containing terrorist attack plans. The security log shows a mathematical unlock formula based on team-specific parameters. Calculate your unique code to open the vault.`,
      characterMessage: "This is personalized security—every team calculates their own code. Formula requires your team's exact name, member count, and current round. I need this NOW.",
      flag: 'TEAM_SPECIFIC', // Special flag that will be validated differently
      points: 200,
      order: 3,
      difficulty: 'hard',
      hints: 'Build the input exactly as TeamName|2|1|CIPHER2026 (pipes included, no extra spaces). Compute MD5, take first 8 lowercase hex characters, then submit as CTF{xxxxxxxx}.',
    },
  ];

  for (const challenge of challenges1) {
    let flagHash: string;
    if (challenge.flag === 'TEAM_SPECIFIC') {
      // For team-specific challenges, store a special marker
      flagHash = await bcrypt.hash('__TEAM_SPECIFIC__', 10);
    } else {
      flagHash = await bcrypt.hash(challenge.flag.toLowerCase(), 10);
    }

    await prisma.challenge.create({
      data: {
        roundId: round1.id,
        title: challenge.title,
        description: challenge.description,
        storyContext: challenge.storyContext,
        characterMessage: challenge.characterMessage,
        points: challenge.points,
        flagHash: flagHash,
        order: challenge.order,
        hints: challenge.hints,
        difficulty: challenge.difficulty,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${challenges1.length} challenges for Round 1`);

  // ================================================================================
  // ROUND 2 CHALLENGES - INFILTRATION
  // ================================================================================

  const challenges2 = [
    {
      title: 'Level 2.1: The Corrupted Hash Trail',
      description: `The hard drive contains three password-protected databases. Each password is hashed differently.

**DATABASE 1 (MD5):**
\`\`\`
5f4dcc3b5aa765d61d8327deb882cf99
\`\`\`

**DATABASE 2 (SHA-1):**
\`\`\`
5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
\`\`\`

**DATABASE 3 (SHA-256):**
\`\`\`
5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
\`\`\`

**VEERA'S INSTRUCTIONS:**
"Crack all three hashes. Take the first 3 letters of each password. Combine them with '42' at the end."

**FORMAT:** \`CTF{abc+def+ghi+42}\` where abc, def, ghi are first 3 letters of each password (lowercase)

**EXAMPLE:** If passwords were "hello", "world", "test" → \`CTF{hel+wor+tes+42}\`

**HOSTAGE STATUS:** 950 trapped | 250 rescued  
**ALERT:** Government preparing to release Farooq

Crack the hashes and combine as instructed.`,
      storyContext: `TIME: 5:12 AM | LOCATION: Inside the vault, analyzing recovered hard drive

The hard drive contains three separate databases protected by password hashes (MD5, SHA-1, SHA-256). Each database holds critical intel: sleeper cell identities, financial backers, and the cyber attack payload.`,
      characterMessage: "Crack those hashes. I need the first 3 letters of each password, combined with '42'. Make it happen.",
      flag: 'CTF{pas+pas+pas+42}',
      points: 250,
      order: 1,
      difficulty: 'medium',
      hints: 'All 3 hashes resolve to the same plaintext password. Extract first 3 letters from each cracked password and keep lowercase. Final format must be CTF{xxx+xxx+xxx+42}.',
    },
    {
      title: 'Level 2.2: The JWT Inception',
      description: `The terrorist admin panel requires JWT authentication. The token has been hex-encoded to evade detection.

**INTERCEPTED TOKEN (HEX-ENCODED):**
\`\`\`
65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a5a574e795a5851694f694a47513051785a7a4e456158703551574d3165554669533238325132356d5a46496966512e62576c7a63326c766267
\`\`\`

**YOUR MISSION:**
1. Decode the hexadecimal to get the JWT token
2. The JWT has 3 parts: header.payload.signature
3. Base64 decode the payload (middle part)
4. Extract the "secret" field value
5. Reverse the secret string

**VIKRAM'S BRIEFING:** "The JWT is hex-encoded. Decode it, extract the payload, find the secret field, and reverse it. That's your admin access key."

**HOSTAGE STATUS:** 720 trapped | 480 rescued  
**BREAKING:** Home Minister's execution appears STAGED

Submit reversed secret in format: \`CTF{reversed_secret}\``,
      storyContext: `TIME: 5:50 AM | LOCATION: Terrorist admin panel

The admin panel requires JWT authentication. The token has been hex-encoded to evade detection. Decode the hex, extract the JWT payload, retrieve the secret, and reverse it to gain full control.`,
      characterMessage: "Decode that JWT—I need admin access to their systems to prove the Home Minister is working WITH Saif.",
      flag: 'CTF{RdfnC6oKbAy5cAyziD3g1DCF}',
      points: 300,
      order: 2,
      difficulty: 'hard',
      hints: 'Convert hex dump to ASCII first, then split JWT as header.payload.signature. Decode only payload (middle) from Base64, copy secret field value exactly, reverse it character-by-character, then wrap in CTF{...}.',
    },
    {
      title: 'Level 2.3: The Pattern Lock',
      description: `The final database uses team-specific pattern lock to prevent answer sharing.

**UNLOCK FORMULA:**
\`\`\`
hash = SHA256(teamName + progress + salt)
where:
  progress = number of challenges solved so far
  salt = "CIPHER2026"
unlock_code = first 8 characters of hash
\`\`\`

**YOUR CALCULATION:**
1. Use YOUR team name (as registered)
2. Progress = 5 (you've solved 5 challenges to get here)
3. Salt = "CIPHER2026"
4. Concatenate: teamName + "5" + "CIPHER2026"
5. Calculate SHA-256 hash
6. Take first 8 characters (lowercase)

**EXAMPLE (Team "TestTeam"):**
\`\`\`
Input: TestTeam5CIPHER2026
SHA256: a1b2c3d4e5f6...
Code: a1b2c3d4
\`\`\`

**ALTHAF'S BRIEFING:** "This lock is personalized. Calculate YOUR hash based on YOUR team data. First team to unlock gets the full attack plan."

**HOSTAGE STATUS:** 520 trapped | 680 rescued  
**COUNTDOWN TO BORDER CROSSING:** 3 hours

Submit: \`CTF{first_8_sha256_chars}\` (lowercase)`,
      storyContext: `TIME: 6:15 AM | LOCATION: Final encrypted database

The final database containing the cyberattack payload and February 14 activation details is protected by a team-specific pattern lock. Calculate your unique SHA-256 hash to unlock it.`,
      characterMessage: "This lock is personalized to prevent teams from sharing answers. Calculate YOUR hash based on YOUR data. Do it now—we're running out of time.",
      flag: 'TEAM_SPECIFIC',
      points: 350,
      order: 3,
      difficulty: 'hard',
      hints: 'Concatenate exactly: TeamName + 5 + CIPHER2026 (no separators). SHA-256 hash that string, take first 8 lowercase hex chars, submit as CTF{xxxxxxxx}.',
    },
  ];

  for (const challenge of challenges2) {
    let flagHash: string;
    if (challenge.flag === 'TEAM_SPECIFIC') {
      flagHash = await bcrypt.hash('__TEAM_SPECIFIC__', 10);
    } else {
      flagHash = await bcrypt.hash(challenge.flag.toLowerCase(), 10);
    }

    await prisma.challenge.create({
      data: {
        roundId: round2.id,
        title: challenge.title,
        description: challenge.description,
        storyContext: challenge.storyContext,
        characterMessage: challenge.characterMessage,
        points: challenge.points,
        flagHash: flagHash,
        order: challenge.order,
        hints: challenge.hints,
        difficulty: challenge.difficulty,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${challenges2.length} challenges for Round 2`);

  // ================================================================================
  // ROUND 3 CHALLENGES - THE FINAL STRIKE
  // ================================================================================

  const challenges3 = [
    {
      title: 'Level 3.1: The Payload Hunt',
      description: `The cyberattack payload is split across 4 encrypted fragments. Decode all four to understand the activation mechanism.

**FRAGMENT 1 (BINARY):**
\`\`\`
01000011 01010100 01000110 01111011
\`\`\`

**FRAGMENT 2 (HEX):**
\`\`\`
426c61636b6f75742e
\`\`\`

**FRAGMENT 3 (BASE64):**
\`\`\`
RmViMTQu
\`\`\`

**FRAGMENT 4 (ROT13):**
\`\`\`
Cynlybat}
\`\`\`

**VIKRAM'S BRIEFING:** "Four fragments, four encodings. Decode Binary → Hex → Base64 → ROT13, then concatenate all four in exact order."

**VEERA STATUS:** Injured but operational  
**HOSTAGE STATUS:** 280 trapped | 920 rescued  
**BREAKING:** Farooq crossed Pakistan border

Combine all fragments: Fragment1 + Fragment2 + Fragment3 + Fragment4`,
      storyContext: `TIME: 7:10 AM | LOCATION: Decoding the cyberattack files

Veera has escaped capture. The cyberattack payload is split across 4 encrypted fragments (Binary, Hex, Base64, ROT13). Decode all four to understand the activation mechanism—crucial for building the kill switch.`,
      characterMessage: "We need those payload fragments decoded NOW. If we understand how Operation BLACKOUT activates, we can reverse-engineer the kill switch.",
      flag: 'CTF{Blackout.Feb14.Payload}',
      points: 400,
      order: 1,
      difficulty: 'hard',
      hints: 'Treat each fragment independently, then join in strict order 1→2→3→4. Do not decode one fragment twice. Final combined text should already resemble a full CTF{...} flag when assembled.',
    },
    {
      title: 'Level 3.2: The Logic Bomb Defusal',
      description: `CRITICAL ALERT: A logic bomb is embedded in the attack script. Defuse it using the correct sequence.

**ENCRYPTED LOGIC BOMB CODE:**
\`\`\`
4d4445774d4441774d5445674d4445774d5441784d4441674d4445774d4441784d5441674d4445784d5445774d5445674d4445774d4441784d4441674d4445784d4441784d4445674d4445784d4441784d5441674d4445784d5441784d4445674d4445784d5441774d5445674d4445784d4441774d4445674d4445784d4445784d4441674d4441784d4445784d5441674d4445774d4445774d5445674d4445784d4445774d4445674d4445784d4445784d4441674d4445784d4445784d4441674d4445784d5441774d5445674d4445784d5441784d5445674d4445784d4445774d4445674d4445784d5441784d4441674d4445784d4441774d5445674d4445784d4445774d4441674d4441784d4445784d5441674d4445774d4445784d5445674d4445784d5441784d5441674d4445784d4441784d4445674d4445784d5441774d5441674d4445784d5441774d5441674d4445784d4445784d5445674d4445784d4441784d4441674d4445784d4441784d4445674d4445784d5445784d44453d
\`\`\`

**DEFUSAL SEQUENCE:**
1. Hex decode the entire string
2. You'll get Base64 - decode it
3. You'll get ROT13 - decode it 
4. You'll get Binary - convert to ASCII
5. Final output should be a complete flag string

**VEERA'S WARNING:** "ONE MISTAKE = CITY GOES DARK. Follow the sequence precisely: Hex → Base64 → ROT13 → Binary → ASCII. Do not skip any step."

**HOSTAGE STATUS:** 85 trapped | 1,115 rescued  
**TIME TO LOGIC BOMB TRIGGER:** 10 minutes  
**SAIF STATUS:** Surrounded, final standoff

Submit the final decoded message in format: \`CTF{decoded_message}\``,
      storyContext: `TIME: 7:35 AM | LOCATION: Main attack script analysis

CRITICAL ALERT: A logic bomb is embedded in the attack script. If not defused correctly, Operation BLACKOUT will trigger IMMEDIATELY instead of waiting until February 14. ONE MISTAKE = CITY GOES DARK.`,
      characterMessage: "Logic bomb in the code. If you don't defuse it perfectly—correct sequence, correct validation—the worm triggers RIGHT NOW. Do NOT get this wrong.",
      flag: 'CTF{Defusal.Killswitch.Overrode}',
      points: 450,
      order: 2,
      difficulty: 'hard',
      hints: 'Follow the chain without skipping: Hex → Base64 → ROT13 → Binary → ASCII. After final plaintext, compute ASCII sum check exactly as instructed before submitting CTF{...}.',
    },
    {
      title: 'Level 3.3: The Master Vault (FINAL BOSS)',
      description: `🚨 ALERT TO ALL TEAMS 🚨

Veera has recaptured Umar Farooq and extracted "The Phantom's" identity: SARAVANA.

The encrypted server contains the **MASTER KILL SWITCH** for Operation BLACKOUT.

**MASTER VAULT CHALLENGE:**
This vault combines EVERY technique you've mastered:

**ENCRYPTED VAULT DATA:**
\`\`\`
{
  "layer1_hex": "65794a306232746c62694936496d5635536d686952324e7054326c4b535656365354646f61556c7a535735534e574e4453545a4a61334259566b4e4b4f53356c65556f7957566857633252474f584a615747747054326c4b645531584f486c6a524531705a6c4575596c6447656d5248566e6b6966513d3d",
  "layer2_instruction": "Decode layer1 hex to text. The result is Base64.",
  "layer3_instruction": "Decode Base64 to JSON. Extract the token field (JWT).",
  "layer4_instruction": "Decode JWT payload and read vault_key (ROT13 encoded).",
  "layer5_instruction": "ROT13 vault_key to get final 6-char code.",
  "final_format": "CTF{MASTER_<code>_VAULT}"
}
\`\`\`

**YOUR MISSION:**
1. Hex decode layer1 → Get Base64
2. Base64 decode → Get JSON with JWT
3. Decode JWT → Extract payload → Find vault_key (ROT13 encoded)
4. ROT13 decode vault_key → Get final 6-character code
5. ROT13 decode vault_key → final 6-character code
6. Format: CTF{MASTER_code_VAULT}

⏰ **FIRST TEAM TO SOLVE: 2000 POINTS (DOUBLE)**  
⏰ **OTHER TEAMS (within 30 min): 1000 POINTS**  
⏰ **AFTER 30 MINUTES: CHALLENGE LOCKS FOREVER**

**OPERATION BLACKOUT STATUS:** Armed, Feb 14 trigger ready  
**STAKES:** 50,000 jobs | ₹2,000 crore | National security

THE CITY IS COUNTING ON YOU. DECODE THE MASTER VAULT. SAVE COIMBATORE. 

**BEGIN NOW.**`,
      storyContext: `TIME: 8:00 AM (Operation Finale) | LOCATION: Saravana's encrypted server

Joint RAW-Police raid recovered Saravana's encrypted server containing the MASTER KILL SWITCH for Operation BLACKOUT. This vault is protected by EVERY technique you've learned. First team to decode stops Operation BLACKOUT permanently.`,
      characterMessage: "This is it. Everything you've learned. Every technique you've mastered. The kill switch is in that vault. First team to crack it stops Operation BLACKOUT permanently. The clock starts NOW.",
      flag: 'CTF{MASTER_a1b2c3_VAULT}', // Example - actual will be calculated
      points: 1000,
      order: 3,
      difficulty: 'hard',
      hints: 'Automate this challenge: decode layer1 hex → Base64 JSON → extract token JWT → decode payload → read vault_key → ROT13 it to get the 6-character code, then submit CTF{MASTER_code_VAULT}.',
    },
  ];

  for (const challenge of challenges3) {
    const flagHash = await bcrypt.hash(challenge.flag.toLowerCase(), 10);
    await prisma.challenge.create({
      data: {
        roundId: round3.id,
        title: challenge.title,
        description: challenge.description,
        storyContext: challenge.storyContext,
        characterMessage: challenge.characterMessage,
        points: challenge.points,
        flagHash: flagHash,
        order: challenge.order,
        hints: challenge.hints,
        difficulty: challenge.difficulty,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${challenges3.length} challenges for Round 3`);

  console.log('\n🎉 Operation Cipher Strike - Database Seeded!\n');
  console.log('📝 Admin Access:');
  console.log('   📧 Email: admin@hackthebox.local');
  console.log('   🔑 Password: admin123');
  console.log('\n🎮 Competition Structure:');
  console.log('   🔴 Round 1: The Breach Discovery (3 challenges)');
  console.log('   🟡 Round 2: Infiltration (3 challenges)');
  console.log('   🔴 Round 3: The Final Strike (3 challenges)');
  console.log('\n🚀 Story-driven CTF ready to launch!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
