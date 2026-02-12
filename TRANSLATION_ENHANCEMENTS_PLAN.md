# Translation Functionality Enhancements - Implementation Plan

## Status: 🔧 **IN PROGRESS**

**Date:** 2025-10-23  
**Issues to Fix:** 4 critical enhancements  
**Priority:** HIGH  

---

## Issues Identified

### Issue #1: Missing Delete Button ❌
**Current State:** Translation list only has Edit button  
**Required:** Add Delete button alongside Edit button  
**Location:** `src/components/admin/article-translation-manager.tsx`

### Issue #2: Basic Creation Editor ❌
**Current State:** Create translation uses basic textarea  
**Required:** Replace with RichTextEditor (same as edit page)  
**Location:** `src/app/(admin)/admin/translations/new/page.tsx`

### Issue #3: Empty Original Content in Edit ❌
**Current State:** Original article fields are empty in edit page  
**Root Cause:** Missing GET endpoint for `/api/translations/[id]`  
**Locations:**
- Missing: `src/app/api/translations/[id]/route.ts` (GET method)
- Frontend: `src/app/(admin)/admin/translations/[id]/edit/page.tsx`

### Issue #4: Failed to Save Translation ❌
**Errors:**
```
405 Method Not Allowed - Missing PUT/GET endpoints
400 Bad Request - Invalid validation schema
```
**Root Cause:** 
- PUT endpoint has wrong validation schema (expects draft/in-progress/completed)
- Should expect DRAFT/PUBLISHED status
- Missing required fields in schema

---

## Implementation Plan

### Fix #1: Add Delete Button ✅
**File:** `src/components/admin/article-translation-manager.tsx`

**Changes:**
1. Add Delete button next to Edit button
2. Implement delete confirmation dialog
3. Call DELETE endpoint
4. Refresh translations list after delete

### Fix #2: Use RichTextEditor for Creation ✅
**File:** `src/app/(admin)/admin/translations/new/page.tsx`

**Changes:**
1. Replace Content `<Textarea>` with `<RichTextEditor>`
2. Match the advanced editing capabilities of edit page
3. Maintain all existing functionality

### Fix #3: Add GET Endpoint & Fix Original Content ✅
**File:** `src/app/api/translations/[id]/route.ts`

**Changes:**
1. Add GET method to fetch translation with original article
2. Include full article data (title, excerpt, content)
3. Update edit page to properly extract article data

### Fix #4: Fix PUT Endpoint Validation ✅
**File:** `src/app/api/translations/[id]/route.ts`

**Changes:**
1. Update validation schema to match translation fields
2. Accept DRAFT/PUBLISHED status (not draft/in-progress/completed)
3. Add proper database update logic
4. Return complete translation object

---

## Detailed Implementation

### File 1: `src/app/api/translations/[id]/route.ts`

**Add GET Method:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const translation = await db.articleTranslation.findUnique({
      where: { id },
      include: {
        language: true,
        article: {
          include: {
            originalLanguage: true,
            tags: {
              include: { tag: true }
            }
          }
        },
        translator: true
      }
    });
    
    if (!translation) {
      return NextResponse.json(
        { error: "Translation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch translation" },
      { status: 500 }
    );
  }
}
```

**Fix PUT Method:**
```typescript
const updateTranslationSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "draft", "published"]).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRequestRole(request);
  if (!canCreateOrUpdate(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTranslationSchema.parse(body);
    
    const status = validatedData.status?.toUpperCase() as "DRAFT" | "PUBLISHED" | undefined;
    
    const updated = await db.articleTranslation.update({
      where: { id },
      data: {
        ...validatedData,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        language: true,
        translator: true
      }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update translation" },
      { status: 500 }
    );
  }
}
```

**Add DELETE Method:**
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRequestRole(request);
  if (!canDelete(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    const { id } = await params;
    
    await db.articleTranslation.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete translation" },
      { status: 500 }
    );
  }
}
```

---

### File 2: `src/components/admin/article-translation-manager.tsx`

**Add Delete Functionality:**
```typescript
const handleDeleteTranslation = async (translationId: string) => {
  if (!confirm('Are you sure you want to delete this translation?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/translations/${translationId}`, {
      method: 'DELETE',
      headers: { 'x-role': 'admin' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete translation');
    }
    
    // Refresh translations list
    setTranslations(prev => prev.filter(t => t.id !== translationId));
  } catch (error) {
    console.error('Error deleting translation:', error);
    alert('Failed to delete translation');
  }
};
```

**Update UI:**
```tsx
<div className="flex items-center gap-2">
  <Button
    size="sm"
    variant="outline"
    onClick={() => onEditTranslation(translation.id)}
  >
    <Edit className="h-4 w-4 mr-1" />
    Edit
  </Button>
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleDeleteTranslation(translation.id)}
    className="text-destructive hover:text-destructive"
  >
    <Trash2 className="h-4 w-4 mr-1" />
    Delete
  </Button>
</div>
```

---

### File 3: `src/app/(admin)/admin/translations/new/page.tsx`

**Replace Textarea with RichTextEditor:**
```tsx
// Before
<Textarea
  id="content"
  value={formData.content}
  onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
  placeholder="Translate the content..."
  rows={15}
/>

// After
<RichTextEditor
  content={formData.content}
  onChange={(content) => setFormData(prev => ({...prev, content}))}
  placeholder="Translate the content..."
/>
```

---

## Testing Checklist

### Test #1: Delete Translation ✅
- [ ] Navigate to translations page
- [ ] Click Delete button
- [ ] Confirm deletion dialog appears
- [ ] Confirm deletion
- [ ] Translation removed from list
- [ ] Database record deleted

### Test #2: Advanced Editor for Creation ✅
- [ ] Click "Add Translation"
- [ ] Verify RichTextEditor displays (not Textarea)
- [ ] Test formatting toolbar
- [ ] Insert HTML content
- [ ] Save and verify content preserved

### Test #3: Original Content in Edit ✅
- [ ] Click Edit on existing translation
- [ ] Verify Original title displays
- [ ] Verify Original excerpt displays
- [ ] Verify Original content displays with HTML
- [ ] All three fields populated correctly

### Test #4: Save/Publish Translation ✅
- [ ] Edit translation
- [ ] Click Save Draft
- [ ] Verify saves successfully (no 405/400 errors)
- [ ] Click Publish
- [ ] Verify publishes successfully
- [ ] Check database status updated

---

## API Endpoints Summary

### `/api/translations/[id]`

| Method | Status | Function |
|--------|--------|----------|
| GET | ✅ TO ADD | Fetch translation with original article |
| PUT | ✅ TO FIX | Update translation |
| DELETE | ✅ TO ADD | Delete translation |

---

## Success Criteria

✅ Delete button appears next to Edit button  
✅ Delete confirmation works correctly  
✅ RichTextEditor used in creation page  
✅ Original content displays in edit page  
✅ Translations save without 405/400 errors  
✅ All validation errors resolved  
✅ Database operations work correctly  

---

**Next Step:** Implement fixes in order
