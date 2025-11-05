# Refactored Components Documentation

## Overview
This document describes the refactoring of components in the `src/components` directory to follow presentational-first patterns, type safety, accessibility, and i18n compliance.

## Refactoring Principles Applied

### Presentational-First
- Components accept data and callbacks via props
- No direct API calls (moved to hooks)
- Redux only where explicitly needed (form components use hooks internally)
- No hardcoded strings (accept via props or use i18n)

### Type Safety
- All `any` types removed
- Strict Props interfaces with optionality
- ForwardRef support where needed

### Accessibility
- Proper ARIA attributes
- Keyboard navigation support
- `type="button"` on non-submit buttons
- Labels and roles where appropriate

### i18n/RTL Safe
- All user-facing strings via props
- No inline Arabic literals
- RTL-safe semantic markup

## Refactored Components

### 1. ErrorBoundary (`src/components/ErrorBoundary.tsx`)

**Purpose**: Catch and display React errors gracefully.

**Props**:
```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  errorTitle?: ReactNode;
  errorMessage?: ReactNode;
  errorDetailsLabel?: ReactNode;
}
```

**Changes**:
- Removed hardcoded Arabic strings
- Accept error messages via props
- Added `role="alert"` for error display

**Usage**:
```tsx
<ErrorBoundary
  errorTitle={t("error.title")}
  errorMessage={t("error.message")}
  errorDetailsLabel={t("error.details")}
>
  <App />
</ErrorBoundary>
```

---

### 2. RingCard (`src/components/dashboard/RingCard.tsx`)

**Purpose**: Display progress ring with metadata (carrying, delivered, returned).

**Props**:
```typescript
interface RingCardProps {
  value: number;
  total: number;
  label: string;
  delivered: number;
  carrying: number;
  returned: number;
  labels?: {
    carrying?: string;
    delivered?: string;
    returned?: string;
  };
}
```

**Changes**:
- Removed hardcoded Arabic strings
- Accept labels via optional `labels` prop
- Defaults preserved for backward compatibility

**Usage**:
```tsx
<RingCard
  value={delivered}
  total={target}
  label={t("dashboard.progress")}
  delivered={delivered}
  carrying={carrying}
  returned={returned}
  labels={{
    carrying: t("dashboard.carrying"),
    delivered: t("dashboard.delivered"),
    returned: t("dashboard.returned"),
  }}
/>
```

---

### 3. NumberInput (`src/components/UI reusables/NumberInput/NumberInput.tsx`)

**Purpose**: Accessible number input with label.

**Props**:
```typescript
interface NumberInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

**Changes**:
- Added `forwardRef` for focus control
- Added `id` and `htmlFor` connection
- Added ARIA attributes
- All props typed (no `any`)

**Usage**:
```tsx
<NumberInput
  label={t("form.quantity")}
  name="quantity"
  value={quantity}
  onChange={handleChange}
  min={0}
  required
/>
```

---

### 4. SelectInput (`src/components/UI reusables/SelectInput/SelectInput.tsx`)

**Purpose**: Accessible select dropdown with label.

**Props**:
```typescript
interface SelectInputProps {
  label: string;
  name: string;
  value: string | number | boolean;
  options: SelectOption[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface SelectOption {
  value: string | number | boolean;
  label: string;
}
```

**Changes**:
- Removed `any` type from value
- Added `forwardRef` for focus control
- Added `id` and `htmlFor` connection
- Added ARIA attributes
- Typed options array

**Usage**:
```tsx
<SelectInput
  label={t("form.currency")}
  name="currency"
  value={currency}
  options={[
    { value: "USD", label: t("currency.usd") },
    { value: "LBP", label: t("currency.lbp") },
  ]}
  onChange={handleChange}
/>
```

---

### 5. SpinLoader (`src/components/UI reusables/SpinLoader/SpinLoader.tsx`)

**Purpose**: Loading spinner indicator.

**Props**:
```typescript
interface SpinLoaderProps {
  className?: string;
  'aria-label'?: string;
}
```

**Changes**:
- Converted from JSX to TSX
- Added `role="status"` and `aria-live="polite"`
- Added `aria-label` prop
- Added screen reader text

**Usage**:
```tsx
<SpinLoader aria-label={t("common.loading")} />
```

---

### 6. AddExpenses (`src/components/Expenses/AddExpenses/AddExpenses.tsx`)

**Purpose**: Form component for adding expenses.

**Props**:
```typescript
interface AddExpensesProps {
  config: AddExpensesConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AddExpensesConfig {
  modelName: string;
  title: string;
  buttonLabel: string;
  fields: {
    name: { label: string; "input-type": string };
    value: { label: string; "input-type": string };
    paymentCurrency: {
      label: string;
      "input-type": string;
      options: Array<{ value: string; label: string }>;
    };
  };
}
```

**Changes**:
- Removed direct API calls (moved to `useAddExpense` hook)
- Removed Redux selectors (moved to hook)
- Removed hardcoded Arabic strings
- Accept config via props
- Uses `useAddExpense` hook internally

**Usage**:
```tsx
<AddExpenses
  config={{
    modelName: t("expenses.title"),
    title: t("expenses.add.title"),
    buttonLabel: t("expenses.add.buttonLabel"),
    fields: {
      name: { label: t("expenses.fields.name"), "input-type": "text" },
      value: { label: t("expenses.fields.value"), "input-type": "number" },
      paymentCurrency: {
        label: t("expenses.fields.paymentCurrency"),
        "input-type": "selectOption",
        options: [
          { value: "USD", label: t("expenses.currency.usd") },
          { value: "LBP", label: t("expenses.currency.lbp") },
        ],
      },
    },
  }}
  onSuccess={() => refetch()}
/>
```

**Related Hook**: `src/features/finance/hooks/useAddExpense.ts`

---

### 7. AddProfits (`src/components/Profits/AddProfits/AddProfits.tsx`)

**Purpose**: Form component for adding extra profits.

**Props**: Same structure as `AddExpenses`, with `AddProfitsConfig` and `AddProfitsProps`.

**Changes**: Same pattern as `AddExpenses`.

**Usage**: Similar to `AddExpenses`, using `profits.*` i18n keys.

**Related Hook**: `src/features/finance/hooks/useAddProfit.ts`

---

### 8. AddProducts (`src/components/Products/AddProducts.tsx`)

**Purpose**: Form component for adding products.

**Props**:
```typescript
interface AddProductsProps {
  config: AddProductsConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AddProductsConfig {
  modelName: string;
  title: string;
  buttonLabel: string;
  fields: {
    type: { label: string; "input-type": string };
    priceInDollars: { label: string; "input-type": string };
    isReturnable: {
      label: string;
      "input-type": string;
      options: Array<{ value: boolean; label: string }>;
    };
  };
}
```

**Changes**: Same pattern as `AddExpenses`/`AddProfits`.

**Usage**: Similar pattern, using `products.*` i18n keys.

**Related Hook**: `src/features/products/hooks/useAddProduct.ts`

---

## Hooks Created

### useAddExpense (`src/features/finance/hooks/useAddExpense.ts`)

**Purpose**: Handle expense creation logic (API, Redux, validation).

**Returns**:
```typescript
{
  submit: (formData: ExpenseFormData) => Promise<void>;
}
```

**Features**:
- API call via `createExpense`
- Redux dispatch for shipment totals
- Validation and error handling
- Toast notifications

---

### useAddProfit (`src/features/finance/hooks/useAddProfit.ts`)

**Purpose**: Handle profit creation logic.

**Returns**: Same structure as `useAddExpense`.

---

### useAddProduct (`src/features/products/hooks/useAddProduct.ts`)

**Purpose**: Handle product creation logic.

**Returns**:
```typescript
{
  submit: (formData: ProductFormData) => Promise<void>;
}
```

---

## API Functions Added

### Finance API (`src/features/finance/apiFinance.ts`)

- `createExpense(token, payload): Promise<Expense>`
- `createExtraProfit(token, payload): Promise<ExtraProfit>`

### Products API (`src/features/products/apiProducts.ts`)

- `createProduct(token, payload): Promise<Product>`

---

## Updated Pages

Pages updated to pass config to refactored components:

1. **ViewExpenses** (`src/pages/SharedPages/ViewExpenses/ViewExpenses.tsx`)
   - Passes config to `AddExpenses` using i18n keys

2. **ViewProfits** (`src/pages/SharedPages/ViewProfits/ViewProfits.tsx`)
   - Passes config to `AddProfits` using i18n keys

3. **ProductsList** (`src/pages/AdminPages/ProductsList/Products.tsx`)
   - Passes config to `AddProducts` using i18n keys

---

## i18n Keys Added

### Expenses
- `expenses.add.title`
- `expenses.add.buttonLabel`
- `expenses.fields.paymentCurrency`
- `expenses.currency.usd`
- `expenses.currency.lbp`

### Profits
- `profits.add.title`
- `profits.add.buttonLabel`
- `profits.fields.paymentCurrency`
- `profits.currency.usd`
- `profits.currency.lbp`

### Products
- `products.add.title`
- `products.add.buttonLabel`
- `products.fields.type`
- `products.fields.priceInDollars`

---

## Migration Notes

### Breaking Changes
- **AddExpenses, AddProfits, AddProducts**: Now require `config` prop. Update parent components to pass config using i18n keys.

### Backward Compatibility
- **RingCard**: Default labels preserved for backward compatibility
- **ErrorBoundary**: Optional props maintain backward compatibility
- **UI Components**: All changes are additive (new optional props)

### Testing Recommendations
1. Test form submission flows
2. Verify i18n labels display correctly
3. Test keyboard navigation
4. Verify ARIA attributes work with screen readers
5. Test error states and validation

---

## Future Improvements

1. **Extract AddToModel dependencies**: Consider making `AddToModel` more generic or extracting form logic
2. **Create shared form components**: Extract common form patterns
3. **Add React.memo**: Wrap stable presentational components
4. **Error boundaries**: Add error boundaries around form components
5. **Validation**: Extract validation logic to shared utilities

