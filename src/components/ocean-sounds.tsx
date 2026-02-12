"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, VolumeX, Waves, Wind, Fish } from "lucide-react";
import { detectLangFromPath, t } from "@/lib/i18n";

interface OceanSoundsProps {
  isVisible?: boolean;
  onVolumeChange?: (volume: number) => void;
}

export function OceanSounds({ isVisible = true, onVolumeChange }: OceanSoundsProps) {
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [currentSound, setCurrentSound] = useState("waves");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ocean sound options
  const sounds = {
    waves: {
      name: "Ocean Waves",
      icon: Waves,
      // Using a data URL for a simple ocean wave sound
      // In production, you'd use actual audio files
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+v1ymQcBjmN1+3Agz8GG2m/7+OZSE0IXnPZ+KCFVO0C2/+Fom8g"
    },
    underwater: {
      name: "Deep Sea",
      icon: Fish,
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+v1ymQcBjmN1+3Agz8GG2m/7+OZSE0IXnPZ+KCFVO0C2/+Fom8g"
    },
    seabreeze: {
      name: "Sea Breeze",
      icon: Wind,
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+v1ymQcBjmN1+3Agz8GG2m/7+OZSE0IXnPZ+KCFVO0C2/+Fom8g"
    }
  };

  useEffect(() => {
    // Create a simple audio context for generating ocean sounds
    if (typeof window !== "undefined" && isPlaying) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a more sophisticated ocean sound using Web Audio API
      const createOceanSound = () => {
        const bufferSize = audioContext.sampleRate * 2; // 2 seconds
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        // Generate pink noise for ocean waves
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
          
          // Add wave-like modulation
          output[i] *= 0.5 + 0.5 * Math.sin(i * 0.001) * Math.sin(i * 0.0001);
        }

        return buffer;
      };

      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = createOceanSound();
      source.loop = true;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start();
      
      // Store reference for cleanup
      audioRef.current = source as any;
      
      return () => {
        source.stop();
        audioContext.close();
      };
    }
  }, [isPlaying, currentSound, volume]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    onVolumeChange?.(vol);
  };

  if (!isVisible) return null;

  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            <span className="font-medium">{t(currentLang, "oceanSounds")}</span>
          </div>
          <Button
            onClick={togglePlayback}
            variant={isPlaying ? "default" : "outline"}
            size="sm"
            className="ripple-effect"
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Sound Selection */}
          <div className="flex gap-2">
            {Object.entries(sounds).map(([key, sound]) => {
              const Icon = sound.icon;
              return (
                <Button
                  key={key}
                  onClick={() => setCurrentSound(key)}
                  variant={currentSound === key ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {sound.name}
                </Button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t(currentLang, "volume")}</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
