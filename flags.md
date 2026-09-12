# THE EXTRACTION - CANONICAL FLAGS

Source of truth for seeded flags and backend validation.

## Static Flags
- Level 1.1: `CTF{V33r4_N0d3_X92_S3rv3r}`
- Level 1.2: `CTF{K3rn3l_P4th_V4ult91}`
- Level 2.1: `CTF{shadow99_valkyrie_crimson7}`
- Level 2.2: `CTF{Minister_Staged_Treason_88x}`
- Level 3.1: `CTF{K1llsw17ch_0v3rr1d3_P4ck37}`
- Level 3.2: `CTF{D3fus3_L0g1c_B0mb_S41f99}`
- Level 3.3: `CTF{MASTER_a1b2c3_VAULT}`

## Team-Specific Flags
- Level 1.3: `CTF{<first8(md5(teamName|teamSize|1|THEEXTRACTION))>}`
- Level 2.3: `CTF{<first8(sha256(teamName5THEEXTRACTION))>}`

## Backend Acceptance Notes
- Validation compares lowercase normalized values.
- Team-specific flags are generated server-side from team name.
