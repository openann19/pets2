# Zero Errors Implementation Plan - PawfectMatch Web App

**Goal**: Achieve 0 TypeScript errors and 0 ESLint errors in `apps/web`

**Status**: Ready for systematic execution

---

## 🔴 CRITICAL PRIORITY (Execute First)

### 1. SecurityAlertsDashboard.tsx Complete Refactor
**File**: `apps/web/components/admin/SecurityAlertsDashboard.tsx`

#### Changes Required:

**A. Convert to Typed Arrow Component**
```typescript
// BEFORE (line 171):
export default function SecurityAlertsDashboard({...}: SecurityAlertsDashboardProps) {

// AFTER:
const SecurityAlertsDashboard: React.FC<SecurityAlertsDashboardProps> = ({
  alerts,
  isLoading = false,
  onAcknowledgeAlert,
  onResolveAlert,
  onUpdateAlert,
  onDeleteAlert,
  onExportAlerts,
  onRefresh,
}): React.ReactElement => {
  // ... component body
};

export default SecurityAlertsDashboard;
```

**B. Remove/Underscore Unused Props & State** (lines 176-200)
```typescript
// Remove these unused props from destructuring:
// - onEscalateAlert (not used)
// - onAssignAlert (not used)
// - onViewAlert (not used)

// Fix state declarations:
const [currentPage] = useState(1); // Remove setCurrentPage (unused)
const [itemsPerPage] = useState(10); // Remove setItemsPerPage (unused)
// Remove: selectedAlerts, setSelectedAlerts (line 195)
// Remove: autoRefresh setter (line 198)
// Remove: selectedAlert, setSelectedAlert (line 199)
// Remove: showAlertModal, setShowAlertModal (line 200)
```

**C. Fix Switch Case Lexical Declarations** (lines 232-253)
```typescript
// BEFORE:
switch (sortBy) {
  case 'severity':
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    // ...

// AFTER (declare BEFORE switch):
const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };

switch (sortBy) {
  case 'severity':
    aValue = severityOrder[a.severity];
    bValue = severityOrder[b.severity];
    break;
  case 'priority':
    aValue = priorityOrder[a.priority];
    bValue = priorityOrder[b.priority];
    break;
```

**D. Add Explicit Return Types for Helpers**
```typescript
// Line 309:
const formatTimeAgo = (date: string): string => {

// Line 323:
const getRiskScoreColor = (score: number): string => {

// Line 330 (AlertCard):
const AlertCard = ({ alert }: { alert: SecurityAlert }): React.ReactElement => (

// Line 465 (AlertListItem):
const AlertListItem = ({ alert }: { alert: SecurityAlert }): React.ReactElement => (
```

**E. Flatten Nested Ternaries** (lines 334-342, 469-477)
```typescript
// BEFORE:
className={`... ${
  alert.severity === 'critical'
    ? 'border-l-red-500'
    : alert.severity === 'high'
      ? 'border-l-orange-500'
      : alert.severity === 'medium'
        ? 'border-l-yellow-500'
        : 'border-l-green-500'
}`}

// AFTER:
const getBorderColor = (severity: SecurityAlert['severity']): string => {
  if (severity === 'critical') return 'border-l-red-500';
  if (severity === 'high') return 'border-l-orange-500';
  if (severity === 'medium') return 'border-l-yellow-500';
  return 'border-l-green-500';
};

className={`... ${getBorderColor(alert.severity)}`}
```

**F. Self-Close Empty Skeleton Elements** (lines 567-580)
```typescript
// BEFORE:
<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>

// AFTER:
<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
```

**G. Add htmlFor/id Pairs for Labels** (lines 765, 786, 807, 829, 850)
```typescript
// BEFORE:
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
  Type
</label>
<select value={selectedType} ...>

// AFTER:
<label htmlFor="alertType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
  Type
</label>
<select id="alertType" value={selectedType} ...>
```

Apply to all 5 filter selects: Type, Severity, Status, Priority, Sort By.

**H. Fix Nullish Checks** (lines 204, 291, 379, 382, 410)
```typescript
// Line 204:
if (autoRefresh && onRefresh !== undefined) {

// Line 291:
.filter((a) => a.resolvedAt !== undefined)

// Line 379:
{alert.assignedTo !== undefined && <span>Assigned to: {alert.assignedTo.name}</span>}

// Line 382:
{alert.isAcknowledged === true && <CheckCircleIcon className="h-4 w-4 text-green-500" />}

// Line 410:
{alert.source.location !== undefined && alert.source.location.trim() !== '' && (
  <span className="text-sm text-gray-600 dark:text-gray-400">
    • {alert.source.location}
  </span>
)}
```

**I. Replace Array Spreads** (lines 562, 574)
```typescript
// BEFORE:
{[...Array(4)].map((_, i) => (

// AFTER:
{Array.from({ length: 4 }).map((_, i) => (
```

**J. Fix Boolean Conditional** (line 756)
```typescript
// BEFORE:
{showFilters && (

// AFTER:
{Boolean(showFilters) && (
```

**K. Fix Empty String Check** (line 940)
```typescript
// BEFORE:
{searchTerm || selectedType !== 'all' || ...

// AFTER:
{searchTerm.trim() !== '' || selectedType !== 'all' || ...
```

---

### 2. imageOptimization.tsx Critical Fixes
**File**: `apps/web/src/utils/imageOptimization.tsx`

#### Changes Required:

**A. Guard Undefined Key Deletion** (around line 58)
```typescript
// BEFORE:
const firstKey = this.keys().next().value;
this.delete(firstKey);

// AFTER:
const firstKey = this.keys().next().value;
if (firstKey !== undefined) {
  this.delete(firstKey);
}
```

**B. Fix Format Type** (line 195)
```typescript
// Define strict type at top of file:
type ImageFormat = 'webp' | 'jpeg' | 'png' | 'avif';

// Update interface:
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  // ...
}

// Fix line 195:
.map((width) => {
  const opts: ImageOptimizationOptions = { width };
  if (format !== undefined) {
    opts.format = format;
  }
  return `${this.generateOptimizedUrl(baseUrl, opts)} ${width}w`;
})
```

**C. Remove Duplicate useLazyImage Export** (lines 201, 406)
```typescript
// Keep ONLY the function definition (line 201)
// Remove the duplicate export at line 406

// At end of file (line 406):
export { ImageCacheManager, ImageOptimizer };
// Remove useLazyImage from this line
```

**D. Add Explicit Return Types**
```typescript
// Line 201:
export function useLazyImage(
  src: string,
  options: ImageOptimizationOptions = {}
): { src: string; isLoaded: boolean; error: Error | null } {

// Line 224 (IntersectionObserver callback):
const entry = entries[0];
if (entry !== undefined && entry.isIntersecting) {
  // ...
}
```

**E. Replace <img> with next/image or Add Disable**
```typescript
// Lines 339, 393:
// Option 1 - Replace with next/image:
import Image from 'next/image';
<Image src={src} alt={alt} width={width} height={height} />

// Option 2 - Add justified disable:
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={src} alt={alt} />
{/* Using raw img for dynamic optimization demo */}
```

---

### 3. Fix useAuth.test.tsx
**File**: `apps/web/src/hooks/useAuth.test.tsx`

```typescript
// Add import at top:
import { AuthProvider } from '@/contexts/AuthContext';
// or wherever AuthProvider is defined

// Wrap test renders (line 52):
// BEFORE:
render(<TestComponent />);

// AFTER:
render(
  <AuthProvider>
    <TestComponent />
  </AuthProvider>
);
```

---

## 🟡 HIGH PRIORITY

### 4. Audit Heroicons v2 in Admin Pages

**Files to Check**:
- `apps/web/app/(admin)/billing/page.tsx`
- `apps/web/app/(admin)/dashboard/page.tsx`
- `apps/web/app/(admin)/ai-service/page.tsx`

**Action**: Search for deprecated icon names and replace:
- `DownloadIcon` → `ArrowDownTrayIcon`
- `RefreshIcon` → `ArrowPathIcon`
- Remove any unused icon imports

**Command**:
```bash
grep -r "DownloadIcon\|RefreshIcon" apps/web/app/\(admin\)/ --include="*.tsx"
```

---

### 5. Verify ReportsManagement.tsx
**File**: `apps/web/components/admin/ReportsManagement.tsx`

**Action**: Run type-check and lint on this file specifically:
```bash
pnpm -C apps/web exec eslint components/admin/ReportsManagement.tsx
pnpm -C apps/web exec tsc --noEmit components/admin/ReportsManagement.tsx
```

Expected: 0 errors (already cleaned in previous session)

---

## 🟢 MEDIUM PRIORITY

### 6. React Hooks Dependencies Cleanup

**Files**:
- `apps/web/src/hooks/useEnhancedSocket.ts` (lines 203, 213, 357, 378)
- `apps/web/src/hooks/useNeuralNetwork.ts` (lines 114, 129)
- `apps/web/src/hooks/useOffline.ts` (lines 54, 110)
- `apps/web/src/hooks/usePredictiveTyping.ts` (line 89)

**Pattern**:
```typescript
// Option 1 - Add missing deps:
useCallback(() => {
  // ...
}, [missingDep1, missingDep2]);

// Option 2 - Use useRef for stable references:
const stableRef = useRef(expensiveFunction);
useEffect(() => {
  stableRef.current();
}, []);

// Option 3 - Add justified disable:
useEffect(() => {
  // ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Intentionally empty - only run on mount
```

---

### 7. Unused Variables Sweep

**Files** (examples):
- `apps/web/src/hooks/useAccessibility.ts` (line 121: `priority`)
- `apps/web/src/hooks/useAdminPermissions.tsx` (line 137: `action`)
- `apps/web/src/hooks/useOptimizedChat.ts` (line 97: `error`)

**Pattern**:
```typescript
// BEFORE:
const [data, error] = useState();

// AFTER (if error unused):
const [data] = useState();
// or
const [data, _error] = useState();
```

---

### 8. A11y Labels Sweep

**Command to find unlabeled inputs**:
```bash
grep -rn "<select" apps/web/src/components/ --include="*.tsx" | grep -v "htmlFor"
grep -rn "<input" apps/web/src/components/ --include="*.tsx" | grep -v "htmlFor"
```

**Fix Pattern**:
```typescript
<label htmlFor="uniqueId">Label Text</label>
<input id="uniqueId" ... />
```

---

## 🔵 LOW PRIORITY (Polish)

### 9. Nested Ternaries Cleanup

**Search Command**:
```bash
grep -rn "? .*:" apps/web/components/admin/ --include="*.tsx" | grep "?"
```

**Pattern**: Replace with helper functions or if-else chains

---

### 10. Replace || with ??

**Search Command**:
```bash
grep -rn " || " apps/web/components/admin/ --include="*.tsx"
```

**Pattern**:
```typescript
// BEFORE:
const value = prop || 'default';

// AFTER (if prop can be empty string/0/false):
const value = prop ?? 'default';
```

---

## ✅ VERIFICATION STEPS

### Step 1: Run Targeted ESLint Autofix
```bash
cd /Users/elvira/Downloads/pets-pr-1
pnpm -C apps/web exec eslint --ext .ts,.tsx components/admin src/components/admin src/utils --fix
```

### Step 2: Run Full Type-Check
```bash
pnpm -C apps/web run type-check
```

**Expected**: 0 errors

### Step 3: Run Full Lint Check
```bash
pnpm -C apps/web run lint:check
```

**Expected**: 0 errors

---

## 📋 EXECUTION CHECKLIST

- [ ] 1. SecurityAlertsDashboard.tsx - All 11 sub-tasks (A-K)
- [ ] 2. imageOptimization.tsx - All 5 sub-tasks (A-E)
- [ ] 3. useAuth.test.tsx - AuthProvider import/wrap
- [ ] 4. Heroicons v2 audit in 3 admin pages
- [ ] 5. Verify ReportsManagement.tsx clean
- [ ] 6. React hooks dependencies (4 files)
- [ ] 7. Unused variables sweep
- [ ] 8. A11y labels sweep
- [ ] 9. Nested ternaries cleanup
- [ ] 10. Replace || with ??
- [ ] ✅ Run ESLint autofix
- [ ] ✅ Run type-check (verify 0 errors)
- [ ] ✅ Run lint:check (verify 0 errors)

---

## 🎯 SUCCESS CRITERIA

1. **TypeScript**: `pnpm -C apps/web run type-check` returns exit code 0
2. **ESLint**: `pnpm -C apps/web run lint:check` returns exit code 0
3. **Build**: `pnpm -C apps/web run build` completes successfully
4. **Tests**: `pnpm -C apps/web run test` passes

---

## 📝 NOTES

- All line numbers reference current file state
- Execute tasks in order (Critical → High → Medium → Low)
- Run verification after each critical task
- If type-check still shows errors after all tasks, triage top 10 offenders and create follow-up plan

**Estimated Time**: 3-4 hours for systematic execution
**Priority**: Execute Critical tasks first, then verify before proceeding
