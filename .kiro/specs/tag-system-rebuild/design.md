# Design Document

## Overview

This design addresses the complete rebuild of the tag management system to provide proper multilingual support, centralized tag creation, and improved user experience. The solution involves updating multiple components, API endpoints, and database interactions to ensure consistent tag handling across all languages and interfaces.

**Key Design Decisions:**
- **Centralized Tag Management**: All tag creation and management is consolidated in the dedicated admin interface to maintain consistency and control
- **Automatic Tag Inheritance**: Translation creation interfaces inherit tags from original articles to prevent fragmentation
- **Fallback Translation Strategy**: When translations don't exist, the system falls back to original English names rather than showing placeholder text
- **Full Card Clickability**: Article cards become entirely clickable while maintaining existing visual design for better UX

## Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                      │
├─────────────────────────────────────────────────────────────┤
│  Tag Management Page  │  Article Creation  │  Article Card  │
│  - Create tags        │  - Assign tags     │  - Display     │
│  - Manage translations│  - Create new tags │    translated  │
│                       │                    │    tags        │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  /api/admin/tags     │  /api/articles     │  /api/articles/ │
│  - CRUD operations   │  - List with       │    by-slug      │
│  - Translation mgmt  │    translated tags │  - Detail with  │
│                      │                    │    translations │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                           │
├─────────────────────────────────────────────────────────────┤
│     Tag    │  TagTranslation  │  ArticleTag  │   Article    │
│   - id     │  - tagId         │  - articleId │   - id       │
│   - name   │  - languageCode  │  - tagId     │   - title    │
│   - color  │  - name          │              │   - content  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Tag Creation Flow**: Admin creates tag → API validates → Database stores → UI updates
2. **Tag Translation Flow**: Admin adds translation → API stores → All components use translated names
3. **Article Display Flow**: Component requests data → API fetches with language → Returns translated tags
4. **Article Card Interaction**: User clicks card → Navigation to article page

## Components and Interfaces

### 1. Tag Management Interface

**Location**: `src/app/(admin)/admin/tags/page.tsx`

**Key Features**:
- Create new tags with name and color
- List all existing tags
- Add/edit translations for each tag
- Delete tags (with confirmation)

**State Management**:
```typescript
interface TagManagementState {
  tags: Tag[];
  languages: Language[];
  selectedTag: Tag | null;
  showCreateDialog: boolean;
  showTranslationDialog: boolean;
  createForm: { name: string; color: string };
  translationForm: { [languageCode: string]: string };
}
```

### 2. Article Card Component

**Location**: `src/components/article-card.tsx`

**Key Changes**:
- Wrap entire card in Link component for full clickability (Requirement 4)
- Preserve existing "Read More" button styling while making entire card clickable
- Maintain hover effects and visual feedback across entire card area
- Display translated tag names with fallback to English when translations don't exist
- Ensure consistent behavior across all language versions

**Design Rationale**: Making the entire card clickable improves user experience by providing a larger target area while maintaining the existing visual design that users are familiar with.

**Props Interface**:
```typescript
interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    tags: Array<{
      id: string;
      name: string; // Already translated by API with fallback
      color?: string;
    }>;
  };
  language: string;
}
```

### 3. Article Creation Interface

**Location**: `src/app/(admin)/admin/articles/new/page.tsx`

**Tag Handling** (Requirement 2):
- Allow selection from existing tags via dropdown or multi-select
- Provide "Create New Tag" option for administrators during article creation
- Validate tag creation before article submission
- Ensure new tags are immediately available for selection

**Design Rationale**: Allowing tag creation during article creation provides flexibility for administrators while maintaining centralized control through the dedicated tag management interface.

### 4. Translation Creation Interface

**Location**: `src/app/(admin)/admin/translations/new/page.tsx`

**Key Changes** (Requirement 2):
- Remove tag selection fields completely
- Remove tag creation functionality
- Display inherited tags as read-only information with translated names
- Automatically inherit all tags from the original article
- Show clear indication that tags cannot be modified in translation interface

**Design Rationale**: Restricting tag modification in translation interfaces prevents tag fragmentation and ensures consistency across language versions. Tags are content categorization elements that should remain consistent across translations.

## Data Models

### Database Schema Updates

No schema changes required - existing structure supports the design (Requirement 6):

```prisma
model Tag {
  id           String            @id @default(cuid())
  name         String            // Original English name
  color        String?
  translations TagTranslation[]
  articles     ArticleTag[]
}

model TagTranslation {
  id           String @id @default(cuid())
  tagId        String
  languageCode String
  name         String            // Translated name
  tag          Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([tagId, languageCode])
}
```

### Translation Lookup Logic

**Fallback Strategy** (Requirement 3):
1. Query for tag translation in requested language
2. If translation exists, return translated name
3. If no translation exists, return original English name from Tag.name
4. Never return placeholder text like "tag"

**Design Rationale**: This approach ensures users always see meaningful tag names while gracefully handling missing translations.

### API Response Formats

**Articles List Response** (Requirement 5):
```typescript
interface ArticleListResponse {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    tags: Array<{
      id: string;
      name: string; // Translated based on lang parameter with fallback
      color: string;
    }>;
  }>;
}
```

**Article Detail Response** (Requirement 5):
```typescript
interface ArticleDetailResponse {
  article: {
    id: string;
    title: string;
    content: string;
    tags: Array<{
      id: string;
      name: string; // Translated based on lang parameter with fallback
      color: string;
    }>;
  };
}
```

**Tag Management API Response**:
```typescript
interface TagManagementResponse {
  tags: Array<{
    id: string;
    name: string; // Original English name
    color: string;
    translations: Array<{
      languageCode: string;
      name: string;
    }>;
  }>;
}
```

## Error Handling

### Tag Creation Errors (Requirement 1 & 5)
- Duplicate tag names validation
- Invalid color values (must be valid hex colors)
- Database connection issues with proper error messages
- Validation failures with specific field feedback
- Unauthorized access to admin interfaces

### Translation Errors (Requirement 3)
- Missing language codes with clear error messages
- Duplicate translations prevention
- Invalid characters in translations
- Fallback handling when translation lookup fails

### Build and Deployment Errors (Requirement 6)
- TypeScript compilation errors prevention
- Breaking changes detection
- Backward compatibility validation
- Test failure handling

### API Error Responses
```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  field?: string; // For validation errors
}
```

**Design Rationale**: Comprehensive error handling ensures system reliability and provides clear feedback to administrators and developers.

## Testing Strategy

### Unit Tests (Requirement 6)
- Tag creation validation logic
- Translation lookup with fallback behavior
- API endpoint responses for all scenarios
- Component rendering with translated tags
- Error handling for all failure cases

### Integration Tests (Requirement 6)
- End-to-end tag creation flow from admin interface
- Article card navigation functionality
- Multilingual tag display across all components
- Database transaction integrity and referential constraints
- API consistency across all endpoints

### Manual Testing Checklist
1. **Tag Management** (Requirement 1):
   - Create new tag in management interface
   - Add translations for multiple languages
   - Verify tag list updates correctly
   
2. **Tag Display** (Requirement 3):
   - Verify tags appear correctly in article cards with translations
   - Test fallback to English when translations missing
   - Confirm no placeholder text appears
   
3. **Navigation** (Requirement 4):
   - Test article card click navigation from any area
   - Verify hover effects work across entire card
   - Confirm consistent behavior across languages
   
4. **Interface Restrictions** (Requirement 2):
   - Confirm translation creation doesn't allow tag editing
   - Verify article creation allows tag assignment and creation
   - Test tag inheritance in translations
   
5. **Build Validation** (Requirement 6):
   - Validate TypeScript compilation succeeds
   - Run all existing tests
   - Verify no breaking changes introduced

## Implementation Phases

### Phase 1: API Layer Updates (Requirements 3 & 5)
- Update articles listing API to include translated tags with fallback logic
- Update article detail API to include translated tags with fallback logic
- Fix tag creation API endpoint with proper validation
- Implement tag translation API for management interface
- Ensure proper error handling and referential integrity

### Phase 2: Tag Management Interface (Requirement 1)
- Implement tag creation functionality in admin interface
- Add translation management for existing tags
- Create proper form validation and error handling
- Ensure tag list updates correctly after operations

### Phase 3: Component Updates (Requirements 2 & 4)
- Update article card to be fully clickable while preserving styling
- Remove tag creation from translation interfaces
- Update article creation to allow tag assignment and creation
- Implement tag inheritance display in translation interface

### Phase 4: Translation System (Requirement 3)
- Implement proper tag translation lookup with fallback
- Fix display of translated tag names across all components
- Ensure no placeholder text appears when translations missing
- Test multilingual support across all language versions

### Phase 5: Testing and Validation (Requirement 6)
- Run TypeScript build to ensure no compilation errors
- Execute all existing tests to prevent regressions
- Verify backward compatibility with existing data
- Test all functionality across different languages
- Validate that all requirements are met

**Design Rationale**: This phased approach ensures that foundational API changes are implemented first, followed by UI updates, and concludes with comprehensive testing to meet the build success requirement.