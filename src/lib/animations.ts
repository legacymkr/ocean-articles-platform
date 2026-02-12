/**
 * Galatide Animation System
 * Centralized animation configurations for consistent motion design
 */

// Animation Durations (in milliseconds)
export const DURATIONS = {
  // Micro interactions
  instant: 0,
  quick: 150,      // Button hover, input focus
  fast: 250,       // Page transitions, modal open/close
  normal: 350,     // Card hover, scroll reveals
  slow: 500,       // Loading states, complex animations
  slower: 750,     // Hero animations, page loads
  
  // Special cases
  typing: 50,      // Per character in typing animation
  bubble: 2000,    // Background bubble cycle
} as const;

// Easing Functions (CSS cubic-bezier)
export const EASINGS = {
  // Standard easings
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom ocean-inspired easings
  wave: 'cubic-bezier(0.4, 0, 0.2, 1)',           // Gentle wave motion
  surge: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // Ocean surge
  tide: 'cubic-bezier(0.19, 1, 0.22, 1)',         // Tidal flow
  current: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Current bounce
  depth: 'cubic-bezier(0.77, 0, 0.175, 1)',       // Descent into depth
  
  // UI specific
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring bounce
  soft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',       // Soft transition
} as const;

// Stagger Delays (for sequential animations)
export const STAGGER = {
  micro: 50,       // List items, tags
  small: 100,      // Cards in grid
  medium: 150,     // Section reveals
  large: 200,      // Page sections
  xlarge: 300,     // Major page elements
} as const;

// Animation Classes (for Tailwind CSS)
export const ANIMATION_CLASSES = {
  // Transitions
  transition: {
    all: 'transition-all',
    colors: 'transition-colors',
    transform: 'transition-transform',
    opacity: 'transition-opacity',
    shadow: 'transition-shadow',
  },
  
  // Durations
  duration: {
    quick: 'duration-150',
    fast: 'duration-250', 
    normal: 'duration-300',
    slow: 'duration-500',
    slower: 'duration-700',
  },
  
  // Easings (custom utilities)
  ease: {
    wave: 'ease-wave',
    surge: 'ease-surge', 
    tide: 'ease-tide',
    current: 'ease-current',
    depth: 'ease-depth',
    spring: 'ease-spring',
    soft: 'ease-soft',
  },
  
  // Hover states
  hover: {
    scale: 'hover:scale-105',
    scaleSmall: 'hover:scale-102',
    brightness: 'hover:brightness-125',
    shadow: 'hover:shadow-lg hover:shadow-primary/20',
    glow: 'hover:shadow-glow',
    lift: 'hover:-translate-y-1',
  },
  
  // Focus states
  focus: {
    ring: 'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
    outline: 'focus:outline-none focus:ring-2 focus:ring-primary',
    glow: 'focus:shadow-glow-primary',
  },
  
  // Active states
  active: {
    scale: 'active:scale-95',
    brightness: 'active:brightness-90',
  },
} as const;

// Scroll reveal configurations
export const SCROLL_REVEAL = {
  // Basic reveal
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    duration: DURATIONS.normal,
    easing: EASINGS.wave,
  },
  
  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    duration: DURATIONS.slow,
    easing: EASINGS.tide,
  },
  
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    duration: DURATIONS.normal,
    easing: EASINGS.spring,
  },
  
  // Slide from left
  slideLeft: {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    duration: DURATIONS.normal,
    easing: EASINGS.surge,
  },
  
  // Slide from right  
  slideRight: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    duration: DURATIONS.normal,
    easing: EASINGS.surge,
  },
} as const;

// Preset animation combinations
export const PRESETS = {
  // Button animations
  button: {
    primary: `${ANIMATION_CLASSES.transition.all} ${ANIMATION_CLASSES.duration.quick} ${ANIMATION_CLASSES.hover.brightness} ${ANIMATION_CLASSES.active.scale} ${ANIMATION_CLASSES.focus.ring}`,
    secondary: `${ANIMATION_CLASSES.transition.all} ${ANIMATION_CLASSES.duration.quick} ${ANIMATION_CLASSES.hover.shadow} ${ANIMATION_CLASSES.active.scale} ${ANIMATION_CLASSES.focus.ring}`,
    ghost: `${ANIMATION_CLASSES.transition.colors} ${ANIMATION_CLASSES.duration.quick} ${ANIMATION_CLASSES.focus.outline}`,
  },
  
  // Card animations
  card: {
    default: `${ANIMATION_CLASSES.transition.all} ${ANIMATION_CLASSES.duration.normal} ${ANIMATION_CLASSES.hover.scale} ${ANIMATION_CLASSES.hover.shadow}`,
    interactive: `${ANIMATION_CLASSES.transition.all} ${ANIMATION_CLASSES.duration.fast} ${ANIMATION_CLASSES.hover.lift} ${ANIMATION_CLASSES.hover.glow}`,
  },
  
  // Link animations
  link: {
    default: `${ANIMATION_CLASSES.transition.colors} ${ANIMATION_CLASSES.duration.quick} ${ANIMATION_CLASSES.hover.brightness}`,
    underline: `${ANIMATION_CLASSES.transition.all} ${ANIMATION_CLASSES.duration.quick} hover:border-primary`,
  },
  
  // Image animations
  image: {
    hover: `${ANIMATION_CLASSES.transition.transform} ${ANIMATION_CLASSES.duration.slow} ${ANIMATION_CLASSES.hover.scaleSmall}`,
    zoom: `${ANIMATION_CLASSES.transition.transform} ${ANIMATION_CLASSES.duration.normal} hover:scale-110`,
  },
} as const;

// Utility functions
export function createStaggerDelay(index: number, staggerMs: number = STAGGER.small): number {
  return index * staggerMs;
}

export function getAnimationDelay(index: number, type: keyof typeof STAGGER = 'small'): string {
  return `${createStaggerDelay(index, STAGGER[type])}ms`;
}

// Reduced motion utilities
export function respectsReducedMotion(className: string): string {
  return `motion-safe:${className}`;
}

export function createResponsiveAnimation(
  mobile: string, 
  desktop: string
): string {
  return `${mobile} md:${desktop}`;
}
