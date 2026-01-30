# Detailed Implementation Plan: Active Workspace & Unified Add-to-Workspace Feature

## Overview

This plan describes implementing an "active workspace" concept with a unified "Add to Workspace" flow for the DataFresq application. The goal is to simplify adding programs from search results to workspaces.

---

## Current State

### Existing Components
- **`/app/components/AddToWorkspace/index.tsx`** - Modal to add selected programs to a workspace (only appears when programs are selected)
- **`/app/routes/(app)/formations/index/components/CreateWorkspaceFromSearchModal.tsx`** - Modal to create a new workspace from search results
- **`/app/components/layouts/AppLayout/Sidemenu/index.tsx`** - Sidebar with workspace lists

### Existing API
- `POST /workspaces` - Create workspace
- `POST /workspaces/:id/programs` - Add programs by IDs
- `POST /workspaces/from-search` - Create workspace from search (just added)

---

## Target State

### User Flow
1. User creates workspaces via existing flow (unchanged)
2. User sets an "active workspace" via sidebar selector
3. User searches for programs
4. User clicks single "Add to workspace" button:
   - If active workspace set → shows preview dropdown with add action
   - If no active workspace → opens selector modal

### Four States for Add Button

| # | Condition | Button Label | Dropdown/Modal Content |
|---|-----------|--------------|------------------------|
| 1 | Active workspace + programs selected | "Ajouter à [Name]" | Preview: "12 sélectionnées • 8 déjà présentes • 4 ajoutées" + [Ajouter] button |
| 2 | Active workspace + no selection + results ≤ 5000 | "Ajouter à [Name]" | Warning + preview counts + ☑️ required confirmation + [Ajouter tout] |
| 3 | Active workspace + no selection + results > 5000 | "Ajouter à [Name]" | Error: "Affiner la recherche ou sélectionner des programmes" (no action) |
| 4 | No active workspace | "Définir un espace actif" | Opens workspace selector modal |

---

## Implementation Phases

### Phase 1: Backend - Preview Endpoint

**File: `/api/routes/workspaces/index.ts`**

Create new endpoint:
```
POST /workspaces/:id/programs/preview
```

**Request body (two modes):**
```typescript
// Mode 1: From selection
{ programIds: string[] }

// Mode 2: From search
{ searchParams: { q?: string, cycle?: string[], ... } }
```

**Response:**
```typescript
{
  toAdd: number,        // Programs that will be added (not already in workspace)
  alreadyPresent: number, // Programs already in workspace
  total: number         // Total programs in request
}
```

**Implementation:**
1. Get workspace's current program IDs
2. If `programIds` provided: compare directly
3. If `searchParams` provided: fetch all matching IDs from Elasticsearch (reuse `fetchAllProgramIds` from `/api/utils/programs-search.ts`)
4. Calculate intersection (already present) and difference (to add)
5. Return counts

**Schema to add in `/api/schemas/workspaces.ts`:**
```typescript
export const previewAddProgramsSchema = t.Object({
  programIds: t.Optional(t.Array(t.String())),
  searchParams: t.Optional(t.Omit(programsParamsSchema, ['page', 'pageSize', 'sort'])),
});

export const previewAddProgramsResponseSchema = t.Object({
  toAdd: t.Number(),
  alreadyPresent: t.Number(),
  total: t.Number(),
});
```

---

### Phase 2: Backend - Update Add Programs Endpoint

**File: `/api/routes/workspaces/index.ts`**

Update existing `POST /workspaces/:id/programs` to accept either:
- `{ programs: string[] }` (existing behavior)
- `{ searchParams: {...} }` (new: fetch IDs from search, then add)

**Updated schema in `/api/schemas/workspaces.ts`:**
```typescript
export const addProgramsSchema = t.Object({
  programs: t.Optional(t.Array(t.String())),
  searchParams: t.Optional(t.Omit(programsParamsSchema, ['page', 'pageSize', 'sort'])),
});
```

**Implementation changes:**
1. If `searchParams` provided, call `fetchAllProgramIds()` to get program IDs
2. Apply 5000 limit validation
3. Continue with existing add logic using resolved IDs

---

### Phase 3: Frontend - Active Workspace Context

**New file: `/app/contexts/ActiveWorkspaceContext.tsx`**

```typescript
interface ActiveWorkspaceContextType {
  activeWorkspace: ReadWorkspace | null;
  setActiveWorkspace: (workspace: ReadWorkspace) => void;
  clearActiveWorkspace: () => void;
  isLoading: boolean;
}
```

**Implementation:**
1. Create React Context
2. Store active workspace ID in `localStorage` (key: `datafresq:activeWorkspaceId`)
3. On mount, read ID from localStorage, fetch workspace details via existing query
4. Provide `setActiveWorkspace` (saves ID to localStorage, updates state)
5. Provide `clearActiveWorkspace` (removes from localStorage, clears state)
6. Handle case where stored workspace no longer exists (clear it)

**Hook: `useActiveWorkspace()`**
- Returns context value
- Throws if used outside provider

**Provider placement: `/app/routes/(app)/layout.tsx`**
- Wrap the app layout with `ActiveWorkspaceProvider`

---

### Phase 4: Frontend - Workspace Selector Modal

**Refactor: `/app/components/AddToWorkspace/index.tsx`**

Transform into a reusable workspace selector modal:

**New file structure:**
```
/app/components/WorkspaceSelector/
├── index.tsx           # Main modal component
├── WorkspaceList.tsx   # List of workspaces with search
├── styles.css          # Styles
└── useWorkspaceSelector.ts  # Hook for modal state
```

**Props:**
```typescript
interface WorkspaceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (workspace: ReadWorkspace) => void;
  title?: string;  // Default: "Sélectionner un espace de travail"
  description?: string;
}
```

**Features:**
- Search/filter workspaces by name
- Show both owned and shared workspaces
- Keyboard navigation (arrow keys, enter to select, escape to close)
- Focus trap for accessibility
- Aria labels and roles

**Accessibility improvements:**
- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` pointing to title
- Focus first focusable element on open
- Return focus to trigger on close
- Trap focus within modal
- Escape key closes modal

---

### Phase 5: Frontend - Sidebar Active Workspace Section

**File: `/app/components/layouts/AppLayout/Sidemenu/index.tsx`**

Add new section before "MES ESPACES":

```tsx
{/* Active Workspace Section */}
<div className="fr-px-1w fr-hidden fr-unhidden-md fr-mb-2w">
  <div className="fx-flex fx-items-center fx-gap-1w fr-pb-1w">
    <span className="fr-icon-pushpin-2-line" aria-hidden="true" />
    <span className="fr-text--md fr-mb-0 fr-text--heavy">ESPACE ACTIF</span>
  </div>
  <ActiveWorkspaceButton />
</div>
<hr className="fr-py-1v fr-my-1w fr-hidden fr-unhidden-md" />
```

**New component: `/app/components/layouts/AppLayout/Sidemenu/ActiveWorkspaceButton.tsx`**

```typescript
function ActiveWorkspaceButton() {
  const { activeWorkspace } = useActiveWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="...">
        {activeWorkspace ? (
          <>
            <span className="color-dot" style={{...}} />
            <span>{activeWorkspace.name}</span>
            <span className="fr-icon-arrow-down-s-line" />
          </>
        ) : (
          <span className="fr-text-mention--grey">Aucun</span>
        )}
      </button>
      
      <WorkspaceSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(ws) => {
          setActiveWorkspace(ws);
          setIsModalOpen(false);
        }}
        title="Définir l'espace actif"
      />
    </>
  );
}
```

**Styling:**
- Same visual style as workspace list items
- Dropdown arrow indicator
- Highlight when active workspace is set

---

### Phase 6: Frontend - API Hooks for Preview

**File: `/app/api/workspaces.ts`**

Add new functions and hooks:

```typescript
// API function
async function previewAddPrograms({
  workspaceId,
  programIds,
  searchParams,
}: {
  workspaceId: string;
  programIds?: string[];
  searchParams?: SearchParams;
}) {
  const { data, error } = await api.workspaces({ id: workspaceId })
    .programs.preview.post({ programIds, searchParams });
  if (error) throw new APIError(error);
  return data;
}

// Hook (not a mutation, just a query triggered manually)
export function usePreviewAddPrograms() {
  return useMutation({
    mutationFn: previewAddPrograms,
  });
}
```

Update existing `useAddPrograms` to handle `searchParams`:
```typescript
async function addPrograms({
  workspaceId,
  programs,
  searchParams,
}: {
  workspaceId: string;
  programs?: string[];
  searchParams?: SearchParams;
}) {
  const { data, error } = await api.workspaces({ id: workspaceId })
    .programs.post({ programs, searchParams });
  if (error) throw new APIError(error);
  return data;
}
```

---

### Phase 7: Frontend - Unified Add to Workspace Dropdown

**New file: `/app/components/AddToActiveWorkspace/index.tsx`**

**Props:**
```typescript
interface AddToActiveWorkspaceProps {
  selectedProgramIds: string[];
  searchParams: SearchParams;  // Current search filters
  totalSearchResults: number;
  onSuccess?: () => void;  // Called after successful add (to clear selection)
  disabled?: boolean;
}
```

**Component structure:**
```tsx
function AddToActiveWorkspace({...}) {
  const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  const preview = usePreviewAddPrograms();
  const addPrograms = useAddPrograms();
  
  const hasSelection = selectedProgramIds.length > 0;
  const exceedsLimit = !hasSelection && totalSearchResults > 5000;
  
  // Fetch preview when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && activeWorkspace) {
      preview.mutate({
        workspaceId: activeWorkspace.id,
        ...(hasSelection 
          ? { programIds: selectedProgramIds }
          : { searchParams }),
      });
    }
  }, [isDropdownOpen, activeWorkspace?.id, hasSelection]);
  
  // Reset confirmation when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen) setConfirmed(false);
  }, [isDropdownOpen]);
  
  // STATE 4: No active workspace
  if (!activeWorkspace) {
    return (
      <>
        <button onClick={() => setIsSelectorOpen(true)}>
          Définir un espace actif
        </button>
        <WorkspaceSelector
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onSelect={(ws) => {
            setActiveWorkspace(ws);
            setIsSelectorOpen(false);
          }}
        />
      </>
    );
  }
  
  // STATES 1-3: Has active workspace
  return (
    <Dropdown
      label={`Ajouter à ${truncate(activeWorkspace.name, 20)}`}
      icon="add-line"
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
    >
      <Dropdown.Header>
        {/* Preview info */}
        {preview.isPending && <Spinner />}
        {preview.data && (
          <PreviewInfo 
            data={preview.data}
            hasSelection={hasSelection}
            exceedsLimit={exceedsLimit}
          />
        )}
      </Dropdown.Header>
      
      {!exceedsLimit && (
        <Dropdown.Footer>
          {!hasSelection && (
            <Checkbox
              checked={confirmed}
              onChange={setConfirmed}
              label="Je confirme vouloir ajouter tous les résultats"
            />
          )}
          <button
            disabled={!hasSelection && !confirmed}
            onClick={handleAdd}
          >
            {hasSelection 
              ? `Ajouter ${preview.data?.toAdd ?? '...'} formations`
              : `Ajouter tous les résultats`
            }
          </button>
        </Dropdown.Footer>
      )}
    </Dropdown>
  );
}
```

**Sub-component: PreviewInfo**
```tsx
function PreviewInfo({ data, hasSelection, exceedsLimit }) {
  if (exceedsLimit) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>Cette recherche contient trop de résultats.</p>
        <p>Affinez la recherche ou sélectionnez des programmes.</p>
      </div>
    );
  }
  
  return (
    <div>
      {!hasSelection && data.total > 1000 && (
        <div className="fr-alert fr-alert--warning fr-alert--sm">
          Attention : ajout volumineux
        </div>
      )}
      <p>
        <strong>{data.total}</strong> {hasSelection ? 'sélectionnées' : 'résultats'}
      </p>
      <p>
        <span className="fr-text-mention--grey">{data.alreadyPresent} déjà présentes</span>
        {' • '}
        <strong>{data.toAdd} seront ajoutées</strong>
      </p>
    </div>
  );
}
```

---

### Phase 8: Frontend - Integration in Search Page

**File: `/app/routes/(app)/formations/index/components/ProgramTable/index.tsx`**

**Changes:**
1. Remove `AddToWorkspace` import
2. Remove `CreateWorkspaceFromSearchModal` import
3. Add `AddToActiveWorkspace` import
4. Replace both components with single `AddToActiveWorkspace`:

```tsx
// Before (remove):
<Activity mode={selectedPrograms.length ? 'visible' : 'hidden'}>
  <AddToWorkspace formationIds={selectedPrograms} onSuccess={() => onSelectionChange([])} />
</Activity>
// ...
<CreateWorkspaceFromSearchModal ... />

// After (add):
<AddToActiveWorkspace
  selectedProgramIds={selectedPrograms}
  searchParams={{ q: params.q, ...currentFilters }}
  totalSearchResults={totalCount}
  onSuccess={() => onSelectionChange([])}
  disabled={isFetching}
/>
```

---

### Phase 9: Cleanup

**Files to delete:**
- `/app/components/AddToWorkspace/index.tsx`
- `/app/components/AddToWorkspace/styles.css`
- `/app/routes/(app)/formations/index/components/CreateWorkspaceFromSearchModal.tsx`

**Files to update:**
- Remove unused imports from any files that imported the deleted components

---

## File Summary

### New Files
| Path | Description |
|------|-------------|
| `/app/contexts/ActiveWorkspaceContext.tsx` | Active workspace context + provider |
| `/app/components/WorkspaceSelector/index.tsx` | Reusable workspace picker modal |
| `/app/components/WorkspaceSelector/WorkspaceList.tsx` | List with search |
| `/app/components/WorkspaceSelector/styles.css` | Styles |
| `/app/components/AddToActiveWorkspace/index.tsx` | Unified add button/dropdown |
| `/app/components/layouts/AppLayout/Sidemenu/ActiveWorkspaceButton.tsx` | Sidebar button |

### Modified Files
| Path | Changes |
|------|---------|
| `/api/schemas/workspaces.ts` | Add preview schemas, update addProgramsSchema |
| `/api/routes/workspaces/index.ts` | Add preview endpoint, update add programs endpoint |
| `/app/api/workspaces.ts` | Add preview hook, update add programs function |
| `/app/components/layouts/AppLayout/Sidemenu/index.tsx` | Add active workspace section |
| `/app/routes/(app)/layout.tsx` | Wrap with ActiveWorkspaceProvider |
| `/app/routes/(app)/formations/index/components/ProgramTable/index.tsx` | Replace old components with new |

### Deleted Files
| Path |
|------|
| `/app/components/AddToWorkspace/index.tsx` |
| `/app/components/AddToWorkspace/styles.css` |
| `/app/routes/(app)/formations/index/components/CreateWorkspaceFromSearchModal.tsx` |

---

## Accessibility Checklist

### WorkspaceSelector Modal
- [ ] `role="dialog"` with `aria-modal="true"`
- [ ] `aria-labelledby` pointing to modal title
- [ ] Focus trap (tab cycles within modal)
- [ ] First focusable element receives focus on open
- [ ] Escape key closes modal
- [ ] Focus returns to trigger button on close
- [ ] Search input has proper label
- [ ] Workspace list uses `role="listbox"` with `role="option"` items
- [ ] Arrow key navigation in list
- [ ] Enter key selects focused item

### AddToActiveWorkspace Dropdown
- [ ] Button has `aria-haspopup="true"` and `aria-expanded`
- [ ] Dropdown has `role="menu"` or appropriate role
- [ ] Checkbox has associated label
- [ ] Loading state announced to screen readers (`aria-busy`)
- [ ] Error messages have `role="alert"`

### Sidebar Button
- [ ] Clear accessible name when no workspace selected
- [ ] Indicates current state (active workspace name or "Aucun")

---

## Testing Scenarios

1. **No workspaces exist** → Sidebar shows "Aucun", button opens empty selector
2. **Set active workspace** → Sidebar updates, button label changes
3. **Add selected programs** → Preview shows counts, add succeeds
4. **Add all results (< 5000)** → Warning shown, confirmation required, add succeeds
5. **Add all results (> 5000)** → Error shown, no action possible
6. **Clear active workspace** → Button reverts to "Définir un espace actif"
7. **Active workspace deleted** → Should clear from context gracefully
8. **Shared workspace as active** → Should work the same as owned

---

## Migration Notes

- Existing `POST /workspaces/from-search` endpoint can remain for backwards compatibility or be removed
- localStorage key should be namespaced: `datafresq:activeWorkspaceId`
- Consider clearing active workspace if user logs out

---

## Related Files for Context

When implementing, these existing files will be helpful for reference:

- `/app/components/AddToWorkspace/index.tsx` - Current modal design pattern
- `/app/components/Modal/index.tsx` and `/app/components/Modal/useModal.tsx` - DSFR modal utilities
- `/app/components/ui/Dropdown/` - Dropdown component structure
- `/api/utils/programs-search.ts` - `fetchAllProgramIds` function for search-based operations
- `/api/routes/workspaces/index.ts` - Existing workspace routes structure
- `/app/api/workspaces.ts` - Existing workspace API hooks

---

This plan can be executed in a new session. Each phase is self-contained and can be committed separately.