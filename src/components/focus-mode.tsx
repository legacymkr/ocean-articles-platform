"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Type, X } from "lucide-react";

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FocusMode({ isActive, onToggle, children }: FocusModeProps) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isActive && audioRef.current) {
      // Try to play audio when focus mode is activated
      audioRef.current.play().catch(() => {
        // Audio autoplay blocked, user needs to interact first
        console.log("Audio autoplay blocked - user interaction required");
      });
    } else if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, [isActive]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          console.log("Audio play failed");
        });
      }
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      case "xlarge":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const handleAudioPlay = () => {
    setIsAudioPlaying(true);
  };

  const handleAudioPause = () => {
    setIsAudioPlaying(false);
  };

  if (!isActive) {
    return (
      <>
        {children}
        {/* Hidden audio element for ocean waves */}
        <audio
          ref={audioRef}
          loop
          preload="auto"
          className="hidden"
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
        >
          <source src="/audio/ocean-waves.mp3" type="audio/mpeg" />
          <source src="/audio/ocean-waves.ogg" type="audio/ogg" />
        </audio>
      </>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] bg-background overflow-auto ${getFontSizeClass()}`}>
      {/* Focus Mode Header */}
      <header className="fixed top-0 left-0 right-0 z-[101] bg-card/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-heading text-glow-primary">Focus Mode</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleAudio} className="ripple-effect">
                  {isAudioPlaying ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex items-center gap-1">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="bg-transparent border-none text-sm text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onToggle} className="ripple-effect">
                <X className="h-4 w-4 mr-2" />
                Exit Focus
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Focus Mode Content */}
      <div className="pt-16">{children}</div>

      {/* Hidden audio element for ocean waves */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
      >
        <source src="/audio/ocean-waves.mp3" type="audio/mpeg" />
        <source src="/audio/ocean-waves.ogg" type="audio/ogg" />
      </audio>
    </div>
  );
}
