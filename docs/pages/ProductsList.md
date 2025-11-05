# Products List

**Path:** [src/pages/AdminPages/ProductsList/Products.tsx](../../src/pages/AdminPages/ProductsList/Products.tsx)  
**Role:** Admin page for viewing and managing company products. Displays a list of products with the ability to add new products and delete existing ones.  
**Owner/Area:** Admin Pages | Products

## Overview

The Products List page provides administrators with a view of all products associated with their company. It supports:
- Viewing all products with details (name, price, returnability)
- Adding new products via a toggleable form
- Deleting products with optimistic UI updates
- Loading and error states
- Full i18n support for Arabic text

## Key Components & Links

### Main Container
- **[Products.tsx](../../src/pages/AdminPages/ProductsList/Products.tsx)** - Main page component that orchestrates product display and management

### Data Components
- **[useProducts.ts](../../src/features/products/hooks/useProducts.ts)** - Custom hook that manages product data fetching, loading states, and optimistic delete operations
- **[apiProducts.ts](../../src/features/products/apiProducts.ts)** - API module containing functions for listing and deleting products

### Presentational Components
- **[ProductCard.tsx](../../src/components/Products/ProductCard.tsx)** - Reusable card component for displaying individual product details
- **[AddProducts.tsx](../../src/components/Products/AddProducts.tsx)** - Form component for adding new products (uses AddToModel)

### Supporting Components
- **[SpinLoader.jsx](../../src/components/UI reusables/SpinLoader/SpinLoader.jsx)** - Loading spinner component

## Data Flow

```
Redux Store (token, companyId)
    ↓
useProducts(token, companyId)
    ↓
apiProducts.listCompanyProducts(token, companyId)
    ↓
{ items, loading, error, remove, refetch }
    ↓
ProductsList renders ProductCard components
    ↓
User actions:
  - Delete: remove(productId) → optimistic update → API call
  - Add: AddProducts form → API call → refetch on form close
```

### Data Sources

1. **useProducts Hook**
   - Fetches products via `listCompanyProducts` API
   - Manages loading and error states
   - Provides `remove` function with optimistic updates
   - Returns `{ items, loading, error, refetch, remove, setItems }`

2. **API Functions**
   - `listCompanyProducts(token, companyId)` - Fetches all products for a company
   - `deleteProductById(token, productId)` - Deletes a product by ID

3. **Optimistic Delete**
   - Removes item from UI immediately
   - Reverts on API failure
   - Shows toast notifications for success/error

## i18n Keys

All user-facing Arabic strings are extracted to translation keys under the `products.*` namespace:

- `products.title` - "المنتجات"
- `products.add.toggleShow` - "هل تريد إضافة منتجات جديدة؟"
- `products.add.toggleHide` - "هل تريد إخفاء النموذج؟"
- `products.none` - "لا توجد منتجات لهذه الشركة"
- `products.fields.name` - "الاسم"
- `products.fields.price` - "القيمة"
- `products.fields.returnable` - "هل يمكن إرجاعه"
- `products.returnable.yes` - "نعم"
- `products.returnable.no` - "لا"
- `products.delete` - "حذف"
- `products.delete.success` - "تم حذف المنتج بنجاح"
- `products.delete.error` - "فشل حذف المنتج"
- `products.fetch.error` - "فشل تحميل المنتجات"

**Translation utility:** [src/utils/i18n.ts](../../src/utils/i18n.ts)

## CSS Classes

### Main Layout
- `.products` - Root container (RTL layout, padding)
- `.show-add-products` - Toggle button for add form

### Product Display
- `.receipt-details-container` - Container for product cards grid
- `.receipt-details` - Individual product card (from CustomerInvoices.css)
- `.receipt-detail` - Individual field row
- `.detail-name` - Field label
- `.detail-value` - Field value
- `.container-button-div` - Delete button container
- `.delete-btn` - Delete button styling

**CSS files:**
- [src/pages/AdminPages/ProductsList/ProductsList.css](../../src/pages/AdminPages/ProductsList/ProductsList.css)
- [src/components/Customers/CustomerInvoices/CustomerInvoices.css](../../src/components/Customers/CustomerInvoices/CustomerInvoices.css)

## Loading & Error States

- **Loading:** Displays `SpinLoader` component when `loading === true`
- **Error:** Shows error message (translated) when `error !== null`
- **Empty:** Shows "no products" message when `items.length === 0`
- **Success:** Renders product cards via `ProductCard` components

## Accessibility

- Delete buttons include `type="button"` and `aria-label` attributes
- All text is translated via i18n keys
- Semantic HTML structure preserved

## Extensibility

### Adding a New Product Field

1. Update `Product` interface in [useProducts.ts](../../src/features/products/hooks/useProducts.ts)
2. Add translation keys for the field label in [src/utils/i18n.ts](../../src/utils/i18n.ts)
3. Update `ProductCard` component to display the new field
4. Update `AddProducts` form configuration if needed
5. Ensure API response includes the new field

### Example: Adding a "Description" Field

```typescript
// 1. Update interface
export interface Product {
  // ... existing fields
  description?: string;
}

// 2. Add i18n key
'products.fields.description': 'الوصف'

// 3. Update ProductCard
<div className="receipt-detail">
  <p className="detail-name">{t("products.fields.description")}:</p>
  <p className="detail-value">{product?.description || '—'}</p>
</div>
```

## Related Documentation

- [AddToModel Component](../../src/components/AddToModel/AddToModel.tsx) - Generic form component used by AddProducts
- [API Configuration](../../src/config/api.ts) - Base URL configuration

