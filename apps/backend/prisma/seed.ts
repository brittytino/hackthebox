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
      description: `SIGNAL INTERCEPT #0147-A
SOURCE: Encrypted relay node | PRIORITY: ALPHA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dGF2Si1nZm5SLDI0RVItemJiRS5lcmllckY=

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The intercepted transmission is believed to contain the location of Saif's command center inside the mall. Intelligence analysts confirm multiple encoding layers were applied to the original plaintext before transmission.

Decode the transmission and submit the location.

Flag format: CTF{decoded_location}`,
      storyContext: `TIME: 3:47 AM | LOCATION: Hidden server room, basement level

Veera has managed to access the mall's backup server room and intercepted an encrypted transmission from the terrorist comms relay. The message contains the command center coordinates.`,
      characterMessage: "I've tapped into their relay. This transmission has the command center location — but it's been through multiple encoding passes. Figure out what they used and reverse it. Move fast.",
      flag: 'CTF{Server.Room-ER42,East-Wing}',
      points: 100,
      order: 1,
      difficulty: 'easy',
      hintPenalty: 30,
      hints: 'The trailing "=" character is a signature of a common encoding. The data has been transformed three times. Work from the outermost layer inward.',
    },
    {
      title: 'Level 1.2: The Fragmented Server Map',
      description: `FRAGMENTED ACCESS CODE — SERVER ROOM ER-42

Three encrypted fragments recovered from separate terrorist relay nodes. Each fragment uses a different encoding scheme. Decode all three and assemble in exact order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRAGMENT A:
43544623

FRAGMENT B:
01000001 01100011 01100011 01100101 01110011 01110011

FRAGMENT C:
Nyhualk

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identify the encoding used for each fragment. Decode all three and concatenate in order: A + B + C

Submit the complete assembled access code exactly as decoded.`,
      storyContext: `TIME: 4:15 AM | LOCATION: Approaching Server Room ER-42

The server room access code has been split across three encrypted files on the terrorist network. Veera is 50 meters away with patrols closing in. He needs the complete code now.`,
      characterMessage: "Three fragments, three different encodings. Figure out what each one is, decode them, and assemble in order — A then B then C. No room for error.",
      flag: 'CTF#AccessGranted',
      points: 150,
      order: 2,
      difficulty: 'medium',
      hintPenalty: 50,
      hints: 'Fragment A is numeric pairs representing character codes. Fragment B has 8-digit groups of two possible values. Fragment C is alphabetic — the letters have been shifted by a fixed amount.',
    },
    {
      title: 'Level 1.3: The Time-Locked Vault',
      description: `BIOMETRIC VAULT — PERSONALISED SECURITY LOCK

The vault protecting the terrorist attack plans uses a team-specific access code derived from your registration data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VAULT SECURITY PROTOCOL:

  Input:   <team_name>|<member_count>|<round>|<salt>
  Hash:    MD5
  Code:    First 8 hex characters (lowercase)

  Parameters:
    member_count = 2
    round        = 1
    salt         = CIPHER2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each team's code is unique. No answer sharing is possible.

Submit: CTF{your_8_char_hex_code}`,
      storyContext: `TIME: 4:45 AM | LOCATION: Inside Server Room ER-42

The vault contains Saif's full attack blueprint. The biometric lock requires a team-specific mathematical computation — every team gets a different answer.`,
      characterMessage: "The vault uses personalised security. Your code depends on your team's exact registration data. Compute it precisely — I cannot wait.",
      flag: 'TEAM_SPECIFIC',
      points: 200,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 75,
      hints: 'Build the input string with pipe separators exactly as shown: TeamName|2|1|CIPHER2026. Use an online MD5 calculator. First 8 lowercase hex chars.',
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
        hintPenalty: challenge.hintPenalty,
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
      description: `ENCRYPTED CREDENTIALS — RECOVERED HARD DRIVE

Three password-protected databases recovered from the vault. Each database is secured with a hashed password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE ALPHA:
5f4dcc3b5aa765d61d8327deb882cf99

DATABASE BETA:
5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8

DATABASE GAMMA:
5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MASTER KEY ASSEMBLY:
Crack all three hashes. Take the first 3 characters of each cracked password (lowercase). Combine using the format below.

Flag format: CTF{first3+second3+third3+42}`,
      storyContext: `TIME: 5:12 AM | LOCATION: Inside the vault, analyzing recovered hard drive

The hard drive holds three separate databases — sleeper cell identities, financial backers, and the BLACKOUT payload. Each is secured by a different password hash.`,
      characterMessage: "Three locked databases. Crack every hash, extract the master key. The government is about to release Farooq — this evidence is the only thing that can stop it.",
      flag: 'CTF{pas+pas+pas+42}',
      points: 250,
      order: 1,
      difficulty: 'medium',
      hintPenalty: 80,
      hints: 'Identify each hash type by its character length (32, 40, 64 hex chars). Use online hash lookup databases or cracking tools. The passwords may be simpler than you expect.',
    },
    {
      title: 'Level 2.2: The JWT Inception',
      description: `ADMIN PANEL — OBFUSCATED AUTHENTICATION TOKEN

An authentication token intercepted from the terrorist admin panel. The token has been encoded to evade automated network scanners.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOKEN DATA:
65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a5a574e795a5851694f694a47513051785a7a4e456158703551574d3165554669533238325132356d5a46496966512e62576c7a63326c766267

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract the hidden credential from the decoded token structure. The credential has been reversed as an additional security measure.

Flag format: CTF{reversed_credential}`,
      storyContext: `TIME: 5:50 AM | LOCATION: Terrorist admin panel

The admin panel uses an obfuscated authentication token. Vikram has spotted evidence the Home Minister's "execution" was staged theater. Decode the token to pull admin logs proving the conspiracy.`,
      characterMessage: "That token holds proof the Home Minister is working with Saif. Strip away the encoding, find the credential hidden inside, and reverse it. This changes everything.",
      flag: 'CTF{RdfnC6oKbAy5cAyziD3g1DCF}',
      points: 300,
      order: 2,
      difficulty: 'hard',
      hintPenalty: 100,
      hints: 'The outer encoding is hexadecimal (pairs of hex digits = one ASCII character). The inner structure is a well-known web authentication format with three dot-separated Base64 sections.',
    },
    {
      title: 'Level 2.3: The Pattern Lock',
      description: `PATTERN LOCK — TEAM-SPECIFIC SECURITY

The final database uses a personalised lock that prevents answer sharing between teams.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UNLOCK FORMULA:

  Input:   <team_name><challenges_solved><salt>
  Hash:    SHA-256
  Code:    First 8 hex characters (lowercase)

  Parameters:
    challenges_solved = 5
    salt              = CIPHER2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each team's code is unique. No answer sharing is possible.

Submit: CTF{your_8_char_hex_code}`,
      storyContext: `TIME: 6:15 AM | LOCATION: Final encrypted database

The last database containing the BLACKOUT worm payload uses a team-specific pattern lock. Althaf demands it cracked before Farooq crosses the border.`,
      characterMessage: "This lock changes per team — no shortcuts, no sharing. Compute your unique hash and unlock the full BLACKOUT blueprint. Clock is ticking.",
      flag: 'TEAM_SPECIFIC',
      points: 350,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 120,
      hints: 'Concatenate directly without separators: YourTeamName5CIPHER2026 — no pipes, no spaces. SHA-256 hash that full string, take first 8 lowercase hex characters.',
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
        hintPenalty: challenge.hintPenalty,
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
      description: `OPERATION BLACKOUT — PAYLOAD FRAGMENTS

The cyberattack payload has been split into four encrypted fragments. Decode each fragment independently and combine in exact order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRAGMENT 1:
01000011 01010100 01000110 01111011

FRAGMENT 2:
426c61636b6f75742e

FRAGMENT 3:
RmViMTQu

FRAGMENT 4:
Cnlybnq}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each fragment uses a different encoding. Decode all four and concatenate in strict order: 1 + 2 + 3 + 4

Submit the fully assembled string as your flag.`,
      storyContext: `TIME: 7:10 AM | LOCATION: Decoding the cyberattack files

Veera escaped capture with Aparna's help. The BLACKOUT payload is fragmented across four encrypted pieces. Understanding the activation mechanism is critical to building the kill switch.`,
      characterMessage: "Four fragments, four different encodings. Figure out what each one is. Decode them all and combine in order. We need the full payload to build the kill switch.",
      flag: 'CTF{Blackout.Feb14.Payload}',
      points: 400,
      order: 1,
      difficulty: 'hard',
      hintPenalty: 150,
      hints: 'Each fragment uses a different common encoding. Look at the character patterns: one uses only 0/1 digits, one is hex pairs, one has padding indicators, and one is alphabetic substitution. Combine decoded results in order 1-2-3-4.',
    },
    {
      title: 'Level 3.2: The Logic Bomb Defusal',
      description: `CRITICAL ALERT — LOGIC BOMB ARMED

A logic bomb is embedded in the attack script. If triggered, Operation BLACKOUT activates immediately. The defusal code is buried under multiple nested encoding layers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENCODED PAYLOAD:
4d4445774d4441774d5445674d4445774d5441784d4441674d4445774d4441784d5441674d4445784d5445774d5445674d4445774d4441784d4441674d4445784d4441784d4445674d4445784d4441784d5441674d4445784d5441784d4445674d4445784d5441774d5445674d4445784d4441774d4445674d4445784d4445784d4441674d4441784d4445784d5441674d4445774d4445774d5445674d4445784d4445774d4445674d4445784d4445784d4441674d4445784d4445784d4441674d4445784d5441774d5445674d4445784d5441784d5445674d4445784d4445774d4445674d4445784d5441784d4441674d4445784d4441774d5445674d4445784d4445774d4441674d4441784d4445784d5441674d4445774d4445784d5445674d4445784d5441784d5441674d4445784d4441784d4445674d4445784d5441774d5441674d4445784d5441774d5441674d4445784d4445784d5445674d4445784d4441784d4441674d4445784d4441784d4445674d4445784d5445784d44453d

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Peel back every encoding layer until you reach the plaintext. The fully decoded output is your flag.

Submit the complete decoded flag string.`,
      storyContext: `TIME: 7:35 AM | LOCATION: Main attack script analysis

CRITICAL: A logic bomb in Saif's attack script will trigger BLACKOUT immediately if not defused. The defusal code is hidden under multiple nested encoding layers.`,
      characterMessage: "Logic bomb detected — multiple layers of encoding protecting the defusal code. Strip every layer carefully. The final decoded output is what you submit. Do NOT get this wrong.",
      flag: 'CTF{Defusal.Killswitch.Overrode}',
      points: 450,
      order: 2,
      difficulty: 'hard',
      hintPenalty: 175,
      hints: 'Start by converting the outermost hex to ASCII text. The result is still encoded — keep decoding. There are multiple nested layers. The final output is a complete flag string including CTF{...}.',
    },
    {
      title: 'Level 3.3: The Master Vault (FINAL BOSS)',
      description: `MASTER VAULT — OPERATION BLACKOUT KILL SWITCH

Saravana "The Phantom" has been identified. His encrypted server contains the master kill switch. The vault is protected by multiple layers of encoding — use every technique you have mastered.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VAULT DATA:
65794a306232746c62694936496d5635536d686952324e7054326c4b535656365354646f61556c7a535735534e574e4453545a4a61334259566b4e4b4f53356c65556f7957566857633252474f584a615747747054326c4b645531584f486c6a524531705a6c4575596c6447656d5248566e6b6966513d3d

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Work through every encoding layer to extract the 6-character vault code hidden deep inside.

Flag format: CTF{MASTER_<6char_code>_VAULT}

FIRST TEAM TO SOLVE: 2x POINTS
THE CITY IS COUNTING ON YOU.`,
      storyContext: `TIME: 8:00 AM (Operation Finale) | LOCATION: Saravana's encrypted server

A joint RAW-Police raid seized the server containing the MASTER KILL SWITCH. The vault is protected by every technique encountered so far. First team to crack it stops Operation BLACKOUT permanently.`,
      characterMessage: "This is everything. Every technique, every skill. The kill switch is buried in that vault. Crack it and this is over. First team to solve wins it all.",
      flag: 'CTF{MASTER_a1b2c3_VAULT}',
      points: 1000,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 400,
      hints: 'The outer layer is hex encoding. Inside you will find nested structures — each layer reveals the next. Look for common data formats (JSON, web tokens). A final alphabetic transformation reveals the vault code.',
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
        hintPenalty: challenge.hintPenalty,
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
