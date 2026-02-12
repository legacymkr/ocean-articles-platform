"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { OceanSounds } from "@/components/ocean-sounds";
import { 
  Focus, 
  X, 
  Settings, 
  Type, 
  Volume2, 
  Minimize,
  Maximize,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { detectLangFromPath, t } from "@/lib/i18n";

interface EnhancedFocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function EnhancedFocusMode({ isActive, onToggle, children }: EnhancedFocusModeProps) {
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);
  const [showControls, setShowControls] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [soundVolume, setSoundVolume] = useState(0.15);
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  // Auto-start ocean sounds when focus mode is activated
  useEffect(() => {
    if (isActive && !audioStarted) {
      setAudioStarted(true);
      // Trigger ocean sounds auto-play
      const startOceanSounds = () => {
        const audioEvent = new CustomEvent('startOceanSounds', { detail: { volume: soundVolume } });
        window.dispatchEvent(audioEvent);
      };
      setTimeout(startOceanSounds, 500); // Small delay to ensure component is ready
    } else if (!isActive) {
      setAudioStarted(false);
      // Stop ocean sounds when exiting focus mode
      const stopOceanSounds = () => {
        const audioEvent = new CustomEvent('stopOceanSounds');
        window.dispatchEvent(audioEvent);
      };
      stopOceanSounds();
    }
  }, [isActive, soundVolume, audioStarted]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (!isActive) return;
    
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds of inactivity
    };

    const handleMouseMove = () => resetTimeout();
    const handleKeyPress = () => resetTimeout();

    // Show controls initially
    resetTimeout();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isActive]);

  // Apply focus mode styles
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.fontSize = `${fontSize}px`;
      document.documentElement.style.lineHeight = `${lineHeight}`;
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.fontSize = '';
      document.documentElement.style.lineHeight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.fontSize = '';
      document.documentElement.style.lineHeight = '';
    };
  }, [isActive, fontSize, lineHeight]);

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Enhanced Focus Mode Content */}
      <div className="relative h-full overflow-y-auto">
        {/* Background ocean effect */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 py-16">
          {children}
        </div>

        {/* Floating Controls */}
        <div 
          className={`fixed top-4 right-4 z-20 transition-all duration-300 ${
            showControls ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
          }`}
        >
          <Card className="glass-card border-primary/20 shadow-2xl">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                {/* Minimize/Maximize Controls */}
                <Button
                  onClick={() => setIsControlsMinimized(!isControlsMinimized)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {isControlsMinimized ? (
                    <Maximize className="h-4 w-4" />
                  ) : (
                    <Minimize className="h-4 w-4" />
                  )}
                </Button>

                {/* Exit Focus Mode */}
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Expanded Controls */}
              {!isControlsMinimized && (
                <div className="mt-4 space-y-4 min-w-[280px]">
                  {/* Font Size Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        <span>{t(currentLang, "fontSize")}</span>
                      </div>
                      <span>{fontSize}px</span>
                    </div>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Line Height Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <ChevronUp className="h-4 w-4" />
                        <span>{t(currentLang, "lineHeight")}</span>
                      </div>
                      <span>{lineHeight.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[lineHeight]}
                      onValueChange={(value) => setLineHeight(value[0])}
                      min={1.2}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Ocean Sounds */}
                  <OceanSounds 
                    isVisible={true}
                    onVolumeChange={setSoundVolume}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Focus Mode Indicator */}
        <div 
          className={`fixed bottom-4 left-4 z-20 transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <Card className="glass-card border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Focus className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-muted-foreground">{t(currentLang, "focusModeActive")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
