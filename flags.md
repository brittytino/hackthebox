# OPERATION CIPHER STRIKE - CANONICAL FLAGS

Source of truth for seeded flags and backend validation.

## Static Flags
- Level 1.1: `CTF{Server.Room-ER42,East-Wing}`
- Level 1.2: `CTF#AccessGranted`
- Level 2.1: `CTF{pas+dra+mon+42}`
- Level 2.2: `CTF{RdfnC6oKbAy5cAyziD3g1DCF}`
- Level 3.1: `CTF{Blackout.Feb14.Payload}`
- Level 3.2: `CTF{Defusal.Killswitch.Overrode}`
- Level 3.3: `CTF{MASTER_a1b2c3_VAULT}`

## Team-Specific Flags
- Level 1.3: `CTF{<first8(md5(teamName|2|1|CIPHER2026))>}`
- Level 2.3: `CTF{<first8(sha256(teamName5CIPHER2026))>}`

## Backend Acceptance Notes
- Validation compares lowercase normalized values.
- Team-specific flags are generated server-side from team name.
