
# Item & Purchase Management System

## Project Overview
The Item & Purchase Management System is a web application developed to manage item details, stock availability, and purchase transactions.

The application allows users to manage items, maintain purchase records, and automatically update stock when purchases are created or modified.

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Tools
- Visual Studio Code
- MySQL Workbench
- Postman

## Features

### Item Management
- Add new items.
- View all items.
- Edit item details.
- Delete items when they are not linked to purchases.
- Activate or deactivate items.
- View item categories.

### Purchase Management
- Create purchases with multiple items.
- View purchase history.
- Edit existing purchases.
- Validate item quantities.
- Prevent purchases of inactive items.
- Check available stock before purchase.
- Automatically update stock after transactions.
- Prevent negative stock.
- Preserve historical purchase records.

## Database Tables
1. item_types
2. items
3. purchases
4. purchase_items

## Project Setup

### 1. Clone or Download the Project

Open the project folder in Visual Studio Code.

### 2. Install Dependencies

Open the terminal inside the project folder and execute:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=item_purchase_db
DB_PORT=3306
```

Replace `your_mysql_password` with your local MySQL password.

### 4. Configure the Database

Open MySQL Workbench and execute the SQL script located at:

`database/schema.sql`

### 5. Start the Backend Server

Execute:

```bash
npm.cmd run dev
```

The backend runs at:

http://localhost:5000

### 6. Open the Frontend

Open `frontend/index.html` using Live Server.

## API Endpoints

### Item Types
- GET /api/item-types
- POST /api/item-types

### Items
- GET /api/items
- GET /api/items/:id
- POST /api/items
- PUT /api/items/:id
- DELETE /api/items/:id
- PATCH /api/items/:id/status

### Purchases
- POST /api/purchases
- GET /api/purchases
- GET /api/purchases/:id
- PUT /api/purchases/:id

## Transaction Management

MySQL transactions are used during purchase creation and updates to ensure stock consistency.

If an operation fails, the transaction is rolled back to prevent incorrect stock changes.

## Author
Developed as an Item & Purchase Management System assessment project.
