# Requirements Document

## Introduction

This specification addresses critical bug fixes and enhancements for the Galatide Ocean website. The focus is on improving responsive design across all devices, adding a donation link to the navigation, and fixing persistent meta field issues in the article creation and translation pages where incorrect or stale data is displayed instead of the actual field values.

## Glossary

- **System**: The Galatide Ocean website application
- **Admin Panel**: The administrative interface for managing articles, translations, and media
- **Article Creation Page**: The interface at `/admin/articles/new` for creating new articles
- **Article Translation Page**: The interface at `/admin/translations/new` for translating articles
- **Rich Text Editor**: The TipTap-based editor component used for article content
- **Media Picker**: The dialog component for selecting or adding media assets
- **Meta Fields**: SEO-related input fields including Meta Title, Meta Description, Alt Text, and SEO Title
- **Navbar**: The navigation bar component displayed at the top of the website
- **Responsive Design**: The ability of the website to adapt its layout and functionality across different screen sizes
- **Mobile Device**: Smartphones with screen widths typically between 320px and 480px
- **Tablet Device**: Tablets with screen widths typically between 481px and 1024px
- **Desktop Device**: Desktop computers and laptops with screen widths above 1024px

## Requirements

### Requirement 1: Responsive Design Optimization

**User Story:** As a website visitor, I want the website to display correctly and be fully functional on any device I use, so that I can access content comfortably whether I'm on my phone, tablet, or desktop computer.

#### Acceptance Criteria

1. WHEN a user accesses THE System on a mobile device with screen width between 320px and 480px, THE System SHALL display all content in a single-column layout with appropriately sized touch targets
2. WHEN a user accesses THE System on a tablet device with screen width between 481px and 1024px, THE System SHALL adapt the layout to utilize the available screen space efficiently
3. WHEN a user accesses THE System on a desktop device with screen width above 1024px, THE System SHALL display the full multi-column layout with all features accessible
4. WHEN a user interacts with THE Navbar on a mobile device, THE System SHALL provide a mobile-optimized navigation menu with all links accessible
5. WHEN a user accesses THE Admin Panel on a mobile device, THE System SHALL display form fields and controls in a mobile-friendly layout
6. WHEN a user uses THE Rich Text Editor on a mobile device, THE System SHALL provide accessible toolbar controls with appropriate spacing for touch interaction
7. WHEN a user views article cards on any device, THE System SHALL display images and text in proportions appropriate to the screen size
8. WHEN a user accesses focus mode on a mobile device, THE System SHALL display reading controls in a mobile-optimized layout

### Requirement 2: Donation Link Integration

**User Story:** As a website administrator, I want to add a "Donate" button to the navigation bar that redirects to our Ko-fi page, so that visitors can easily support the website.

#### Acceptance Criteria

1. WHEN a visitor views THE Navbar, THE System SHALL display a "Donate" button alongside other navigation links
2. WHEN a visitor clicks the "Donate" button, THE System SHALL redirect the browser to "https://ko-fi.com/galatide"
3. WHEN THE Navbar is in focus mode, THE System SHALL continue to display the "Donate" button in an accessible location
4. WHEN THE Navbar is viewed on a mobile device, THE System SHALL include the "Donate" button in the mobile navigation menu
5. WHERE the website supports multiple languages, THE System SHALL display the "Donate" button text in the appropriate language

### Requirement 3: Meta Field Data Persistence Fix

**User Story:** As a content administrator, I want meta fields in the article creation and translation pages to display the actual values I enter, so that I can accurately set SEO information without seeing incorrect or stale data.

#### Acceptance Criteria

1. WHEN an administrator enters text into the "Meta Title" field in THE Article Creation Page SEO Settings section, THE System SHALL display the entered text in the field
2. WHEN an administrator enters text into the "Meta Description" field in THE Article Creation Page SEO Settings section, THE System SHALL display the entered text in the field
3. WHEN an administrator enters text into the "Meta Title" field in THE Article Translation Page SEO Translation section, THE System SHALL display the entered text in the field
4. WHEN an administrator enters text into the "Meta Description" field in THE Article Translation Page SEO Translation section, THE System SHALL display the entered text in the field
5. WHEN an administrator clicks "Add Image" in THE Rich Text Editor, THE System SHALL display empty fields for Image URL, Alt Text, and SEO Title
6. WHEN an administrator enters values into the Image URL, Alt Text, and SEO Title fields in THE Rich Text Editor image dialog, THE System SHALL display the entered values in their respective fields
7. WHEN an administrator closes and reopens the image dialog in THE Rich Text Editor, THE System SHALL display empty fields for a new image entry
8. WHEN an administrator clicks "Pick" for cover image in THE Article Creation Page, THE System SHALL display THE Media Picker with empty fields for Image URL, Alt Text, and SEO Title when "Add from URL" is selected
9. WHEN an administrator enters values into the Media Picker fields and clicks "Add Image", THE System SHALL use the entered values for the selected media
10. WHEN an administrator reopens THE Media Picker after adding an image, THE System SHALL display empty fields for a new media selection
11. WHEN an administrator edits an existing article, THE System SHALL populate meta fields with the article's current meta values
12. WHEN an administrator edits an existing translation, THE System SHALL populate meta fields with the translation's current meta values

### Requirement 4: Form State Management

**User Story:** As a content administrator, I want form fields to maintain their state correctly during my editing session, so that I don't lose data or see incorrect values while creating or editing content.

#### Acceptance Criteria

1. WHEN an administrator types into any meta field, THE System SHALL update the field value in real-time without delay
2. WHEN an administrator switches between tabs or sections within THE Article Creation Page, THE System SHALL preserve all entered meta field values
3. WHEN an administrator switches between tabs or sections within THE Article Translation Page, THE System SHALL preserve all entered meta field values
4. WHEN an administrator clicks "Save Draft" or "Publish", THE System SHALL submit all current meta field values to the server
5. IF an administrator refreshes the page before saving, THEN THE System SHALL warn the user about unsaved changes
6. WHEN an administrator opens a dialog for adding media or images, THE System SHALL initialize all fields with empty values
7. WHEN an administrator closes a dialog without submitting, THE System SHALL discard the entered values and reset the dialog state

### Requirement 5: Ocean Background Sound Volume Adjustment

**User Story:** As a website visitor, I want the ocean background sound to play at a lower default volume, so that it provides ambient atmosphere without being intrusive or overwhelming.

#### Acceptance Criteria

1. WHEN THE System initializes the ocean background audio, THE System SHALL set the default volume to 15 percent
2. WHEN a visitor adjusts the volume using the volume control, THE System SHALL allow volume adjustment from 0 percent to 100 percent
3. WHEN a visitor sets a custom volume level, THE System SHALL persist the volume preference for the current session
4. WHEN THE System plays ocean sounds in focus mode, THE System SHALL use the user's selected volume level or the default 15 percent volume

### Requirement 6: Focus Mode Enhancement

**User Story:** As a reader, I want an enhanced focus mode experience with improved controls and better readability options, so that I can enjoy distraction-free reading with optimal comfort.

#### Acceptance Criteria

1. WHEN a reader activates focus mode, THE System SHALL display enhanced typography controls including font size, line height, and font family selection
2. WHEN a reader adjusts font size in focus mode, THE System SHALL apply changes to the article content in real-time with a range from 12px to 28px
3. WHEN a reader adjusts line height in focus mode, THE System SHALL apply changes to the article content in real-time with a range from 1.2 to 2.5
4. WHEN a reader selects a font family in focus mode, THE System SHALL provide at least three font options optimized for reading
5. WHEN a reader activates focus mode, THE System SHALL hide all non-essential UI elements including sidebar widgets and footer content
6. WHEN a reader uses focus mode on a mobile device, THE System SHALL display controls in a collapsible panel to maximize reading space
7. WHEN a reader exits focus mode, THE System SHALL restore all typography settings to their default values
8. WHEN a reader scrolls in focus mode, THE System SHALL maintain the focus mode controls in a fixed position for easy access
