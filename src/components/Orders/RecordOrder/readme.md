# RecordOrder Component Documentation

## Overview

The `RecordOrder` component is a React functional component designed to manage the creation of orders for shipments. It interacts with a backend API and handles different use cases like submitting orders when online, caching requests when offline, and updating shipment details based on orders placed. The component uses Redux for state management, IndexedDB for offline data storage, and React Toastify for displaying notifications.

## Features

- **Online/Offline Handling:** 
  - If the user is offline, orders are stored locally in IndexedDB and submitted once the user is online.
  - Automatically fetches pending orders from IndexedDB when the user reconnects to the internet.

- **Product Fetching:**
  - Fetches product data (e.g., "Bottles") from the API when the user is online.
  - Caches product information in IndexedDB for offline use.

- **Order Recording:**
  - Allows users to record the number of delivered and returned products.
  - The total price is calculated dynamically based on the product price and quantity.
  - Supports selecting the payment currency (USD or LBP) and updating the amount paid.

- **State Management:**
  - Redux is used to manage and dispatch states related to shipment details, such as delivered/returned items and payments.

## Key Dependencies

- `react-toastify` - For displaying toast notifications (success, error, info).
- `react-redux` - For accessing and dispatching state via Redux.
- `indexedDb` - For local storage of offline data.
- `react-router-dom` - For navigation purposes.

## Component Structure

### State Variables:
- **`orderData`:** Stores the order's details like delivered quantity, returned quantity, payment currency, and the amount paid.
- **`checkout`:** Calculates the total price based on delivered quantity and product price.
  
### Redux State Variables:
- **`customerId`, `areaId`, `shipmentId`, etc.:** Values selected from the Redux store for managing order-related data.

### Functions:
- **`handleChange`:** Updates the `orderData` state based on input changes.
- **`handleSubmit`:** Handles form submission. It saves the order data either locally (when offline) or sends it to the API (when online).
- **`handleCurrencySelection`:** Updates the selected payment currency (USD or LBP).

### `useEffect` Hooks:
1. **Online Status Listener:** 
   - Listens for the `online` event to submit pending requests from IndexedDB once the user is back online.
   
2. **Product Fetching:**
   - Fetches the default product data from the API when online, or retrieves it from IndexedDB when offline.
  
### Form Layout:
- **Delivered/Returned Inputs:**
  - Number inputs with up and down arrows to increase or decrease values for delivered and returned products.
  
- **Currency Selection:**
  - Buttons to toggle between USD and LBP for payment.

- **Paid Input:**
  - Input field to specify the amount paid by the customer.

### Example Usage:

```jsx
import RecordOrder from './components/RecordOrder';

// Inside a parent component or page
<RecordOrder customerData={customerData} />
```

## API Endpoints:

- **`POST /api/orders`:** Submits the order data to the backend when online.
- **`POST /api/products/productType/company/{companyId}`:** Fetches product data based on company ID.

## Styling:

- The component is styled with custom CSS in `RecordOrder.css`, which is imported at the top of the component file.
  
## Handling Edge Cases:

- **Offline Mode:** 
  - If the user is offline, the order is saved locally and submitted when the user is online again.
  - Notifications inform the user when they are offline and when the order is successfully submitted after going online.

- **Product Fetching:** 
  - If the product data is unavailable in the cache and the user is offline, a warning is displayed asking the user to go online to fetch the product data.

## Error Handling:
- **Network Errors:** 
  - Errors in network requests or fetching product data trigger toast notifications to inform the user.
  
## Notes:
- The product type is hardcoded as "Bottles" in the fetch request for simplicity.
- The price calculation is done based on a `productPrice` value, which is fetched from the API or the cache.
