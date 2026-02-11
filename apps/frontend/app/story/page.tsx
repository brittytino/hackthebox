"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight, Map, Menu, Phone, Smartphone, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Types ---
type CharacterEmotion = 
  | "determined" | "intense" | "concerned" | "neutral" | "relieved" 
  | "hopeful" | "worried" 
  | "angry" | "threatening" 
  | "commanding" | "serious" | "urgent";

interface Scene {
  id: string;
  background: string;
  characters: {
    name: string;
    image?: string; // e.g., 'veera'
    emotion?: CharacterEmotion;
    position: "left" | "center" | "right";
  }[];
  speaker: string;
  dialogue?: string; // Text to type out
  choices?: {
    text: string;
    nextSceneId: string;
    action?: () => void;
  }[];
  nextSceneId?: string; // Auto advance target
}

// --- Asset Mapping based on file list ---
const CHAR_IMAGES: Record<string, Record<string, string>> = {
  veera: {
    determined: "/images/characters/veera_determined.png",
    intense: "/images/characters/veera_intense.png",
    concerned: "/images/characters/veera_concerned.png",
    neutral: "/images/characters/veera_neautral.png", // [sic] from file list
    relieved: "/images/characters/veera_relieved.png",
  },
  preethi: {
    hopeful: "/images/characters/preethi_hopeful.png",
    worried: "/images/characters/preethi_worried.png",
  },
  umar: {
    angry: "/images/characters/umar_angry.png",
    threatening: "/images/characters/umar_threatening.png",
  },
  vikram: {
    neutral: "/images/characters/vikram_neutral.png",
    serious: "/images/characters/vikram_serious.png",
    urgent: "/images/characters/vikram_urgent.png",
  },
  althaf: {
    commanding: "/images/characters/althaf_commanding.png",
    concerned: "/images/characters/althaf_concerned.png",
    neutral: "/images/characters/althaf_neutral.png",
  }
};

// --- Story Content ---
const SCENES: Record<string, Scene> = {
  "start": {
    id: "start",
    // Placeholder background - ideally user provides a "bedroom" or "office" image
    background: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop", 
    characters: [],
    speaker: "Narrator",
    dialogue: "11 Months Ago. Somewhere in Pakistan... 02:34 AM.",
    nextSceneId: "prologue_1"
  },
  "prologue_1": {
    id: "prologue_1",
    background: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    characters: [
      { name: "veera", emotion: "determined", position: "center" }
    ],
    speaker: "Veera",
    dialogue: "Target in sight. Umar Farooq is moving toward the extraction point. I'm engaging.",
    nextSceneId: "prologue_2"
  },
  "prologue_2": {
    id: "prologue_2",
    background: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    characters: [
      { name: "veera", emotion: "intense", position: "center" }
    ],
    speaker: "Command",
    dialogue: "Negative, Agent Veera! You do not have clearance to engage. Wait for backup!",
    nextSceneId: "prologue_3"
  },
  "prologue_3": {
    id: "prologue_3",
    background: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    characters: [
      { name: "veera", emotion: "intense", position: "center" }
    ],
    speaker: "Veera",
    dialogue: "He's getting away! I can't let him leave the perimeter!",
    choices: [
      { text: "Fire the Missile", nextSceneId: "prologue_bad_choice" },
      { text: "Hold Position", nextSceneId: "prologue_good_choice" }
    ]
  },
  "prologue_bad_choice": {
    id: "prologue_bad_choice",
    background: "https://images.unsplash.com/photo-1620052087057-bfd8235f583e?q=80&w=1964&auto=format&fit=crop", // explosion-like
    characters: [
      { name: "veera", emotion: "concerned", position: "center" }
    ],
    speaker: "Narrator",
    dialogue: "You fired. The explosion rocked the compound. Farooq was captured... but at what cost? A civilian family was caught in the blast.",
    nextSceneId: "present_day"
  },
  "prologue_good_choice": {
    id: "prologue_good_choice",
    background: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    characters: [
       { name: "veera", emotion: "determined", position: "center" }
    ],
    speaker: "Narrator",
    dialogue: "You hesitated. Farooq escaped into the tunnels... but your conscience is clear. (Alternate Timeline Initiated)",
    nextSceneId: "present_day"
  },
  "present_day": {
    id: "present_day",
    background: "https://images.unsplash.com/photo-1517502884422-41e157d2ed22?q=80&w=2070", // Mall/City
    characters: [
      { name: "preethi", emotion: "hopeful", position: "left" },
      { name: "veera", emotion: "neutral", position: "right" }
    ],
    speaker: "Preethi",
    dialogue: "Veera? Are you listening to me? I said, Domnic needs help with the Mall security contract.",
    nextSceneId: "present_day_2"
  },
  "present_day_2": {
    id: "present_day_2",
    background: "https://images.unsplash.com/photo-1517502884422-41e157d2ed22?q=80&w=2070",
    characters: [
      { name: "preethi", emotion: "worried", position: "left" },
      { name: "veera", emotion: "neutral", position: "right" }
    ],
    speaker: "Veera",
    dialogue: "...",
    nextSceneId: "end_demo"
  },
  "end_demo": {
    id: "end_demo",
    background: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    characters: [
      { name: "veera", emotion: "determined", position: "center" }
    ],
    speaker: "Veera",
    dialogue: "The past haunts me... but there's no time to dwell on it. The city needs protection. Let's get to work.",
     choices: [
      { text: "Begin Mission", nextSceneId: "challenges_redirect" },
      { text: "View Dashboard", nextSceneId: "dashboard_redirect" },
      { text: "Replay Story", nextSceneId: "start" }
    ]
  }
};


export default function StoryPage() {
  const router = useRouter();
  const [currentSceneId, setCurrentSceneId] = useState("start");
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Derive current scene
  const scene = SCENES[currentSceneId];

  // Helper to get image path safely
  const getCharImage = (name: string, emotion?: string) => {
    const charData = CHAR_IMAGES[name.toLowerCase()];
    if (!charData) return ""; // Fail gracefully
    // Default to 'neutral' if emotion not found, or first available key
    return charData[emotion?.toLowerCase() || "neutral"] || Object.values(charData)[0];
  };

  // Typewriter effect
  useEffect(() => {
    if (!scene) return;
    
    setTypedText("");
    setIsTyping(true);
    setShowChoices(false);

    let i = 0;
    const fullText = scene.dialogue || "";
    const speed = 30; // ms per char

    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        if (scene.choices && scene.choices.length > 0) {
          setShowChoices(true);
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [scene]);

  // Interaction Handler
  const handleInteraction = () => {
    if (isTyping) {
      // Instant finish
      setTypedText(scene?.dialogue || "");
      setIsTyping(false);
      if (scene?.choices && scene.choices.length > 0) {
        setShowChoices(true);
      }
    } else {
      // Next scene if no choices
      if (!scene?.choices && scene?.nextSceneId) {
        if (scene.nextSceneId === "dashboard_redirect") {
            router.push("/dashboard");
            return;
        } else if (scene.nextSceneId === "challenges_redirect") {
            router.push("/challenges");
            return;
        }
        setCurrentSceneId(scene.nextSceneId);
      }
    }
  };

  if (!scene) return <div className="text-white">Scene Error</div>;

  return (
    <div 
      className="vn-root relative select-none cursor-pointer" 
      onClick={handleInteraction}
      style={{ backgroundImage: `url('${scene.background}')` }}
    >
      {/* Background Dimmer Layer */}
      <div className="absolute inset-0 bg-black/20" />

      {/* --- Character Layer --- */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {scene.characters.map((char, idx) => {
          const imgSrc = getCharImage(char.name, char.emotion);
          return (
            <div 
              key={`${char.name}-${idx}`} 
              className={`vn-character vn-breathe ${char.position}`}
            >
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={imgSrc} 
                 alt={char.name} 
                 className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
               />
            </div>
          );
        })}
      </div>

      {/* --- HUD/UI Layer --- */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-4">
        <button className="vn-hud-icon bg-slate-900 border-2 border-slate-600">
           <Smartphone className="w-6 h-6" />
        </button>
        <button className="vn-hud-icon bg-slate-900 border-2 border-slate-600">
           <Map className="w-6 h-6" />
        </button>
         <button className="vn-hud-icon bg-slate-900 border-2 border-slate-600">
           <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- Dialogue Layer --- */}
      <div className="absolute bottom-0 left-0 w-full z-30">
        
        {/* Choices Overlay (if active) */}
        {showChoices && scene.choices && (
          <div className="absolute bottom-[40vh] left-0 w-full flex flex-col items-center gap-4 z-50 pointer-events-auto pb-10">
            {scene.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent bg click
                  if (choice.action) choice.action();
                  if (choice.nextSceneId === "dashboard_redirect") {
                      router.push("/dashboard");
                  } else if (choice.nextSceneId === "challenges_redirect") {
                      router.push("/challenges");
                  } else {
                      setCurrentSceneId(choice.nextSceneId);
                  }
                }}
                className="vn-choice-btn"
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* Text Box */}
        <div className="vn-dialogue-box">
             {/* Name Tag */}
             {scene.speaker && scene.speaker !== "Narrator" && (
                 <div className="vn-name-tag">
                    {scene.speaker.toUpperCase()}
                 </div>
             )}

             {/* Text Content */}
             <p className="vn-text">
                {typedText}
                {!isTyping && !showChoices && (
                  <span className="inline-block w-3 h-6 ml-2 bg-blue-400 animate-pulse align-middle" />
                )}
             </p>

            {/* Next Indicator */}
             {!isTyping && !showChoices && (
                <div className="absolute bottom-6 right-8 animate-bounce text-blue-400 pointer-events-none">
                    <ChevronRight size={32} />
                </div>
             )}
        </div>
      </div>

      {/* --- Fast Forward / Skip --- */}
       <div className="absolute bottom-4 right-20 z-50 pointer-events-auto">
          <button className="text-slate-500 hover:text-white px-4 py-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <SkipForward size={16} /> Skip
          </button>
       </div>
    </div>
  );
}
