/**
 * Accessibility utilities for Galatide
 * WCAG 2.1 compliance and inclusive design helpers
 */

// ARIA attributes helpers
export const ARIA = {
  // Common ARIA attributes
  label: (text: string) => ({ 'aria-label': text }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),
  checked: (isChecked: boolean) => ({ 'aria-checked': isChecked }),
  disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled }),
  hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),
  live: (level: 'polite' | 'assertive' | 'off') => ({ 'aria-live': level }),
  
  // Complex ARIA patterns
  listbox: {
    container: { role: 'listbox' },
    option: (isSelected: boolean) => ({
      role: 'option',
      'aria-selected': isSelected,
    }),
  },
  
  menu: {
    container: { role: 'menu' },
    item: { role: 'menuitem' },
    button: (isExpanded: boolean) => ({
      'aria-haspopup': 'menu',
      'aria-expanded': isExpanded,
    }),
  },
  
  tab: {
    list: { role: 'tablist' },
    tab: (isSelected: boolean, controlsId: string) => ({
      role: 'tab',
      'aria-selected': isSelected,
      'aria-controls': controlsId,
    }),
    panel: (labelledById: string) => ({
      role: 'tabpanel',
      'aria-labelledby': labelledById,
    }),
  },
} as const;

// Focus management
export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return() => {};
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Store current focused element
    const previouslyFocused = document.activeElement as HTMLElement;
    this.focusStack.push(previouslyFocused);
    
    // Focus first element
    firstElement.focus();
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      const previousElement = this.focusStack.pop();
      if (previousElement) {
        previousElement.focus();
      }
    };
  }
  
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }
  
  static moveFocusToNext(currentElement: HTMLElement): void {
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  }
  
  static moveFocusToPrevious(currentElement: HTMLElement): void {
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(currentElement);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[prevIndex]?.focus();
  }
}

// Color contrast utilities
export const CONTRAST = {
  // WCAG AA compliance ratios
  minimumRatio: 4.5,  // For normal text
  largeTextRatio: 3,  // For large text (18px+ or 14px+ bold)
  enhancedRatio: 7,   // For AAA compliance
  
  // Calculate contrast ratio between two colors
  calculateRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },
  
  // Check if contrast meets WCAG standards
  meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.calculateRatio(color1, color2);
    const threshold = level === 'AAA' ? this.enhancedRatio : this.minimumRatio;
    return ratio >= threshold;
  },
  
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  getLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
};

// Screen reader utilities
export const SCREEN_READER = {
  // Create screen reader only text
  srOnlyClass: 'sr-only',
  
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    if (typeof window === 'undefined') return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // Create live region for dynamic content
  createLiveRegion: (id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement => {
    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    return region;
  },
};

// Keyboard navigation helpers
export const KEYBOARD = {
  // Common key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End',
  } as const,
  
  // Handle arrow key navigation
  handleArrowNavigation: (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: { vertical?: boolean; loop?: boolean } = {}
  ): number => {
    const { vertical = true, loop = true } = options;
    const { key } = e;
    
    let newIndex = currentIndex;
    
    if (vertical) {
      if (key === KEYBOARD.keys.ARROW_UP) {
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
      } else if (key === KEYBOARD.keys.ARROW_DOWN) {
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
      }
    }
    
    if (!vertical || (vertical && (key === KEYBOARD.keys.ARROW_LEFT || key === KEYBOARD.keys.ARROW_RIGHT))) {
      if (key === KEYBOARD.keys.ARROW_LEFT) {
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
      } else if (key === KEYBOARD.keys.ARROW_RIGHT) {
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
      }
    }
    
    if (key === KEYBOARD.keys.HOME) {
      e.preventDefault();
      newIndex = 0;
    } else if (key === KEYBOARD.keys.END) {
      e.preventDefault();
      newIndex = items.length - 1;
    }
    
    if (newIndex !== currentIndex) {
      items[newIndex]?.focus();
    }
    
    return newIndex;
  },
};

// Motion preferences
export const MOTION = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Conditionally apply animations based on user preference
  conditionalAnimation: (animation: string): string => {
    return MOTION.prefersReducedMotion() ? '' : animation;
  },
  
  // Safe animation durations
  safeDuration: (normalDuration: number): number => {
    return MOTION.prefersReducedMotion() ? 0 : normalDuration;
  },
};

// Utility classes for accessibility
export const A11Y_CLASSES = {
  // Screen reader only
  srOnly: 'sr-only absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-rect-0',
  
  // Focus visible styles
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  
  // Skip links
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-primary-foreground p-2 z-50',
  
  // High contrast mode support
  highContrast: 'contrast-more:border-2 contrast-more:border-current',
} as const;

// Generate unique IDs for ARIA relationships
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}
