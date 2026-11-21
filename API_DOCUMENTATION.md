
# API Documentation
## Item & Purchase Management System

**Base URL:** `http://localhost:5000`

All request and response bodies use JSON.

---

## 1. Item Types

### Get All Item Types
- Method: GET
- Endpoint: `/api/item-types`

### Create Item Type
- Method: POST
- Endpoint: `/api/item-types`

Request Body:
```json
{
  "type_name": "Electronics"
}
```

---

## 2. Items

### Get All Items
- Method: GET
- Endpoint: `/api/items`

### Get Item By ID
- Method: GET
- Endpoint: `/api/items/1`

### Create Item
- Method: POST
- Endpoint: `/api/items`

Request Body:
```json
{
  "name": "Laptop",
  "purchase_date": "2026-11-21",
  "stock_available": 20,
  "item_type_id": 1
}
```

### Update Item
- Method: PUT
- Endpoint: `/api/items/1`

{
  "name": "Updated Laptop",
  "purchase_date": "2026-11-21",
  "stock_available": 25,
  "item_type_id": 1
}

### Delete Item
- Method: DELETE
- Endpoint: `/api/items/1`

Note: Items linked to purchase records cannot be deleted.

### Update Item Status
- Method: PATCH
- Endpoint: `/api/items/1/status`

Request Body:
```json
{
  "active": false
}
```

---

## 3. Purchases

### Create Purchase
- Method: POST
- Endpoint: `/api/purchases`

Request Body:
```json
{
  "order_id": "ORD-1003",
  "purchase_date": "2026-11-21",
  "items": [
    {
      "item_id": 1,
      "quantity": 2
    },
    {
      "item_id": 3,
      "quantity": 1
    }
  ]
}
```

### Get All Purchases
- Method: GET
- Endpoint: `/api/purchases`

### Get Purchase By ID
- Method: GET
- Endpoint: `/api/purchases/1`

### Update Purchase
- Method: PUT
- Endpoint: `/api/purchases/1`

Request Body:
```json
{
  "order_id": "ORD-1003",
  "purchase_date": "2026-11-21",
  "items": [
    {
      "item_id": 1,
      "quantity": 3
    },
    {
      "item_id": 3,
      "quantity": 2
    }
  ]
}
```

Note: Purchase deletion is not supported to preserve historical records.

---

## 4. Important Validations

- Item name is required.
- Stock cannot be negative.
- Purchase quantity must be greater than zero.
- Inactive items cannot be purchased.
- Purchase quantity cannot exceed available stock.
- Duplicate items are not allowed in one purchase.
- Purchase creation and update use database transactions.
- Failed transactions are rolled back.
- Historical purchase records are protected.
