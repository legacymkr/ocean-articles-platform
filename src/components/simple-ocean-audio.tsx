"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Waves, Play, Pause, AlertCircle } from "lucide-react";

interface SimpleOceanAudioProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
  autoPlay?: boolean;
  language?: string;
}

export function SimpleOceanAudio({ volume, onVolumeChange, className, autoPlay = false, language = "en" }: SimpleOceanAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      console.log("✅ Ocean audio loaded successfully");
      setIsLoaded(true);
      setError("");
      
      // Auto-play if requested
      if (autoPlay && !isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true);
          console.log("🌊 Ocean sounds auto-started");
        }).catch((error: any) => {
          console.log("⚠️ Auto-play blocked by browser:", error.message);
        });
      }
    };

    const handleError = (e: Event) => {
      console.error("❌ Audio loading failed:", e);
      setError("Ocean audio file not found");
      setIsLoaded(false);
    };

    const handleEnded = () => {
      console.log("🔄 Audio ended, restarting...");
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay, isPlaying]);

  useEffect(() => {
    // Listen for focus mode events
    const handleStartOceanSounds = (event: CustomEvent) => {
      if (!isPlaying) {
        const newVolume = event.detail?.volume || 0.15;
        onVolumeChange(newVolume);
        startOceanSounds();
      }
    };

    const handleStopOceanSounds = () => {
      if (isPlaying) {
        stopOceanSounds();
      }
    };

    window.addEventListener('startOceanSounds', handleStartOceanSounds as EventListener);
    window.addEventListener('stopOceanSounds', handleStopOceanSounds);

    return () => {
      window.removeEventListener('startOceanSounds', handleStartOceanSounds as EventListener);
      window.removeEventListener('stopOceanSounds', handleStopOceanSounds);
    };
  }, [isPlaying]);

  const startOceanSounds = () => {
    const audio = audioRef.current;
    if (audio && !isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
        console.log("🌊 Ocean sounds started");
      }).catch((error: any) => {
        console.error("🚫 Playback error:", error);
        setError(`Playback failed: ${error.message}`);
      });
    }
  };

  const stopOceanSounds = () => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      console.log("🔇 Ocean sounds stopped");
    }
  };

  // Set volume when component mounts or volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume * 0.5;
    }
  }, [volume]);

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        stopOceanSounds();
      } else {
        startOceanSounds();
      }
    } catch (error: any) {
      console.error("🚫 Playback error:", error);
      setError(`Playback failed: ${error.message}`);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    onVolumeChange(vol);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = vol * 0.5;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Audio element */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
      >
        <source src="/en/audio/ocean.mp3" type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>

      {/* Error indicator */}
      {error && (
        <div title={error}>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
      )}

      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayback}
        variant={isPlaying ? "default" : "outline"}
        size="sm"
        disabled={!isLoaded && !error}
        className="ripple-effect"
        title={error || (isLoaded ? "Toggle ocean sounds" : "Loading audio...")}
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
        disabled={!isLoaded}
      />
    </div>
  );
}
