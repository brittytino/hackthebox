# 🎯 OPERATION DARKWEAVE - Quick Reference Card

## 🚀 URLs
| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:3001 | REST API |
| Admin Panel | http://localhost:3000/admin | Story control |
| Challenges | http://localhost:3000/challenges | Story experience |

---

## 🔑 Default Credentials
```
Admin:
  Email: admin@hackthebox.local
  Password: admin123

Judge:
  Email: judge@hackthebox.local
  Password: judge123

Test Users:
  Email: user1@test.local (through user5@test.local)
  Password: test123
```

---

## 🎮 Story Solutions

### Round 1: THE LEAK (Decode)
```
Message 1: VNNBEBZ_XBGRV_TVRGZAGR
Cipher: ROT13
Answer: UKKADAM_WATER_TREATMENT

Message 2: EBVNXGBXG_2026_EQKZO
Cipher: ROT13
Answer: DARKWEAVE_2026_COIMB

Message 3: b1o2p3q4r5s6
Method: Substitution (remove letters)
Answer: a1b2c3d4e5f6
```

### Round 2: THE BREACH (Crack)
```
Hash: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
Type: SHA256
Plaintext: password

Token: U0NDQ19NQVNURVJfS0VZXzdGOEU5RDBB
Encoding: Base64
Answer: SCCC_MASTER_KEY_7F8E9D0A

Log: U0NDQ19WUE5fTk9ERV80Nw==
Encoding: Base64
Answer: SCCC_VPN_NODE_47
```

### Round 3: THE COUNTDOWN (Flag)
```
Flag: HTB{COIMBATORE_DARKWEAVE_DEACTIVATED_2026}
```

---

## 🎬 Event Flow Commands

### Pre-Event Setup
```bash
# Start database
docker-compose up -d postgres

# Start backend
cd apps/backend
npm run dev

# Start frontend (new terminal)
cd apps/frontend
npm run dev
```

### Event Start (Admin Panel)
1. Login as admin
2. Go to Admin → Story Control
3. Click "🚀 Start Story"

### Event End (Admin Panel)
- **Victory:** Click "✅ End - City Saved"
- **Time Out:** Click "❌ End - Breach Executed"

### Post-Event
```bash
# Export results
# Admin Panel → Export → Download CSV

# Backup database
docker exec -t postgres pg_dump -U hackthebox hackthebox > backup-$(date +%Y%m%d).sql
```

---

## 🐛 Quick Troubleshooting

### Frontend won't load
```bash
cd apps/frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend errors
```bash
cd apps/backend
npx prisma generate
npm run dev
```

### Database connection failed
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Story not progressing
- Check team membership (user must be in team)
- Verify previous round completion
- Check browser console for errors
- Review backend logs

---

## 📊 Admin Monitoring

### Real-Time Dashboard
- Team progress: Green ✅ = completed, Gray ⭕ = pending
- Winner indicator: 🏆 appears next to winning team
- Auto-refresh every 5 seconds

### Progress States
- **Round 1:** Decoding phase
- **Round 2:** Cracking phase  
- **Round 3:** Flag race (first wins!)

---

## 🎯 Judge Notes

### What to Look For
✅ Teams following story narrative  
✅ Progressive problem-solving  
✅ Collaboration within teams  
✅ Time management  

### Red Flags
❌ URL manipulation attempts  
❌ Multiple accounts per person  
❌ Flag sharing between teams  
❌ Disruptive behavior  

---

## 🔧 Common Terminal Commands

```bash
# Check services
docker-compose ps

# View backend logs
cd apps/backend
npm run dev

# View database records
docker exec -it postgres psql -U hackthebox -d hackthebox

# Query story progress
SELECT t.name, sp.currentRound, sp.round1Completed, sp.round2Completed, sp.round3Completed 
FROM "StoryProgress" sp 
JOIN "Team" t ON sp."teamId" = t.id;

# Check story state
SELECT * FROM "StoryState";

# Reset story (careful!)
DELETE FROM "StoryProgress";
DELETE FROM "StoryState";
```

---

## 📞 Emergency Procedures

### System Crash
1. Stop all services: `docker-compose down`
2. Restart: `docker-compose up -d`
3. Verify: `docker-compose ps`

### Story Stuck
1. Admin Panel → Story Control
2. Check team progress table
3. Manually advance if needed (via database)

### Winner Dispute
1. Check `StoryState` table for `winTimestamp`
2. Review `StoryProgress` for `round3Winner = true`
3. Validate via backend logs

---

## 🎓 Participant Help Desk

### "I can't see challenges"
- Are you logged in?
- Are you in a team?
- Has admin started the story?

### "Round 2 is locked"
- Complete Round 1 first
- Check progress indicator
- All 3 artifacts must be correct

### "My flag is wrong (Round 3)"
- Check exact format: `HTB{...}`
- Case sensitive? No, but format is
- Has another team already won?

---

## 📈 Success Metrics

### Technical
- [ ] All animations smooth (60 FPS)
- [ ] No API errors
- [ ] Winner declared instantly
- [ ] Story ending displays correctly

### Experience
- [ ] Teams engaged for 3+ hours
- [ ] Story understood without explanation
- [ ] "This felt real" feedback
- [ ] Teams want to replay

---

## 🎬 Day-Of Checklist

### 2 Hours Before
- [ ] All services running
- [ ] Test login works
- [ ] Admin account accessible
- [ ] Story reset (clean slate)
- [ ] Backup taken

### Event Start
- [ ] Admin starts story
- [ ] First team registers
- [ ] Story intro plays
- [ ] Round 1 accessible

### During Event
- [ ] Monitor progress dashboard
- [ ] No errors in console
- [ ] Teams progressing
- [ ] Admin ready to end

### Post-Event
- [ ] Export scoreboard
- [ ] Backup database
- [ ] Collect feedback
- [ ] Reset for next event

---

## 💡 Pro Tips

### For Admins
- Start story 5 mins after briefing
- Keep admin panel open throughout
- Watch for first Round 2 unlock (validates system)
- Be ready to manually end if time runs out

### For Judges
- Story is self-explanatory to participants
- Focus on team dynamics, not technical help
- Flag sharing = disqualification
- Winner timestamp is authoritative

### For Participants (if asked)
- Read the story carefully
- ROT13 is a Caesar cipher variant
- Base64 decoding is your friend
- Flag format: HTB{...}

---

## 🎯 Remember

✅ This is NOT just a CTF - it's a narrative experience  
✅ Story drives challenges, not the other way around  
✅ Progressive difficulty by design  
✅ First team to Round 3 flag wins ALL  
✅ Coimbatore setting makes it relatable  

**Goal:** Participants should remember the story, not just the solutions.

---

**Print this card and keep it visible during the event!**

🎬 **Operation DARKWEAVE - Ready to Deploy**
