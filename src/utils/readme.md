# IndexedDB Utility Module

## Overview
This module provides utility functions for managing an IndexedDB database named `MyDatabase`. It is designed to store and retrieve data related to areas, customers, customer invoices, discounts, and product types for an inventory management and shipment tracking application.

## Database Details
- **Database Name:** `MyDatabase`
- **Version:** 6
- **Stores:**
  - `areas`: Stores area data with `dayId` as the key.
  - `customers`: Stores customer data with `areaId` as the key.
  - `customerDiscounts`: Stores discount details with `customerId` as the key.
  - `customerInvoices`: Stores invoice details with `customerId` as the key.
  - `products`: Stores product types with `companyId` as the key.

## Initialization
The database is initialized with the function `initializeDB()`, which ensures the necessary object stores are created if they do not already exist.

```typescript
async function initializeDB() {
  await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(AREAS_STORE_NAME)) {
        db.createObjectStore(AREAS_STORE_NAME, { keyPath: "dayId" });
      }
      if (!db.objectStoreNames.contains(CUSTOMERS_STORE_NAME)) {
        db.createObjectStore(CUSTOMERS_STORE_NAME, { keyPath: "areaId" });
      }
      if (!db.objectStoreNames.contains(DISCOUNT_STORE_NAME)) {
        db.createObjectStore(DISCOUNT_STORE_NAME, { keyPath: "customerId" });
      }
      if (!db.objectStoreNames.contains(INVOICE_STORE_NAME)) {
        db.createObjectStore(INVOICE_STORE_NAME, { keyPath: "customerId" });
      }
      if (!db.objectStoreNames.contains(PRODUCTS_STORE_NAME)) {
        db.createObjectStore(PRODUCTS_STORE_NAME, { keyPath: "companyId" });
      }
    },
  });
}
```

This function should be called at the start of the application.

## Functions

### 1. Customer Invoices
#### Save Customer Invoice
```typescript
async function saveCustomerInvoiceToCache(customerId: string, data: any)
```
- Stores invoice data for a given customer.

#### Get Customer Invoice
```typescript
async function getCustomerInvoiceFromCache(customerId: string)
```
- Retrieves the invoice for a given customer.

### 2. Areas
#### Save Areas
```typescript
async function saveAreasToDB(dayId: string, data: any)
```
- Saves area data under a given `dayId`.

#### Get Areas
```typescript
async function getAreasFromDB(dayId: string)
```
- Retrieves area data for a specific `dayId`.

### 3. Customers
#### Save Customers
```typescript
async function saveCustomersToDB(areaId: string, data: any)
```
- Stores customers under a given `areaId`.

#### Get Customers
```typescript
async function getCustomersFromDB(areaId: string)
```
- Retrieves customers for a specific `areaId`.

### 4. Customer Discounts
#### Save Customer Discount
```typescript
async function saveCustomerDiscountToDB(customerId: string, data: any)
```
- Saves discount data for a given customer.

#### Get Customer Discount
```typescript
async function getCustomerDiscountFromDB(customerId: string)
```
- Retrieves the discount status of a customer.

### 5. Products
#### Save Product Type
```typescript
async function saveProductTypeToDB(companyId: string, productType: any)
```
- Saves product type data for a given `companyId`.

#### Get Product Type
```typescript
async function getProductTypeFromDB(companyId: string)
```
- Retrieves product type data for a given `companyId`.

## Usage Example
```typescript
await saveCustomerInvoiceToCache("123", { total: 100, items: ["item1", "item2"] });
const invoice = await getCustomerInvoiceFromCache("123");
console.log(invoice);
```

## Notes
- The database is initialized once at the start of the app.
- IndexedDB operations are asynchronous.
- Ensure error handling is implemented when using these functions in production.

## Dependencies
- [`idb`](https://www.npmjs.com/package/idb) (IndexedDB wrapper for modern browsers)

