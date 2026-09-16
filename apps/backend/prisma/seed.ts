import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@theextraction.local' },
    update: {},
    create: {
      email: 'admin@theextraction.local',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.username);
  console.log('   📧 Email: admin@theextraction.local');
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
      description: 'Veera discovers the mall is hijacked. Tap into CCTV to locate the sleeper cells.',
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
      status: 'ACTIVE',
      description: 'Veera discovers Home Minister Veera Santhanam\'s betrayal. Crack password hashes and JWT tokens to expose the ministerial conspiracy.',
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
      status: 'ACTIVE',
      description: 'Race against time to decode the mall demolition payload, defuse the logic bomb, and breach Farooq\'s border master vault.',
    },
  });
  console.log('✅ Round 3 created');

  // Check if challenges are already seeded so we do not wipe submissions on container restart
  const existingChallengeCount = await prisma.challenge.count({
    where: {
      roundId: {
        in: [round1.id, round2.id, round3.id],
      },
    },
  });

  if (existingChallengeCount >= 9) {
    console.log('✅ Challenges already seeded. Preserving existing challenges, submissions, and scores.');
    return;
  }

  // Ensure challenge seed is idempotent when initially seeding
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

    GQ4cIQxpaShuBRRqPmkFAmNoBQlpKCxpKCc=

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    The relay packet above was captured minutes before a coordinated movement inside the mall perimeter.
    Analysts confirm the payload contains an operational location string required for field access.

    Recover the exact flag from the intercepted transmission and submit it unchanged.`,
      storyContext: `TIME: 3:47 AM | LOCATION: Hidden server room, basement level

Veera has managed to access the mall's backup server room and intercepted an encrypted transmission from the terrorist comms relay. The message contains the command center coordinates.`,
      characterMessage: "I've tapped into their CCTV. This transmission has the sleeper cell locations — but someone worked hard to hide it. Figure out what they did and undo it. Move fast.",
      flag: 'CTF{V33r4_N0d3_X92_S3rv3r}',
      points: 100,
      order: 1,
      difficulty: 'medium-hard',
      hintPenalty: 30,
      hints: 'The transmission payload is armored in standard transport encoding, but decodes into non-printable binary telemetry rather than plain text.||Standard flag headers always begin with known characters. Compare the first few raw bytes against the expected protocol header to recover the single-byte masking key.',
    },
    {
      title: 'Level 1.2: The Fragmented Server Map',
      description: `FRAGMENTED ACCESS CODE — SECURITY DOORS

    Three seized packets from independent relay paths appear to be parts of one authorization phrase.
    Integrity checks show no packet is redundant.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    FRAGMENT A:
    103 124 106 173

    FRAGMENT B:
    P3im3o_K4gs_

    FRAGMENT C:
    7d 31 39 74 6c 75 34 56

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Reconstruct the original access phrase and submit the final flag exactly as recovered.`,
      storyContext: `TIME: 4:15 AM | LOCATION: Approaching Server Room ER-42

The server room access code has been split across three encrypted files on the terrorist network. Veera is 50 meters away with patrols closing in. He needs the complete code now.`,
      characterMessage: "Three fragments, three different languages. Read each one correctly and assemble in order — A then B then C. No room for error.",
      flag: 'CTF{K3rn3l_P4th_V4ult91}',
      points: 150,
      order: 2,
      difficulty: 'medium-hard',
      hintPenalty: 50,
      hints: 'The three pieces originate from separate comms relays: an ancient computer base, a symmetric classical alphabet inversion, and a reversed byte capture.||Resolve Fragment A using base-8 byte values, apply standard Atbash substitution to alphabetical characters in Fragment B, and invert the byte order of the final hex stream before decoding.',
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
      hints: 'The vault lock combines team registration telemetry with mission parameters using a strict pipe-delimited schema.||Construct the lock seed using your exact team name, operational headcount (1 or 2), round index 1, and mission codename separated by pipes. Digest with MD5 and extract the first 8 characters into standard flag format.',
    },
  ];

  // Level 1.3's flag is unique per team: ctf{md5("{teamName}|{size}|1|THEEXTRACTION")[:8]}
  const LEVEL_1_3_TEMPLATE = 'md5:{team}|{size}|1|THEEXTRACTION';

  for (const challenge of challenges1) {
    const isTeamSpecific = challenge.flag === 'TEAM_SPECIFIC';
    const flagHash = await bcrypt.hash(
      isTeamSpecific ? '__TEAM_SPECIFIC__' : challenge.flag.toLowerCase(),
      10,
    );

    await prisma.challenge.create({
      data: {
        roundId: round1.id,
        title: challenge.title,
        description: challenge.description,
        storyContext: challenge.storyContext,
        characterMessage: challenge.characterMessage,
        points: challenge.points,
        flagHash: flagHash,
        teamFlagTemplate: isTeamSpecific ? LEVEL_1_3_TEMPLATE : null,
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
    e8379b0f5d8f4c1dadaf39ee33fa5358

    DATABASE BETA:
    8f0881387e9339c6f0a61481a5b8ce8ac3893b7d

    DATABASE GAMMA:
    d48e93a43063be7e4d0f6672d435e90c24dccafb47b7c307f5fcf5284cef6378

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the master flag linked to this hash trail and submit it exactly.`,
      storyContext: `TIME: 5:12 AM | LOCATION: Inside the vault, analyzing recovered hard drive

The hard drive recovered from the vault holds three separate databases — sleeper cell identities, foreign funding channels, and high-level government communication logs. Each is secured by a different password hash.`,
      characterMessage: "Three locked databases. Crack every hash, extract the master key. Wait... what is this? Financial transfers to... the HOME MINISTER? He's IN ON THIS!",
      flag: 'CTF{shadow99_valkyrie_crimson7}',
      points: 250,
      order: 1,
      difficulty: 'medium-hard',
      hintPenalty: 80,
      hints: 'Identify each digest family by length and analyze their bit footprints before choosing dictionary recovery tactics.||The three artifacts span 128-bit, 160-bit, and 256-bit cryptographic digest standards. Recover the operational passwords using standard CTF wordlists and join them with underscores.',
    },
    {
      title: 'Level 2.2: The JWT Inception',
      description: `ADMIN PANEL — OBFUSCATED AUTHENTICATION TOKEN

    An administrative session artifact was captured from hostile infrastructure during a short trust-window.
    Signal intelligence marks this blob as authenticity-relevant and likely sufficient to expose privileged identity material.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    TOKEN DATA:
    65794a68624763694f694a49557a49314e694973496e523563434936496b705856434a392e65794a7a645749694f694a686458526f58323170626d6c7a644756795832397763794973496d6c7a63794936496e4e6a59324e66615735305a584a7559577866636d567359586b694c434a6c646d6c6b5a57356a5a534936496c52586248566857453477576c684b5a6c557a556d68614d6c5a725744465365567058526e70694d6a566d5430526f4e434973496d6c68644349364d5463774e7a67344e6a67774d48302e6b37577148684b356744387a5a34466d357838584a32625933635139704c31764e36735230755434774532

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Extract the valid credential flag from the token artifact and submit it unchanged.`,
      storyContext: `TIME: 5:50 AM | LOCATION: Terrorist admin panel

The admin panel uses an obfuscated authentication token. Preethi has spotted evidence the Home Minister's "execution" was staged theater. Decode the token to pull admin logs proving the conspiracy.`,
      characterMessage: "The Home Minister just forced the government's hand with that execution. But our analysts think it was FAKE. Decode that JWT—we need proof.",
      flag: 'CTF{Minister_Staged_Treason_88x}',
      points: 300,
      order: 2,
      difficulty: 'medium-hard',
      hintPenalty: 100,
      hints: 'The artifact is wrapped in byte hex format; stripping the outer representation exposes a modern standard web authentication structure.||Extract the payload segment from the three-part token and inspect the operational claims for encoded operational intelligence. Decode the evidence field to reveal the treason string.',
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

The final database containing the communication relay uses a team-specific pattern lock. Althaf demands it cracked before Farooq crosses the border.`,
      characterMessage: "I'm going to threaten him on a direct line, posing as a foreign militant. Break this pattern lock so I can hijack the negotiation frequency securely.",
      flag: 'TEAM_SPECIFIC',
      points: 350,
      order: 3,
      difficulty: 'hard',
      hintPenalty: 120,
      hints: 'This pattern lock binds your team\'s specific callsign directly to mission constants with zero delimiter padding.||Concatenate your exact team designation, the stage constant 5, and the operation codename THEEXTRACTION. Compute a 256-bit cryptographic digest and extract the leading 8 lowercase hex characters.',
    },
  ];

  // Level 2.3's flag is unique per team: ctf{sha256("{teamName}5THEEXTRACTION")[:8]}
  const LEVEL_2_3_TEMPLATE = 'sha256:{team}5THEEXTRACTION';

  for (const challenge of challenges2) {
    const isTeamSpecific = challenge.flag === 'TEAM_SPECIFIC';
    const flagHash = await bcrypt.hash(
      isTeamSpecific ? '__TEAM_SPECIFIC__' : challenge.flag.toLowerCase(),
      10,
    );

    await prisma.challenge.create({
      data: {
        roundId: round2.id,
        title: challenge.title,
        description: challenge.description,
        storyContext: challenge.storyContext,
        characterMessage: challenge.characterMessage,
        points: challenge.points,
        flagHash: flagHash,
        teamFlagTemplate: isTeamSpecific ? LEVEL_2_3_TEMPLATE : null,
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
      description: `OPERATION The Extraction — PAYLOAD FRAGMENTS

    Four independently captured payload shards were recovered from separate command channels.
    Threat intelligence assesses they belong to a single activation artifact.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    FRAGMENT 1:
    01000011 01010100 01000110 01111011 01001011 00110001 01101100 01101100

    FRAGMENT 2:
    7377313763685f

    FRAGMENT 3:
    MHYzcnIx

    FRAGMENT 4:
    q3_C4px37}

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the complete payload flag from these fragments and submit it exactly.`,
      storyContext: `TIME: 7:10 AM | LOCATION: Decoding the demolition files

Veera escaped capture with Preethi's help. The mall demolition payload is fragmented across four encrypted shards. Understanding the activation mechanism is critical to building the kill switch.`,
      characterMessage: "Veera escaped but he's hurt. Decode the fragments to lift the lockdown. Four fragments, four different encodings. Decode and combine in order.",
      flag: 'CTF{K1llsw17ch_0v3rr1d3_P4ck37}',
      points: 400,
      order: 1,
      difficulty: 'tough',
      hintPenalty: 140,
      hints: 'The shards are segregated by encoding protocols: raw digital bits, byte hex stream, transport radix-64, and classic alphabetic rotation.||Translate each shard independently into ASCII: parse 8-bit binary, decode raw hex bytes, decode base64, and rotate the final alphabetic cipher by 13 positions before joining 1 through 4.',
    },
    {
      title: 'Level 3.2: The Logic Bomb Defusal',
      description: `CRITICAL ALERT — LOGIC BOMB ARMED

    A hostile trigger routine remains active inside the recovered attack script.
    The artifact below was extracted from the trigger path and is believed to contain the defusal authority string.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ENCODED PAYLOAD:
    64474e7854484d4555554a454247683742314147564768314231705661475144426c454f446b6f3d

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the defusal flag from the payload and submit it exactly.`,
      storyContext: `TIME: 7:35 AM | LOCATION: Main attack script analysis

CRITICAL: A fail-deadly logic bomb in Saif's attack script will detonate the mall immediately if not defused. The defusal code is hidden under multiple nested encoding layers.`,
      characterMessage: "Saif armed a fail-deadly bomb. If you don't defuse it perfectly with the right decode pipeline, the mall goes up in flames. Do NOT get this wrong.",
      flag: 'CTF{D3fus3_L0g1c_B0mb_S41f99}',
      points: 450,
      order: 2,
      difficulty: 'tough',
      hintPenalty: 170,
      hints: 'The defusal payload is wrapped across multiple conversion barriers, terminating in a single-byte masked binary stream.||Strip the hexadecimal representation to reach the transport encoding, decode into raw bytes, and perform a known-plaintext XOR analysis against the standard flag prefix.',
    },
    {
      title: 'Level 3.3: The Master Vault (FINAL BOSS)',
      description: `MASTER VAULT — OPERATION The Extraction KILL SWITCH

    The final seized server contains the command authority for the citywide blackout chain.
    This vault is the terminal control point: compromise it, and the operation collapses.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    VAULT DATA:
    65794a306232746c62694936496d5635536d686952324e7054326c4b535656365354646f61556c7a535735534e574e4453545a4a61334259566b4e4b4f53356c65556f7957566857633252474f584a615747747054326c4b645531584f486c6a524531705a6c4575596c6447656d5248566e6b6966513d3d

    VAULT INTERFACE ENDPOINT:
    /public/challenges/master-vault.html

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Recover the master vault flag from this artifact chain and submit it exactly.

    FIRST TEAM TO SOLVE: 2x POINTS
    THE CITY IS COUNTING ON YOU.`,
      storyContext: `TIME: 8:00 AM (Operation Finale) | LOCATION: Hostile Airspace // Farooq's Mountain Fortress

Veera commandeered an IAF fighter jet across hostile borders to intercept Umar Farooq. The master vault containing the global terror syndicate's kill switch is protected by every technique encountered so far. First team to crack it stops Farooq's network permanently.`,
      characterMessage: "This is it. Every technique you've mastered. The master vault is exposed. First team to crack it dismantles Farooq's entire network permanently. The clock starts... NOW.",
      flag: 'CTF{MASTER_a1b2c3_VAULT}',
      points: 1000,
      order: 3,
      difficulty: 'tough',
      hintPenalty: 220,
      hints: 'Access the designated interactive terminal and trace the multi-stage cryptographic authority chain in real time.||Resolve each authentication layer in the terminal interface sequentially: decode the outer packet to extract the token claim, recover the vault coordinates, and derive the 6-character unlock code.',
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

  console.log('\n🎉 The Extraction - Database Seeded!\n');
  console.log('📝 Admin Access:');
  console.log('   📧 Email: admin@theextraction.local');
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
