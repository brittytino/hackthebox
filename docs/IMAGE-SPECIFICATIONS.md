# Image Specifications for Operation Cipher Strike

This document outlines the exact image requirements for the CTF platform's gamified UI.

## 📸 Image Directory Structure

```
apps/frontend/public/images/
├── characters/          # Character sprites (PNG with transparency)
│   ├── veera_neutral.png
│   ├── veera_intense.png
│   ├── veera_determined.png
│   ├── veera_concerned.png
│   ├── veera_relieved.png
│   ├── vikram_neutral.png
│   ├── vikram_serious.png
│   ├── vikram_urgent.png
│   ├── althaf_commanding.png
│   ├── althaf_serious.png
│   ├── althaf_neutral.png
│   ├── preethi_worried.png
│   ├── preethi_hopeful.png
│   ├── umar_threatening.png
│   ├── umar_angry.png
│   └── placeholder.png   # Already created (fallback)
└── background/          # Background images (JPG)
    ├── city-night.jpg
    ├── ops-center.jpg
    ├── server-room.jpg
    ├── command-center.jpg
    ├── cyber-warfare.jpg
    ├── mall-dark.jpg
    └── data-center.jpg
```

## 🎭 Character Sprite Specifications

### Image Format & Size
- **Format:** PNG-24 with **transparency** (alpha channel required)
- **Dimensions:** 800px width × 1200px height
- **File Size:** Aim for < 500KB per image (use PNG compression)
- **Color Space:** sRGB
- **Resolution:** 72 DPI (web standard)

### Visual Style
- **Art Style:** Semi-realistic anime/visual novel style (similar to Summertime Saga)
- **Composition:** Full-body character portraits from knees up
- **Pose:** Standing, facing forward or slightly angled (¾ view)
- **Expression:** Clearly shows emotion in face and body language
- **Lighting:** Consistent lighting across all characters (soft front lighting)
- **Background:** **Fully transparent** (no background elements)

### Character Details

#### **VEERA RAGHAVAN** (Protagonist - Special Forces Agent)
**Required Expressions:** 5 total
1. `veera_neutral.png` - Default calm expression, alert posture
2. `veera_intense.png` - Focused eyes, slight frown, tactical stance
3. `veera_determined.png` - Stern face, confident posture
4. `veera_concerned.png` - Worried brow, slight tension
5. `veera_relieved.png` - Soft smile, relaxed shoulders

**Appearance:**
- Age: Late 20s
- Build: Athletic, military bearing
- Outfit: Dark tactical gear (black/navy combat vest, cargo pants)
- Hair: Short dark hair, professional
- Color Accent: Purple glow (#a78bfa) in UI

#### **VIKRAM** (Cyber Crime Inspector)
**Required Expressions:** 3 total
1. `vikram_neutral.png` - Professional, calm
2. `vikram_serious.png` - Authoritative, intense gaze
3. `vikram_urgent.png` - Tense, alert

**Appearance:**
- Age: Mid 30s
- Build: Average, sharp posture
- Outfit: Police uniform with cybercrime unit badge
- Hair: Neat, formal
- Color Accent: Cyan glow (#67e8f9) in UI

#### **ALTHAF HUSSAIN** (Deputy NSA Director)
**Required Expressions:** 3 total
1. `althaf_commanding.png` - Strong presence, authoritative
2. `althaf_serious.png` - Focused, strategic
3. `althaf_neutral.png` - Professional, composed

**Appearance:**
- Age: Early 40s
- Build: Strong, confident stance
- Outfit: Formal security service uniform or suit with insignia
- Hair: Professional, short
- Color Accent: Gold glow (#fbbf24) in UI

#### **PREETHI** (Doctor, Veera's Friend)
**Required Expressions:** 2 total
1. `preethi_worried.png` - Concerned, empathetic
2. `preethi_hopeful.png` - Gentle smile, caring

**Appearance:**
- Age: Late 20s
- Build: Slender, graceful
- Outfit: Doctor's white coat or professional attire
- Hair: Long, neat
- Color Accent: Pink glow (#f9a8d4) in UI

#### **UMAR FAROOQ** (Antagonist)
**Required Expressions:** 2 total
1. `umar_threatening.png` - Menacing, intense
2. `umar_angry.png` - Furious, aggressive

**Appearance:**
- Age: 30s
- Build: Intimidating, strong
- Outfit: Dark tactical clothing or prisoner attire
- Hair: Unkempt or shaved
- Color Accent: Red glow (#ef4444) in UI

---

## 🌆 Background Image Specifications

### Image Format & Size
- **Format:** JPEG (high quality)
- **Dimensions:** 1920px width × 1080px height (16:9 aspect ratio)
- **File Size:** 200-500KB (quality level 85)
- **Color Space:** sRGB

### Visual Style
- **Aesthetic:** Dark cyberpunk, moody lighting
- **Tone:** Low saturation, high contrast
- **Lighting:** Dramatic (night scenes, neon accents, strong shadows)
- **Composition:** Open space for UI elements and characters (avoid busy centers)
- **Color Palette:** Dark blues, purples, blacks with cyan/purple/gold accents

### Required Backgrounds

#### 1. **city-night.jpg**
- **Scene:** Nighttime cityscape (Coimbatore or generic Indian city)
- **Elements:** Skyscrapers, neon signs, street lights
- **Mood:** Mysterious, urban thriller

#### 2. **ops-center.jpg**
- **Scene:** High-tech operations room interior
- **Elements:** Monitors, server racks, blue lighting
- **Mood:** Tactical, focused

#### 3. **server-room.jpg**
- **Scene:** Data center aisle with server racks
- **Elements:** Rows of servers, cable management, green/blue indicator lights
- **Mood:** Technical, secure

#### 4. **command-center.jpg**
- **Scene:** NSA-style command center with large screens
- **Elements:** Multiple displays showing maps/data, dark consoles
- **Mood:** Authority, national security

#### 5. **cyber-warfare.jpg**
- **Scene:** Abstract cyber attack visualization or hacker workspace
- **Elements:** Code, digital interfaces, holographic displays
- **Mood:** Intense, high-stakes

#### 6. **mall-dark.jpg**
- **Scene:** Shopping mall interior (dark/closed atmosphere)
- **Elements:** Escalators, storefronts, emergency lighting
- **Mood:** Tense, hostage situation

#### 7. **data-center.jpg**
- **Scene:** Large data center hall (wide shot)
- **Elements:** Massive server infrastructure, cold lighting
- **Mood:** Corporate, digital infrastructure

---

## 🤖 AI Generation Prompts (Optional)

### For Character Sprites (use Stable Diffusion, Midjourney, etc.)

**Veera Example:**
```
portrait of young Indian male special forces agent, tactical gear, determined expression, 
standing pose, full body from knees up, semi-realistic anime style, visual novel character, 
professional lighting, PNG transparent background, high detail, 800x1200px
```

**General Character Template:**
```
[age] [gender] [role], [outfit description], [expression], standing pose, 
full body from knees up, semi-realistic anime visual novel style, 
clean transparent background, professional lighting, high quality
```

### For Background Images

**City Night Example:**
```
cyberpunk Indian city at night, moody atmosphere, neon lights, dark blue purple tones, 
dramatic lighting, cinematic composition, high contrast, 1920x1080, photorealistic
```

**Operations Center Example:**
```
high-tech operations room, blue screen glow, server racks, tactical command center, 
dark atmosphere, cybersecurity theme, dramatic lighting, 16:9 cinematic, photorealistic
```

---

## 📤 Export Settings

### Photoshop/GIMP (PSD→PNG Characters)
1. Save As → PNG-24
2. Check "Transparency" option
3. Use "Save for Web" with PNG-24 preset
4. Optimize for file size without losing quality

### Illustrator (Vector→PNG)
1. Export → Export As → PNG
2. Resolution: 72 PPI
3. Background: Transparent
4. Artboard: 800×1200px

### Image Compression Tools
- **TinyPNG:** https://tinypng.com/ (reduce PNG file size)
- **Squoosh:** https://squoosh.app/ (advanced compression)

---

## ✅ Quick Checklist

### Characters (15 images)
- [ ] veera_neutral.png
- [ ] veera_intense.png
- [ ] veera_determined.png
- [ ] veera_concerned.png
- [ ] veera_relieved.png
- [ ] vikram_neutral.png
- [ ] vikram_serious.png
- [ ] vikram_urgent.png
- [ ] althaf_commanding.png
- [ ] althaf_serious.png
- [ ] althaf_neutral.png
- [ ] preethi_worried.png
- [ ] preethi_hopeful.png
- [ ] umar_threatening.png
- [ ] umar_angry.png

### Backgrounds (7 images)
- [ ] city-night.jpg
- [ ] ops-center.jpg
- [ ] server-room.jpg
- [ ] command-center.jpg
- [ ] cyber-warfare.jpg
- [ ] mall-dark.jpg
- [ ] data-center.jpg

---

## 🎨 Color Reference

**UI Theme Colors:**
- **Veera:** Purple `#a78bfa`
- **Vikram:** Cyan `#67e8f9`
- **Althaf:** Gold `#fbbf24`
- **Preethi:** Pink `#f9a8d4`
- **Umar:** Red `#ef4444`
- **Background Base:** Dark `#050214` to `#0f0828`
- **Accent:** Purple `#6d28d9` / Cyan `#06b6d4`

---

## 📝 Notes

- **Placeholder images** are already in place - the UI will work without final images
- Character sprites display at **~700px height** on screen (scaled automatically)
- Backgrounds are **dimmed to 15% brightness** with filters - create them bright, UI will darken
- All character color accents (glows) are applied automatically via CSS
- File naming must be **exact** (case-sensitive, underscores, no spaces)

**Current Status:** Placeholder images active. Add final images to respective folders to see them appear immediately.
