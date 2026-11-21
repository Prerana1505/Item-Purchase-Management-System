CREATE DATABASE IF NOT EXISTS item_purchase_db;

USE item_purchase_db;

-- 1. Item Types
CREATE TABLE item_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Items
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    purchase_date DATE NOT NULL,
    stock_available INT NOT NULL CHECK (stock_available >= 0),
    item_type_id INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_type_id) REFERENCES item_types(id)
);

-- 3. Purchases
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Purchase Items
CREATE TABLE purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE (purchase_id, item_id)
);

-- Insert required item categories
INSERT INTO item_types (type_name) VALUES
('Electronics'),
('Furniture'),
('Clothing'),
('Grocery'),
('Stationery');