# Implementation Plan

- [x] 1. Fix meta field state management in Rich Text Editor



  - Create reset function for image dialog state
  - Update all dialog close handlers to use reset function
  - Ensure image fields are empty on dialog open
  - Test image insertion with meta fields
  - _Requirements: 3.5, 3.6, 3.7_



- [ ] 2. Fix meta field state management in Media Picker
  - Create reset function for URL input state
  - Update "Add from URL" close handlers to use reset function
  - Ensure URL input fields are empty when section opens


  - Test media selection with meta fields
  - _Requirements: 3.8, 3.9, 3.10_

- [ ] 3. Fix meta field bindings in Article Creation Page
  - Audit all meta field input bindings (metaTitle, metaDescription, keywords)
  - Ensure all fields use controlled component pattern with value prop


  - Verify handleInputChange updates state correctly
  - Initialize form state with empty strings for all meta fields
  - Test meta field input and persistence
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.4_

- [-] 4. Fix meta field bindings in Article Translation Page

  - Audit all SEO Translation field bindings (metaTitle, metaDescription, keywords)
  - Ensure all fields use controlled component pattern with value prop
  - Verify state update handlers work correctly
  - Initialize form state with empty strings for all meta fields
  - Test meta field input and persistence
  - _Requirements: 3.3, 3.4, 4.3, 4.4_

- [x] 5. Add Donate button to Navbar

  - Add Donate button to normal navbar navigation links section
  - Position button between Newsletter and Articles buttons
  - Configure button to open https://ko-fi.com/galatide in new tab
  - Add Donate button to focus mode navbar
  - Add translation keys for "donate" in all supported languages (en, ar, de, fr, hi, ru, zh)
  - Style button consistently with existing navigation buttons
  - Test button functionality and translations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_



- [ ] 6. Adjust ocean background sound default volume
  - Update default volume from 0.3 to 0.15 in SimpleOceanAudio component
  - Update default volume in Navbar component where ocean audio is used
  - Verify volume slider still allows full range (0-100%)
  - Test volume persistence in session storage
  - _Requirements: 5.1, 5.2, 5.3, 5.4_



- [x] 7. Enhance focus mode controls

- [x] 7.1 Expand font size and line height ranges

  - Update font size slider range from 12-24px to 12-28px


  - Update line height slider range from 1.2-2.0 to 1.2-2.5
  - Test that changes apply to article content in real-time
  - _Requirements: 6.2, 6.3_


- [ ] 7.2 Add font family selector
  - Create font family state variable with options: 'sans', 'serif', 'mono'
  - Add font family selector UI control in focus mode navbar
  - Implement font family switching logic
  - Map font families to CSS: sans (Inter), serif (Georgia), mono (JetBrains Mono)
  - Test font family changes in focus mode
  - _Requirements: 6.4_

- [x] 7.3 Improve mobile focus mode layout


  - Create collapsible control panel for mobile devices
  - Ensure controls are accessible on small screens
  - Make controls fixed position while scrolling
  - Test focus mode on mobile devices (320px-480px width)
  - _Requirements: 6.6, 6.8_

- [x] 7.4 Implement settings reset on exit


  - Store original typography settings before entering focus mode
  - Restore default settings when exiting focus mode


  - Test that settings reset correctly
  - _Requirements: 6.7_

- [ ] 8. Implement responsive design for Navbar
  - Add mobile-responsive layout for navbar (< 640px)
  - Implement hamburger menu or stacked button layout for mobile


  - Ensure all navigation links are accessible on mobile
  - Test navbar on mobile, tablet, and desktop breakpoints
  - Verify touch targets are at least 44x44px on mobile
  - _Requirements: 1.4_

- [x] 9. Implement responsive design for Admin Panel


  - Update Article Creation Page layout for mobile devices
  - Update Article Translation Page layout for mobile devices
  - Ensure form fields stack vertically on mobile (< 640px)
  - Test form usability on mobile devices
  - Verify all controls are accessible with touch


  - _Requirements: 1.5_

- [ ] 10. Implement responsive design for Rich Text Editor
  - Make toolbar buttons wrap on mobile devices
  - Ensure adequate spacing between toolbar buttons for touch
  - Test editor functionality on mobile devices


  - Verify all toolbar controls are accessible
  - _Requirements: 1.6_

- [x] 11. Implement responsive design for article cards and content



  - Ensure article cards display correctly on all screen sizes
  - Implement single-column layout for mobile (< 640px)
  - Implement two-column layout for tablet (640px-1024px)
  - Implement multi-column layout for desktop (> 1024px)
  - Test image scaling and text proportions across devices
  - _Requirements: 1.1, 1.2, 1.3, 1.7_

- [ ] 12. Implement responsive focus mode
  - Ensure focus mode controls adapt to mobile layout
  - Test focus mode on mobile devices
  - Verify reading experience is optimal on all screen sizes
  - _Requirements: 1.8_

- [ ] 13. Comprehensive testing and validation
  - Test all meta field fixes on Article Creation Page
  - Test all meta field fixes on Article Translation Page
  - Test all meta field fixes in Rich Text Editor
  - Test all meta field fixes in Media Picker
  - Test Donate button on all pages and languages
  - Test ocean sound volume adjustment
  - Test enhanced focus mode features
  - Test responsive design on multiple devices (mobile, tablet, desktop)
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test keyboard navigation and accessibility
  - Verify no regressions in existing functionality
  - _Requirements: All_
