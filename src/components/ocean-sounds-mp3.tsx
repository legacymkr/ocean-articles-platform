"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Waves, Play, Pause } from "lucide-react";
import { detectLangFromPath, t } from "@/lib/i18n";

interface OceanSoundsMp3Props {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export function OceanSoundsMp3({ volume, onVolumeChange, className }: OceanSoundsMp3Props) {
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      
      // Set the source
      audioRef.current.src = "/1 Minute Relaxing Ocean Waves- Relaxing sounds.mp3";
      
      // Handle audio events
      const handleCanPlay = () => {
        console.log("Audio can play - file loaded successfully");
      };
      
      const handleLoadError = (e: Event) => {
        console.error("Audio load error - check if MP3 file exists in /public folder:", e);
        setIsPlaying(false);
      };
      
      const handlePlayError = (e: Event) => {
        console.error("Audio play error:", e);
        setIsPlaying(false);
      };

      const handleEnded = () => {
        // This shouldn't fire because loop=true, but just in case
        console.log("Audio ended - restarting loop");
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleLoadError);
      audioRef.current.addEventListener('ended', handleEnded);

      // Load the audio
      audioRef.current.load();

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleLoadError);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      };
    }
  }, []);

  // Update volume when prop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = async () => {
    if (!audioRef.current) {
      console.error("Audio element not initialized");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        console.log("Audio paused");
      } else {
        // Check if audio is ready
        if (audioRef.current.readyState < 2) {
          console.log("Audio not ready yet, waiting...");
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', handleCanPlay);
              resolve(true);
            };
            audioRef.current?.addEventListener('canplay', handleCanPlay);
          });
        }

        console.log("Attempting to play audio...");
        await audioRef.current.play();
        setIsPlaying(true);
        console.log("Audio playing successfully");
      }
    } catch (error: any) {
      console.error("Error toggling audio playback:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code
      });
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        console.error("User interaction required to play audio. Click play button.");
      } else if (error.name === 'NotSupportedError') {
        console.error("Audio format not supported or file not found.");
      }
      
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    onVolumeChange(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayback}
        variant={isPlaying ? "default" : "outline"}
        size="sm"
        className="ripple-effect"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Ocean Icon */}
      <Waves className="h-4 w-4 text-primary" />
      
      {/* Volume Slider */}
      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        min={0}
        max={1}
        step={0.01}
        className="w-20"
      />
    </div>
  );
}
