# CustomersForArea Component

## Overview
The `CustomersForArea` component is responsible for displaying the list of customers within a specific area. It fetches customer data from an API when online and caches it in IndexedDB for offline access. When offline, it retrieves the cached data instead.

## Features
- Fetches customer data from the API when online.
- Caches the customer data in IndexedDB for offline use.
- Retrieves customer data from IndexedDB when offline.
- Highlights customers with filled and empty orders.
- Allows users to navigate to order recording for a specific customer.

## Dependencies
- React (`useState`, `useEffect`)
- React Router (`useParams`, `useNavigate`)
- Redux (`useSelector`, `useDispatch`)
- IndexedDB helper functions (`saveCustomersToDB`, `getCustomersFromDB`)
- CSS styles (`CustomersForArea.css`)

## Props & State
### State Variables:
- `customers`: Stores the list of customers.
- `loading`: Tracks whether data is being fetched.

### Redux State:
- `token`: Used for authorization.
- `customersWithFilledOrders`: Customers who have placed orders.
- `customersWithEmptyOrders`: Customers who haven't placed orders.

## IndexedDB Integration
- `saveCustomersToDB(areaId, data)`: Caches the fetched customer data.
- `getCustomersFromDB(areaId)`: Retrieves cached data when offline.

## API Interaction
- Fetches customer data from `https://api-trx.linarawas.com/api/customers/area/{areaId}`.
- Includes authentication via a Bearer token.
- Falls back to IndexedDB if network requests fail.

## Functions
### `fetchData()`
- Fetches customer data from API.
- Saves fetched data to IndexedDB.
- Loads cached data if offline.

### `handleOrderState(customerId)`
- Dispatches selected customer ID to Redux.
- Navigates to `/recordOrderforCustomer`.

## UI Structure
- Displays a table of customers with name, address, phone number.
- Shows order status using conditional row styling.
- Provides a button to record orders.

## Usage
```tsx
import CustomersForArea from "./CustomersForArea";
<CustomersForArea />
```

