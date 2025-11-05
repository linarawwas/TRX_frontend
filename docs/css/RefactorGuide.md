# CSS Refactoring Guide

This document outlines the rules and patterns used during the CSS refactoring process to ensure clean, DRY, and consistent stylesheets while preserving the rendered appearance.

## Objectives (in order)

1. **Unify rules per selector**: A selector (e.g., `.button`) should have one block per media/support scope.
2. **Remove overridden declarations**: If the same property on the same selector & scope is set multiple times, keep only the last effective one (the stronger one), unless earlier ones serve as intentional fallbacks.
3. **Merge duplicate blocks**: Merge identical declaration blocks across duplicate selectors within the same scope, keeping a single consolidated block.
4. **Group identical declarations**: If multiple selectors share the exact same declaration set, group them with comma selectors without changing cascade meaning.
5. **Normalize values**: Prefer one canonical form (e.g., `#000` vs `black`), but only when it does not affect rendering.
6. **Preserve RTL behavior**: Do not convert or swap logical vs. physical properties; keep what the project uses.
7. **Keep output identical**: No visual or behavioral changes. All changes are structural/organizational.

## Hard Constraints

- No new tools (no PostCSS installs, no Stylelint config changes).
- No DOM/class renames and no CSS Modules conversion.
- Do not remove vendor-prefixed properties that are intentionally used for backward compatibility until proven redundant in the current support policy.
- Do not change selector specificity or order in ways that alter behavior.
- Do not delete rules that act as fallbacks or progressive enhancement.

## "Dirty CSS" Patterns Fixed

### 1. Duplicate Selector Blocks
**Pattern**: Same selector appears multiple times in the same scope (`@media`, `@supports`, or global).

**Fix**: Merge into one block, preserving the last effective value for each property.

**Example**:
```css
/* Before */
.button { background: red; }
.card { padding: 12px; }
.button { background: black; }

/* After */
.card { padding: 12px; }
.button { background: black; }
```

### 2. Overwritten Declarations (Same Selector & Scope)
**Pattern**: `.btn { background:red; }` ... later `.btn { background:black; }`

**Fix**: Keep only `background:black;` unless the earlier one is a fallback.

### 3. Conflicting Shorthands vs Longhands
**Pattern**: `.box { margin: 10px; margin-top: 4px; }`

**Fix**: Collapse to a single consistent set; ensure final values match the computed outcome. Last-win applies.

### 4. Property Duplicates in the Same Block
**Pattern**: `.el { color: #000; color: black; }`

**Fix**: Keep the effective one; prefer a canonical form.

### 5. Same Declarations Across Multiple Selectors
**Pattern**: `.card, .tile { padding: 12px; border-radius: 8px; }` but scattered duplicates elsewhere.

**Fix**: Group selectors in one block if and only if grouping doesn't change cascade. If order matters (later blocks override earlier), do not group.

### 6. Unnecessary !important
**Pattern**: `!important` where specificity/ordering already guarantees win.

**Fix**: Remove only if provably redundant with the existing cascade. Otherwise keep.

### 7. Redundant Vendor-Prefixed Duplicates
**Pattern**: `-webkit-`, `-moz-` alongside standard.

**Fix**: Keep standard + any prefix still needed. If a prefix is provably obsolete for supported browsers, remove. When unsure, keep.

### 8. Dead Duplicates Across Media Queries
**Pattern**: Same selector and property defined identically in overlapping media queries where one never applies given the other.

**Fix**: Only remove if provably unreachable. Otherwise keep.

### 9. Order-Dependent Pseudo-Class Issues
**Pattern**: Anchor states out of order (`:hover` before `:link`/`:visited`).

**Fix**: Maintain LVHA order (`:link`, `:visited`, `:hover`, `:active`) only if reordering doesn't change current behavior.

### 10. Redundant Resets & Normalizations
**Pattern**: Multiple resets repeated in many files.

**Fix**: Keep a single instance at the global stylesheet. Do not alter its content; remove duplicates elsewhere.

### 11. Mixed Logical/Physical Properties
**Pattern**: `margin-left` along with `margin-inline-start` for RTL.

**Fix**: Do not convert; if both exist intentionally, keep both. If one is truly overwritten by the other in the same scope, keep the effective one.

### 12. Keyframes & Animation Name Duplication
**Pattern**: Same `@keyframes` defined twice.

**Fix**: Keep one canonical definition with the desired frames.

### 13. Font-Face Duplication
**Pattern**: Identical `@font-face` repeated.

**Fix**: Keep one definition per font variant; remove duplicates.

### 14. Color & Unit Inconsistencies
**Pattern**: Same color written as `#000`, `black`, `rgb(0,0,0)`.

**Fix**: Normalize to a single project-preferred form (e.g., hex) only if no transparency/perceptual differences.

### 15. Zero Units & Unnecessary Defaults
**Pattern**: `margin: 0px;` → `margin: 0;`

**Fix**: Safe normalization where it doesn't change behavior.

### 16. Commented-Out Legacy Blocks
**Pattern**: Large commented sections of dead CSS.

**Fix**: Remove only if they are clearly obsolete (e.g., "old version" notes). Otherwise, keep.

### 17. Duplicate File-Level Imports
**Pattern**: Same `@import` repeated.

**Fix**: Keep a single one at the top, respecting order.

### 18. Whitespace and Ordering Noise
**Pattern**: Inconsistent property order.

**Fix**: Keep the project's existing style (alphabetical or logical grouping). If none, use groupings: Layout → Box → Typography → Visual → Misc → State (but avoid massive reorders that could affect cascade).

## Safe Fallbacks (Never Delete Blindly)

These patterns should be preserved as they serve intentional fallback purposes:

1. **Multiple background declarations** for gradients + solid fallback:
   ```css
   .grad {
     background: #123;                 /* fallback */
     background: linear-gradient(...); /* modern */
   }
   ```

2. **Multiple font-family values** (fallback stack):
   ```css
   font-family: "Tajawal", system-ui, -apple-system, sans-serif;
   ```

3. **Vendor-prefixed + standard forms** where needed:
   ```css
   -webkit-print-color-adjust: exact;
   print-color-adjust: exact;
   ```

4. **Legacy property then modern equivalent** (e.g., `filter`, `backdrop-filter`).

5. **Directional/RTL overrides** where one intentionally overrides the other depending on `dir`.

6. **High-DPI or specific media query overrides**.

## Step-by-Step Refactor Recipe (Per File)

### 1. Scope Mapping
Build a mental map of scopes: global, each `@media` block, each `@supports` block. Within each scope, treat the cascade independently.

### 2. Unify Duplicate Selectors
For each selector in a scope, gather all its declarations in source order. Remove overridden duplicates (keep the last unless it's a fallback case). Collapse shorthands/longhands so the final declaration set reproduces the same computed values.

### 3. Group Identical Blocks (Conservative)
If two or more selectors have identical final declaration sets in the same scope, group them into a comma-separated selector block at the position of the last of those blocks (to preserve cascade). If grouping could change cascade/override order, do not group.

### 4. Normalize Values
Consistent colors/zeros/units. Do not touch values that could affect rendering (e.g., `rgba(0,0,0,0.6)` vs `#0009`).

### 5. Vendor Prefixes
Keep standard + any needed vendor prefixes. Remove only clearly obsolete ones (if repo target browsers are explicit; else keep).

### 6. A11y/RTL Checks
Ensure logical vs physical properties are left intact where intended. Keep any `:focus`, `:focus-visible` styling.

### 7. Re-run Quick Diff & Sanity
Confirm no selector disappeared; no property that affects layout/visuals was removed inadvertently. Keep the order of overriding rules intact.

## Project-Wide Follow-Ups (Optional but Safe)

1. If there's a global reset (e.g., `normalize.css` or custom reset), keep only one import.
2. If there are obvious utility classes repeated (e.g., `.mt-8 { margin-top: 8px; }` in multiple files), consolidate into a single utilities file only if the project already uses utilities. Otherwise, keep local.

## Examples from This Repository

### Example 1: Duplicate Selectors in UpdateOrder.css
**Before**:
```css
.uo-actions {
  display: inline-flex;
  gap: 6px;
}
/* ... later in file ... */
.uo-actions {
  display: inline-flex;
  gap: 6px;
}
```

**After**: Removed duplicate, kept single definition.

### Example 2: Merged Media Queries
**Before**:
```css
@media print {
  .uo-header { display: none !important; }
}
/* ... later ... */
@media print {
  .uo-fab { display: none !important; }
}
```

**After**: Merged into single `@media print` block with all selectors.

### Example 3: Normalized Values
**Before**:
```css
box-shadow: 0px 2px 8px rgba(8, 35, 56, 0.08);
```

**After**:
```css
box-shadow: 0 2px 8px rgba(8, 35, 56, 0.08);
```

### Example 4: Spacing Normalization
**Before**:
```css
padding:10px;
margin-left:0;
```

**After**:
```css
padding: 10px;
margin-left: 0;
```

## Known Exceptions

Where we kept duplicates for a reason:

1. **UpdateCustomer.css**: Multiple `.ucx-formCard` definitions were consolidated, but the final effective version (with `justify-content: center`) was preserved.

2. **FinanceDashboard.css**: `.finx-form` has two different definitions (one with `width: 90%`, another with `width: 100%` and `max-width: 860px`). These serve different contexts and were kept separate.

3. **Global resets**: Both `index.css` and `global.css` contain `* { margin: 0; padding: 0; }`. Since `global.css` is not imported anywhere, it's considered unused, but we kept it to avoid breaking potential future imports.

## How to Check Scopes and Cascade

1. **Identify all scopes**: Scan the file for `@media`, `@supports`, and `@keyframes` blocks.
2. **Within each scope**: Treat it as a separate cascade context.
3. **Source order matters**: Later rules override earlier ones in the same specificity.
4. **Grouping safety**: Only group selectors if they appear in the same scope and have identical declarations, and grouping won't change which rules override which.

## Testing Checklist

After refactoring, verify:

- [ ] Each selector appears once per scope (global, per media/support).
- [ ] No overridden declarations remain in the same scope unless intentional fallback.
- [ ] No visual changes (computed values pre/post match).
- [ ] No vendor prefixes or fallbacks removed without certainty.
- [ ] Logical/physical/RTL behavior preserved.
- [ ] No class names or DOM assumptions changed.

