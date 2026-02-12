"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Focus, Type, Volume2, X, ChevronUp, Mail, Heart, Menu, ChevronDown } from "lucide-react";
import { useNavbar } from "./navbar-provider";
import { LanguageSwitcher } from "./language-switcher";
import { detectLangFromPath, t } from "@/lib/i18n";
import { SimpleOceanAudio } from "./simple-ocean-audio";

interface NavbarProps {
  onToggleFocusMode?: () => void;
}

export function Navbar({ onToggleFocusMode }: NavbarProps) {
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);
  const isArticlePage = pathname.includes("/articles");
  const { isFocusMode, toggleFocusMode } = useNavbar();

  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [volume, setVolume] = useState(0.15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  // Store original settings for reset on exit
  const [originalSettings, setOriginalSettings] = useState<{
    fontSize: string;
    lineHeight: string;
    fontFamily: string;
  } | null>(null);

  // Create language-aware routes - always use language prefix for consistency
  const articlesUrl = `/${currentLang}/articles`;
  const homeUrl = `/${currentLang}`;

  // Apply font changes when focus mode is active
  useEffect(() => {
    if (isFocusMode) {
      // Store original settings when entering focus mode
      if (!originalSettings) {
        const computedStyle = window.getComputedStyle(document.documentElement);
        setOriginalSettings({
          fontSize: computedStyle.fontSize || '',
          lineHeight: computedStyle.lineHeight || '',
          fontFamily: computedStyle.fontFamily || ''
        });
      }

      document.documentElement.style.fontSize = `${fontSize}px`;
      document.documentElement.style.lineHeight = `${lineHeight}`;

      // Apply font family
      const fontFamilyMap = {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        serif: 'Georgia, "Times New Roman", serif',
        mono: '"JetBrains Mono", "Courier New", monospace'
      };
      document.documentElement.style.fontFamily = fontFamilyMap[fontFamily];
    } else {
      // Restore original settings when exiting focus mode
      if (originalSettings) {
        document.documentElement.style.fontSize = originalSettings.fontSize;
        document.documentElement.style.lineHeight = originalSettings.lineHeight;
        document.documentElement.style.fontFamily = originalSettings.fontFamily;
      } else {
        // Fallback to clearing styles
        document.documentElement.style.fontSize = '';
        document.documentElement.style.lineHeight = '';
        document.documentElement.style.fontFamily = '';
      }

      // Reset settings state for next time
      setOriginalSettings(null);
      setFontSize(16);
      setLineHeight(1.6);
      setFontFamily('sans');
    }
  }, [isFocusMode, fontSize, lineHeight, fontFamily, originalSettings]);

  if (isFocusMode) {
    // Focus Mode Navbar with Controls
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main navbar row */}
          <div className="flex justify-between items-center h-16">
            {/* Focus Mode Title and Donate */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <Focus className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-medium text-primary hidden sm:inline">{t(currentLang, "focusModeActive")}</span>
              </div>
              <a href="https://ko-fi.com/galatide" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 ripple-effect"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {t(currentLang, "donate")}
                </Button>
              </a>
            </div>

            {/* Desktop Controls - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Font Size Control */}
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="text-sm min-w-[60px]">{t(currentLang, "fontSize")}</span>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={12}
                  max={28}
                  step={1}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground min-w-[30px]">{fontSize}px</span>
              </div>

              {/* Line Height Control */}
              <div className="flex items-center gap-2">
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm min-w-[70px]">{t(currentLang, "lineHeight")}</span>
                <Slider
                  value={[lineHeight]}
                  onValueChange={(value) => setLineHeight(value[0])}
                  min={1.2}
                  max={2.5}
                  step={0.1}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground min-w-[30px]">{lineHeight.toFixed(1)}</span>
              </div>

              {/* Font Family Control */}
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="text-sm min-w-[60px]">Font</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as 'sans' | 'serif' | 'mono')}
                  className="px-2 py-1 bg-background border border-border rounded text-sm min-w-[80px]"
                >
                  <option value="sans">Sans</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
              </div>

              {/* Ocean Sounds */}
              <div className="flex items-center gap-2">
                <span className="text-sm">{t(currentLang, "oceanSounds")}</span>
                <SimpleOceanAudio
                  volume={volume}
                  onVolumeChange={setVolume}
                  autoPlay={true}
                  language={currentLang}
                />
                <span className="text-xs text-muted-foreground min-w-[30px]">{Math.round(volume * 100)}%</span>
              </div>
            </div>

            {/* Right side - Mobile controls toggle and Exit */}
            <div className="flex items-center gap-2">
              {/* Mobile Controls Toggle */}
              <Button
                onClick={() => setShowMobileControls(!showMobileControls)}
                variant="ghost"
                size="sm"
                className="lg:hidden"
              >
                <Menu className="h-4 w-4 mr-2" />
                <ChevronDown className={`h-4 w-4 transition-transform ${showMobileControls ? 'rotate-180' : ''}`} />
              </Button>

              {/* Exit Focus Mode */}
              <Button
                onClick={toggleFocusMode}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t(currentLang, "exitFocusMode")}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Controls Panel - Collapsible */}
          {showMobileControls && (
            <div className="lg:hidden border-t border-primary/20 py-4 space-y-4">
              {/* Font Size Control */}
              <div className="flex items-center gap-3">
                <Type className="h-4 w-4" />
                <span className="text-sm min-w-[60px]">{t(currentLang, "fontSize")}</span>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={12}
                  max={28}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[30px]">{fontSize}px</span>
              </div>

              {/* Line Height Control */}
              <div className="flex items-center gap-3">
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm min-w-[70px]">{t(currentLang, "lineHeight")}</span>
                <Slider
                  value={[lineHeight]}
                  onValueChange={(value) => setLineHeight(value[0])}
                  min={1.2}
                  max={2.5}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[30px]">{lineHeight.toFixed(1)}</span>
              </div>

              {/* Font Family Control */}
              <div className="flex items-center gap-3">
                <Type className="h-4 w-4" />
                <span className="text-sm min-w-[60px]">Font</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as 'sans' | 'serif' | 'mono')}
                  className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                >
                  <option value="sans">Sans</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
              </div>

              {/* Ocean Sounds */}
              <div className="flex items-center gap-3">
                <span className="text-sm min-w-[60px]">{t(currentLang, "oceanSounds")}</span>
                <div className="flex-1">
                  <SimpleOceanAudio
                    volume={volume}
                    onVolumeChange={setVolume}
                    autoPlay={true}
                    language={currentLang}
                  />
                </div>
                <span className="text-xs text-muted-foreground min-w-[30px]">{Math.round(volume * 100)}%</span>
              </div>

              {/* Mobile Donate Button */}
              <div className="sm:hidden pt-2">
                <a href="https://ko-fi.com/galatide" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10 ripple-effect"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {t(currentLang, "donate")}
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Normal Navbar
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-transparent backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Site Title */}
          <Link
            href={homeUrl}
            className="font-heading text-xl sm:text-2xl text-glow-primary hover:brightness-125 transition-all duration-300"
          >
            <span className="hidden sm:inline">{t(currentLang, "galatideOcean")}</span>
            <span className="sm:hidden">Galatide</span>
          </Link>

          {/* Center - Focus Mode Button (only on article pages, hidden on mobile) */}
          {isArticlePage && (
            <div className="hidden md:flex flex-1 justify-center">
              <Button
                onClick={toggleFocusMode}
                variant="outline"
                size="sm"
                className="ripple-effect bg-primary/10 hover:bg-primary/20 border-primary/30"
              >
                <Focus className="mr-2 h-4 w-4" />
                {t(currentLang, "enterFocusMode")}
              </Button>
            </div>
          )}

          {/* Right - Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-2 md:gap-4">
              <Link href={`/${currentLang}/newsletter`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 ripple-effect"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">{t(currentLang, "newsletter")}</span>
                </Button>
              </Link>
              <a href="https://ko-fi.com/galatide" target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 ripple-effect"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">{t(currentLang, "donate")}</span>
                </Button>
              </a>
              <Link href={articlesUrl}>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground ripple-effect"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">{t(currentLang, "articles")}</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation - Stacked buttons */}
            <div className="sm:hidden flex flex-col gap-1">
              <div className="flex gap-1">
                <Link href={`/${currentLang}/newsletter`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10 ripple-effect px-2"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="https://ko-fi.com/galatide" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10 ripple-effect px-2"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </a>
                <Link href={articlesUrl}>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground ripple-effect px-2"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              {/* Mobile Focus Mode Button */}
              {isArticlePage && (
                <Button
                  onClick={toggleFocusMode}
                  variant="outline"
                  size="sm"
                  className="ripple-effect bg-primary/10 hover:bg-primary/20 border-primary/30 w-full"
                >
                  <Focus className="mr-2 h-4 w-4" />
                  Focus
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
