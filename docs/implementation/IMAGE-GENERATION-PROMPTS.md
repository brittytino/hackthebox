# 🎨 IMAGE GENERATION PROMPTS
## Character Illustrations for Comic Book Implementation

---

## 📌 PREETHI - WORRIED (ALONE)

### Primary Prompt (Midjourney v6)

```
Portrait of Preethi, Indian woman, age 30-35, corporate strategist, 
trapped in mall siege crisis, worried expression, anxious but determined.
Face is tense with furrowed brow, eyes showing concern and fear, 
hand near face in worried gesture. 

FACE REFERENCE: [Use attached reference image for face consistency]
Apply the same facial features, bone structure, and distinctive eyes to this expression.

SETTING: Alone in dark mall corridor, dim emergency lighting casting shadows.
Soft blue and red light on face from security lights.
Dark background, corporate office aesthetic (trapped office worker).

OUTFIT: Business casual clothes - light blue blouse, slightly torn, disheveled from crisis.
Hair slightly messy, shows signs of stress.

STYLE: Semi-realistic cartoon, animation style similar to Arcane or Netflix anime.
NOT photorealistic, NOT chibi/cute, NOT manga. 
High quality, dramatic shading, expressive facial features, emotional depth.
Strong character animation feel - like a frame from a professional animated film.

LIGHTING: Dramatic side lighting, shadows on half face, blue-red color grading.
Emotional, tense lighting that emphasizes worry.

MOOD: Scared but brave, trapped but hopeful, emotional but controlled.

TECHNICAL SPECS:
- Aspect ratio: 1:1 square
- Quality: hq --quality 2
- Style: --style raw
- Version: --v 6
- Resolution: 800x800px (will scale down)
- Color depth: Cinematic color grading, slight cyan/blue tones

NO background people, NO other characters, Preethi ALONE.
Focus on face, shoulders, upper body only.
Intimate portrait framing.
```

---

### Simplified Version (Easier to Use)

```
Worried Indian woman, age 30-35, trapped in crisis, hand near face, 
tense expression with furrowed brow, scared but brave. Corporate outfit, 
dark mall corridor background, dramatic blue-red lighting. 
Semi-realistic cartoon style like Arcane animation. 
FACE REFERENCE: Use attached image for face consistency.
Emotional, intimate portrait, 1:1 ratio, professional quality.
```

---

### Alternative Prompt (More Specific Emotions)

```
Preethi - Emergency Response Mode:
A 30-35 year old Indian woman with distinctive features from the attached 
reference image. Expression: worried, anxious, protective concern on her face.
Furrowed brow, eyes wide with fear but determined. One hand raised near face 
in a worried gesture. Mouth slightly open (about to speak urgently).

Setting: Trapped in a dark, modern office building during security crisis.
Dim emergency lighting - red and blue LED lights creating dramatic shadows.
Alone, isolated, no other people visible.

Visual Style: Professional animation quality (think Arcane, Spider-Verse level).
Semi-realistic cartoon with strong line work and dramatic shading.
High emotional impact - clearly worried but still composed.

Color Palette: Dark background, warm skin tones, cool blue/red accent lighting.
Slight desaturation for stress effect.

Clothing: Professional casual - light blue or beige blouse, slightly disheveled.
Hair: Professional style but slightly messy from crisis situation.

Mood: "Did I make the right decision?" - internal conflict, fear, but hope.

Technical: 1:1 aspect ratio, high quality, cinematic color grading, 
optimized for web (clear at thumbnail size).
```

---

## 🎯 HOW TO USE THESE PROMPTS

### If Using Midjourney:

1. **Subscribe** to Midjourney (starts at $10/month)
2. **Join Discord server** (link sent in subscription)
3. **Open `/imagine` command**
4. **Paste the main prompt above**
5. **Add your reference image:**
   ```
   /imagine [PASTE PROMPT] --iw 2 https://[your-image-url].jpg
   ```
   - `--iw 2` = strong reference weight (0.25-2.0 scale)
6. **Wait for generation** (~60 seconds)
7. **Pick best result** (usually shows 4 options)
8. **Upscale** with "U1/U2/U3/U4" button
9. **Download PNG** (right-click → Open Image → Save)

---

### If Using Leonardo.ai (Free):

1. **Go to** leonardo.ai
2. **Create account** (free tier available)
3. **Canvas** → **Create New**
4. **Upload reference image** in left panel
5. **Paste prompt** in text box
6. **AI Model:** Select "Leonardo Diffusion"
7. **Advanced Settings:**
   - Alchemy: ON (better quality)
   - Image Guidance: 7-8 (follows reference closely)
   - Seed: 0 (random, or save seed for consistency)
8. **Generate** (free = slower, 1-2 minutes)
9. **Download** PNG with transparency

---

### If Using Stable Diffusion (RunwayML - Free Web):

1. **Go to** runwayml.com
2. **No signup needed** (for basic use)
3. **Image-to-Image** → **Upload reference image**
4. **Paste prompt** in description box
5. **Strength:** 0.7-0.8 (maintains face structure)
6. **Generate**
7. **Download** result

---

## 📸 REFERENCE IMAGE REQUIREMENTS

For the `[Use attached reference image for face consistency]` instruction:

**You Need:**
- Clear photo/illustration of Preethi's face
- Forward-facing or 3/4 angle (not profile)
- Good lighting (can see facial features clearly)
- Size: At least 500×500px
- Format: JPG or PNG

**How to Attach in Midjourney:**
1. Upload image to Discord (Midjourney channel)
2. Get image link (right-click → Copy Image Link)
3. Use link in prompt with `--iw` parameter

**How to Attach in Leonardo.ai:**
- Direct upload in left panel
- System automatically recognizes face

---

## 🎨 EXPECTED OUTPUT

When you use this prompt correctly, you'll get:

✅ **Preethi's distinctive face** (from your reference)  
✅ **Worried expression** (furrowed brow, concerned eyes)  
✅ **Alone in dark corridor** (isolation emphasized)  
✅ **Professional appearance** (corporate clothes)  
✅ **Dramatic lighting** (blue/red emergency lights)  
✅ **Cinematic animation quality** (Arcane-style)  
✅ **High resolution** (800×800px ready)  
✅ **Transparent background** (PNG format)  

---

## 🔄 IF FIRST ATTEMPT DOESN'T MATCH

**Problem:** Face doesn't match reference
- **Solution:** Increase `--iw` to 2.0 (Midjourney) or increase Image Guidance to 9 (Leonardo)

**Problem:** Expression is too angry/not worried enough
- **Solution:** Replace "worried expression" with "scared but brave, hand touching face showing fear and concern"

**Problem:** Background is too bright/distracting
- **Solution:** Add to prompt: "dark minimal background, focus on face"

**Problem:** Style looks too photorealistic
- **Solution:** Add: "cartoon illustration style NOT photorealism"

**Problem:** Quality is low/pixelated
- **Solution:** Add: `--quality 2` (Midjourney) or use "Alchemy" on Leonardo

---

## 📋 COMPLETE PREETHI SERIES PROMPTS

### Preethi - Worried (This one)
✅ Use prompt above

### Preethi - Hopeful (Next one)
```
Preethi with hopeful expression, soft smile, eyes showing faith and determination,
one hand on heart/chest in reassuring gesture. Same face from reference image.
Warm lighting, soft background, calm expression after moment of fear.
Animation style like Arcane. 1:1 ratio.
```

---

## 💰 COST COMPARISON

| Tool | Cost | Speed | Quality | Ease |
|------|------|-------|---------|------|
| **Midjourney** | $10/month | 60s | ⭐⭐⭐⭐⭐ Excellent | Medium |
| **Leonardo.ai** | Free | 2 min | ⭐⭐⭐⭐ Good | Easy |
| **Stable Diffusion** | Free | 3 min | ⭐⭐⭐ Okay | Easy |
| **Professional Artist** | $100-500 | 3-7 days | ⭐⭐⭐⭐⭐ Perfect | N/A |

---

## ✅ FINAL CHECKLIST

Before you hit generate:

- [ ] Have your reference image ready (Preethi's face)
- [ ] Copy the main prompt (above)
- [ ] Know which tool you're using (Midjourney/Leonardo/SD)
- [ ] Upload reference image correctly
- [ ] Set parameters correctly (`--iw 2` or Image Guidance 8-9)
- [ ] Wait for generation
- [ ] Download as PNG (transparent background)
- [ ] Save as: `preethi-worried.png`

---

## 🎬 EXAMPLE WORKFLOW

```
1. Copy this prompt into Midjourney Discord:

/imagine Portrait of Preethi, Indian woman, age 30-35, corporate 
strategist, trapped in mall siege crisis, worried expression, anxious 
but determined. Furrowed brow, eyes showing concern, hand near face in 
worried gesture. Dark mall corridor, dim emergency lighting, blue-red 
shadows. Business casual outfit slightly disheveled. Semi-realistic 
cartoon style like Arcane animation. Alone. 1:1 ratio. Professional quality. 
--iw 2 https://[YOUR-REFERENCE-IMAGE-URL]

2. Press Enter

3. Wait 60 seconds

4. Click "U1" (first upscale) on best result

5. Right-click downloaded image → Save as PNG

6. Rename: preethi-worried.png

7. Use in your website! 🎉
```

---

## 📞 SUPPORT

If prompt doesn't work:
1. Check reference image is accessible (use short URL)
2. Verify image quality (face clearly visible)
3. Try simplified version of prompt
4. Increase `--iw` or Image Guidance parameter
5. Try different AI tool

**Result you should get:**
- Professional quality character illustration
- Matches Preethi's face from reference
- Clearly shows worried expression
- Cinematic animation style
- Ready to use in your website
- <50KB after optimization

---

**Ready to generate? Go create! 🎨✨**
