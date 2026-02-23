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

    The relay packet above was captured minutes before a coordinated movement inside the mall perimeter.
    Analysts confirm the payload contains an operational location string required for field access.

    Recover the exact flag from the intercepted transmission and submit it unchanged.`,
      storyContext: `TIME: 3:47 AM | LOCATION: Hidden server room, basement level

Veera has managed to access the mall's backup server room and intercepted an encrypted transmission from the terrorist comms relay. The message contains the command center coordinates.`,
      characterMessage: "I've tapped into their relay. This transmission has the command center location — but someone worked hard to hide it. Figure out what they did and undo it. Move fast.",
      flag: 'CTF{Server.Room-ER42,East-Wing}',
      points: 100,
      order: 1,
      difficulty: 'easy',
      hintPenalty: 30,
      hints: 'Start by identifying the encoding family from character set and padding. After decoding once, validate whether the output is readable or transformed again.',

    },
    {
      title: 'Level 1.2: The Fragmented Server Map',
      description: `FRAGMENTED ACCESS CODE — SERVER ROOM ER-42

    Three seized packets from independent relay paths appear to be parts of one authorization phrase.
    Integrity checks show no packet is redundant.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    FRAGMENT A:
    67 84 70 35

    FRAGMENT B:
    101 143 143 145 163 163

    FRAGMENT C:
    Tizmgvw

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Reconstruct the original access phrase and submit the final flag exactly as recovered.`,

      storyContext: `TIME: 4:15 AM | LOCATION: Approaching Server Room ER-42

The server room access code has been split across three encrypted files on the terrorist network. Veera is 50 meters away with patrols closing in. He needs the complete code now.`,
      characterMessage: "Three fragments, three different languages. Read each one correctly and assemble in order — A then B then C. No room for error.",
      flag: 'CTF#AccessGranted',
      points: 150,
      order: 2,
      difficulty: 'medium',
      hintPenalty: 50,
      hints: 'Treat each fragment independently and classify its notation before decoding. Convert all parts to plain text first, then merge in the presented sequence.',

    },
    {
      title: 'Level 1.3: The Time-Locked Vault',
      description: `BIOMETRIC VAULT — PERSONALISED SECURITY LOCK

The archive vault authenticates against a team-bound signature generated at registration time.
Captured telemetry confirms the lock material is deterministic but unique per team.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VAULT STATUS: ARMED
ANTI-REPLAY: ENABLED
EXTERNAL OVERRIDE: DENIED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Derive your team-specific vault response and submit the exact resulting flag.`,
      storyContext: `TIME: 4:45 AM | LOCATION: Inside Server Room ER-42

The vault contains Saif's full attack blueprint. The biometric lock requires a team-specific mathematical computation — every team gets a different answer.`,
      characterMessage: "The vault uses personalised security. Your code depends on your team's exact registration data. Compute it precisely — I cannot wait.",
      flag: 'TEAM_SPECIFIC',
      points: 200,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 70,
      hints: 'This is deterministic input processing. Reconstruct the exact input string with correct separators and ordering before generating the final team-specific value.',

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

    Forensic extraction recovered three credential artifacts tied to distinct protected stores.
    Correlation logs indicate the final access token is derived from all three stores, not any single one.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    DATABASE ALPHA:
    5f4dcc3b5aa765d61d8327deb882cf99

    DATABASE BETA:
    af8978b1797b72acfff9595a5a2a373ec3d9106d

    DATABASE GAMMA:
    000c285457fc971f862a79b786476c78812c8897063c6fa9c045f579a3b2d63f

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the master flag linked to this hash trail and submit it exactly.`,

      storyContext: `TIME: 5:12 AM | LOCATION: Inside the vault, analyzing recovered hard drive

The hard drive holds three separate databases — sleeper cell identities, financial backers, and the BLACKOUT payload. Each is secured by a different password hash.`,
      characterMessage: "Three locked databases. Crack every hash, extract the master key. The government is about to release Farooq — this evidence is the only thing that can stop it.",
      flag: 'CTF{pas+dra+mon+42}',
      points: 250,
      order: 1,
      difficulty: 'medium',
      hintPenalty: 80,
      hints: 'Use hash length to identify likely algorithms, then test common password patterns with a cracking tool. Build the final answer only after all three values are recovered.',

    },
    {
      title: 'Level 2.2: The JWT Inception',
      description: `ADMIN PANEL — OBFUSCATED AUTHENTICATION TOKEN

    An administrative session artifact was captured from hostile infrastructure during a short trust-window.
    Signal intelligence marks this blob as authenticity-relevant and likely sufficient to expose privileged identity material.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    TOKEN DATA:
    65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a5a574e795a5851694f694a47513051785a7a4e456158703551574d3165554669533238325132356d5a46496966512e62576c7a63326c766267

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Extract the valid credential flag from the token artifact and submit it unchanged.`
    ,
      storyContext: `TIME: 5:50 AM | LOCATION: Terrorist admin panel

The admin panel uses an obfuscated authentication token. Vikram has spotted evidence the Home Minister's "execution" was staged theater. Decode the token to pull admin logs proving the conspiracy.`,
      characterMessage: "That token holds proof the Home Minister is working with Saif. Strip away every layer of obfuscation and extract what they buried inside. This changes everything.",
      flag: 'CTF{RdfnC6oKbAy5cAyziD3g1DCF}',
      points: 300,
      order: 2,
      difficulty: 'medium',
      hintPenalty: 100,
      hints: 'Decode the outer blob first, then inspect token structure by sections. If extracted fields still look invalid, check for one additional transformation on the credential value.',

    },
    {
      title: 'Level 2.3: The Pattern Lock',
      description: `PATTERN LOCK — TEAM-SPECIFIC SECURITY

The final datastore is protected by a personalized lock profile bound to team identity and mission progress.
Incident replay confirms that borrowed answers fail validation across teams.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOCK PROFILE: DYNAMIC
TRUST SOURCE: TEAM TELEMETRY
VALIDATION MODE: STRICT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Derive your team-valid unlock result and submit the exact flag.`,
      storyContext: `TIME: 6:15 AM | LOCATION: Final encrypted database

The last database containing the BLACKOUT worm payload uses a team-specific pattern lock. Althaf demands it cracked before Farooq crosses the border.`,
      characterMessage: "This lock changes per team — no shortcuts, no sharing. Compute your unique hash and unlock the full BLACKOUT blueprint. Clock is ticking.",
      flag: 'TEAM_SPECIFIC',
      points: 350,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 120,
      hints: 'Build the team-derived input exactly as specified by challenge context, hash it with the intended modern algorithm, then submit only the required leading segment.',

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

    Four independently captured payload shards were recovered from separate command channels.
    Threat intelligence assesses they belong to a single activation artifact.

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

    Recover the complete payload flag from these fragments and submit it exactly.`
    ,
      storyContext: `TIME: 7:10 AM | LOCATION: Decoding the cyberattack files

Veera escaped capture with Aparna's help. The BLACKOUT payload is fragmented across four encrypted pieces. Understanding the activation mechanism is critical to building the kill switch.`,
      characterMessage: "Four fragments, four different languages. Study each one carefully. Decode them all and combine in order. We need the full payload to build the kill switch.",
      flag: 'CTF{Blackout.Feb14.Payload}',
      points: 400,
      order: 1,
      difficulty: 'medium',
      hintPenalty: 140,
      hints: 'Each payload shard uses a different representation. Decode each shard to text, confirm it contributes meaningful output, then combine in original capture order.',

    },
    {
      title: 'Level 3.2: The Logic Bomb Defusal',
      description: `CRITICAL ALERT — LOGIC BOMB ARMED

    A hostile trigger routine remains active inside the recovered attack script.
    The artifact below was extracted from the trigger path and is believed to contain the defusal authority string.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ENCODED PAYLOAD:
    4d4445774d4441774d5445674d4445774d5441784d4441674d4445774d4441784d5441674d4445784d5445774d5445674d4445774d4441784d4441674d4445784d4441784d4445674d4445784d4441784d5441674d4445784d5441784d4445674d4445784d5441774d5445674d4445784d4441774d4445674d4445784d4445784d4441674d4441784d4445784d5441674d4445774d4445774d5445674d4445784d4445774d4445674d4445784d4445784d4441674d4445784d4445784d4441674d4445784d5441774d5445674d4445784d5441784d5445674d4445784d4445774d4445674d4445784d5441784d4441674d4445784d4441774d5445674d4445784d4445774d4441674d4441784d4445784d5441674d4445774d4445784d5445674d4445784d5441784d5441674d4445784d4441784d4445674d4445784d5441774d5441674d4445784d5441774d5441674d4445784d4445784d5445674d4445784d4441784d4441674d4445784d4441784d4445674d4445784d5445784d44453d

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the defusal flag from the payload and submit it exactly.`,
      storyContext: `TIME: 7:35 AM | LOCATION: Main attack script analysis

CRITICAL: A logic bomb in Saif's attack script will trigger BLACKOUT immediately if not defused. The defusal code is hidden under multiple nested encoding layers.`,
      characterMessage: "Logic bomb detected — the defusal code is buried deep. Strip away every barrier carefully. The final revealed output is what you submit. Do NOT get this wrong.",
      flag: 'CTF{Defusal.Killswitch.Overrode}',
      points: 450,
      order: 2,
      difficulty: 'hard',
      hintPenalty: 170,
      hints: 'Expect layered encoding. After every decode pass, reassess the new data type and continue until stable plaintext appears; stop only when the result matches flag semantics.',

    },
    {
      title: 'Level 3.3: The Master Vault (FINAL BOSS)',
      description: `MASTER VAULT — OPERATION BLACKOUT KILL SWITCH

    The final seized server contains the command authority for the citywide blackout chain.
    This vault is the terminal control point: compromise it, and the operation collapses.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    VAULT DATA:
    65794a306232746c62694936496d5635536d686952324e7054326c4b535656365354646f61556c7a535735534e574e4453545a4a61334259566b4e4b4f53356c65556f7957566857633252474f584a615747747054326c4b645531584f486c6a524531705a6c4575596c6447656d5248566e6b6966513d3d

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the master vault flag from this artifact and submit it exactly.

    FIRST TEAM TO SOLVE: 2x POINTS
    THE CITY IS COUNTING ON YOU.`,
      storyContext: `TIME: 8:00 AM (Operation Finale) | LOCATION: Saravana's encrypted server

A joint RAW-Police raid seized the server containing the MASTER KILL SWITCH. The vault is protected by every technique encountered so far. First team to crack it stops Operation BLACKOUT permanently.`,
      characterMessage: "This is everything. Every technique, every skill. The kill switch is buried in that vault. Crack it and this is over. First team to solve wins it all.",
      flag: 'CTF{MASTER_a1b2c3_VAULT}',
      points: 1000,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 220,
      hints: 'Approach this as a full pipeline challenge: decode stage by stage, validate intermediate output at each step, and extract only the exact code segment needed for final flag assembly.',

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
