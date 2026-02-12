# Design Document

## Overview

This design document outlines the technical approach for implementing bug fixes and enhancements to the Galatide Ocean website. The implementation focuses on three main areas:

1. **Responsive Design Optimization** - Ensuring the website works seamlessly across all device sizes
2. **Donation Link Integration** - Adding a Ko-fi donation button to the navigation
3. **Meta Field Bug Fixes** - Resolving state management issues in form fields
4. **Ocean Sound Volume Adjustment** - Reducing default background audio volume
5. **Focus Mode Enhancement** - Improving the reading experience with better controls

The design maintains the existing visual aesthetic and component architecture while addressing functional issues and adding requested features.

## Architecture

### Component Structure

The implementation will modify existing components without changing the overall architecture:

```
src/
├── components/
│   ├── navbar.tsx                    # Add Donate button
│   ├── simple-ocean-audio.tsx        # Adjust default volume
│   ├── enhanced-focus-mode.tsx       # Enhance focus mode controls
│   ├── rich-text-editor.tsx          # Fix meta field state management
│   └── media-picker.tsx              # Fix meta field state management
├── app/
│   └── (admin)/admin/
│       ├── articles/new/page.tsx     # Fix meta field state
│       └── translations/new/page.tsx # Fix meta field state
└── styles/
    └── globals.css                   # Add responsive design utilities
```

### State Management Approach

The meta field bugs stem from improper state initialization and management. The fix will:

1. Ensure all form state is properly initialized with empty strings or undefined
2. Reset dialog state when dialogs are closed
3. Prevent state pollution between dialog opens
4. Use controlled components with proper value binding

## Components and Interfaces

### 1. Navbar Component Enhancement

**File:** `src/components/navbar.tsx`

**Changes:**
- Add "Donate" button to the navigation links section
- Ensure button is visible in both normal and focus modes
- Add responsive behavior for mobile devices
- Support multi-language text for the donate button

**Interface:**
```typescript
// No interface changes needed
// Add new button in the existing navigation structure
```

**Implementation Details:**
- Position the Donate button between the Newsletter and Articles buttons
- Use the same styling pattern as existing buttons (ripple-effect, border-primary/30)
- Add translation keys for "donate" in all supported languages
- Ensure the button opens Ko-fi link in a new tab

### 2. Ocean Audio Volume Adjustment

**File:** `src/components/simple-ocean-audio.tsx`

**Changes:**
- Change default volume from 0.3 (30%) to 0.15 (15%)
- Ensure volume control slider still allows full range (0-100%)
- Maintain volume persistence in session storage

**Implementation Details:**
```typescript
// Current default
const [volume, setVolume] = useState(0.3);

// New default
const [volume, setVolume] = useState(0.15);
```

### 3. Focus Mode Enhancement

**File:** `src/components/enhanced-focus-mode.tsx` and `src/components/navbar.tsx`

**Changes:**
- Expand font size range from 12-24px to 12-28px
- Expand line height range from 1.2-2.0 to 1.2-2.5
- Add font family selector with reading-optimized options
- Improve mobile layout with collapsible control panel
- Ensure controls remain accessible while scrolling

**New Interface:**
```typescript
interface FocusModeSettings {
  fontSize: number;        // 12-28px
  lineHeight: number;      // 1.2-2.5
  fontFamily: 'sans' | 'serif' | 'mono';
  volume: number;          // 0-1
}
```

**Font Family Options:**
- Sans: Inter (default, clean and modern)
- Serif: Georgia (traditional reading experience)
- Mono: JetBrains Mono (for technical content)

### 4. Rich Text Editor Meta Field Fixes

**File:** `src/components/rich-text-editor.tsx`

**Current Issue:**
The image dialog state variables (`imageUrl`, `imageAltText`, `imageSeoTitle`) are not being reset when the dialog closes, causing stale data to appear on subsequent opens.

**Solution:**
```typescript
// Add reset function
const resetImageDialog = () => {
  setImageUrl("");
  setImageAltText("");
  setImageSeoTitle("");
  setShowImageDialog(false);
};

// Use reset function when closing dialog
// Replace all instances of setShowImageDialog(false) with resetImageDialog()
```

**Changes:**
1. Create a `resetImageDialog` function that clears all image-related state
2. Call `resetImageDialog` when:
   - Dialog is closed via Cancel button
   - Dialog is closed via X button
   - Image is successfully added
3. Ensure the dialog always opens with empty fields for new images

### 5. Media Picker Meta Field Fixes

**File:** `src/components/media-picker.tsx`

**Current Issue:**
Similar to the Rich Text Editor, the Media Picker's URL input fields retain values between dialog opens.

**Solution:**
```typescript
// Add reset function
const resetUrlInput = () => {
  setImageUrl("");
  setAltText("");
  setSeoTitle("");
  setShowUrlInput(false);
};

// Use when closing or after successful submission
```

**Changes:**
1. Create a `resetUrlInput` function that clears all URL input state
2. Call `resetUrlInput` when:
   - "Add from URL" section is closed
   - Image is successfully added
   - Dialog is closed
3. Ensure fields are empty when "Add from URL" is clicked

### 6. Article Creation Page Meta Field Fixes

**File:** `src/app/(admin)/admin/articles/new/page.tsx`

**Current Issue:**
Meta fields may not be properly bound to form state or may have initialization issues.

**Solution:**
1. Verify all meta fields use controlled component pattern:
```typescript
<Input
  id="metaTitle"
  value={formData.metaTitle}
  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
/>
```

2. Ensure `handleInputChange` properly updates state:
```typescript
const handleInputChange = (field: string, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};
```

3. Initialize form state with empty strings (not undefined):
```typescript
const [formData, setFormData] = useState({
  // ... other fields
  metaTitle: "",
  metaDescription: "",
  keywords: "",
});
```

**Changes:**
- Audit all meta field bindings
- Ensure consistent use of controlled components
- Fix any instances where value prop is missing or incorrect

### 7. Article Translation Page Meta Field Fixes

**File:** `src/app/(admin)/admin/translations/new/page.tsx`

**Current Issue:**
Same as Article Creation Page - meta fields not properly displaying entered values.

**Solution:**
Apply the same controlled component pattern as Article Creation Page:

```typescript
<Input
  id="metaTitle"
  value={formData.metaTitle}
  onChange={(e) => setFormData(prev => ({...prev, metaTitle: e.target.value}))}
/>
```

**Changes:**
- Ensure all SEO Translation fields use controlled components
- Verify state initialization with empty strings
- Test that values persist when switching between form sections

### 8. Responsive Design Implementation

**Files:** Multiple component files and `src/app/globals.css`

**Approach:**
Use Tailwind CSS responsive utilities to adapt layouts across breakpoints:

- **Mobile (< 640px):** Single column, stacked navigation, larger touch targets
- **Tablet (640px - 1024px):** Two-column layouts where appropriate
- **Desktop (> 1024px):** Full multi-column layouts

**Key Changes:**

1. **Navbar Responsive Behavior:**
```typescript
// Mobile: Hamburger menu or stacked buttons
// Tablet: Horizontal layout with smaller buttons
// Desktop: Full horizontal layout
```

2. **Admin Forms:**
```typescript
// Use Tailwind responsive classes
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  // Becomes single column on mobile, 3 columns on desktop
</div>
```

3. **Rich Text Editor Toolbar:**
```typescript
// Wrap toolbar buttons on mobile
<div className="flex flex-wrap gap-1">
  // Buttons wrap to multiple rows on small screens
</div>
```

4. **Focus Mode Controls:**
```typescript
// Mobile: Collapsible panel
// Desktop: Horizontal control bar
<div className="flex flex-col md:flex-row items-center gap-4">
```

## Data Models

No database schema changes are required. All changes are frontend-only.

## Error Handling

### Form Validation
- Maintain existing validation logic
- Ensure meta fields are optional (empty strings are valid)
- Display validation errors clearly on mobile devices

### Audio Playback
- Handle audio loading errors gracefully
- Provide fallback if audio file is unavailable
- Show user-friendly error messages

### Responsive Layout
- Test on various screen sizes (320px to 2560px)
- Ensure no horizontal scrolling on mobile
- Verify touch targets are at least 44x44px

## Testing Strategy

### Manual Testing Checklist

#### Responsive Design
- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPad (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Verify navbar adapts correctly
- [ ] Verify admin forms are usable on mobile
- [ ] Verify rich text editor toolbar is accessible on mobile
- [ ] Test focus mode on all device sizes

#### Donate Button
- [ ] Verify button appears in navbar
- [ ] Verify link opens Ko-fi page in new tab
- [ ] Test on mobile navigation
- [ ] Verify translations work for all languages

#### Meta Field Fixes
- [ ] Create new article and enter meta title/description
- [ ] Verify entered values display correctly
- [ ] Close and reopen page, verify values persist
- [ ] Test image dialog in rich text editor
- [ ] Verify image fields are empty on first open
- [ ] Add image, close dialog, reopen - verify fields are empty
- [ ] Test media picker "Add from URL"
- [ ] Verify URL input fields are empty on first open
- [ ] Add media, close, reopen - verify fields are empty
- [ ] Test translation page meta fields
- [ ] Verify all SEO translation fields work correctly

#### Ocean Sound Volume
- [ ] Load page and verify default volume is 15%
- [ ] Adjust volume slider and verify it works
- [ ] Verify volume persists during session
- [ ] Test in focus mode

#### Focus Mode Enhancement
- [ ] Activate focus mode
- [ ] Test font size slider (12-28px range)
- [ ] Test line height slider (1.2-2.5 range)
- [ ] Test font family selector
- [ ] Verify controls work on mobile
- [ ] Test collapsible panel on mobile
- [ ] Verify controls remain accessible while scrolling
- [ ] Exit focus mode and verify settings reset

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Accessibility Testing
- Keyboard navigation works for all new controls
- Screen reader announces donate button correctly
- Focus indicators visible on all interactive elements
- Touch targets meet minimum size requirements (44x44px)

## Implementation Notes

### Priority Order
1. **High Priority:** Meta field bug fixes (critical functionality)
2. **High Priority:** Responsive design (affects all users)
3. **Medium Priority:** Donate button (new feature)
4. **Medium Priority:** Ocean sound volume (quality of life)
5. **Medium Priority:** Focus mode enhancement (quality of life)

### Backward Compatibility
- All changes maintain existing functionality
- No breaking changes to component APIs
- Existing articles and translations unaffected

### Performance Considerations
- Responsive design uses CSS only (no JavaScript overhead)
- State management changes improve performance by preventing unnecessary re-renders
- Audio volume change has no performance impact

### Deployment Strategy
- Changes can be deployed incrementally
- Each fix/feature is independent
- Test thoroughly in staging before production
- Monitor for any regressions after deployment
