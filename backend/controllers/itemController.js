const db = require("../config/db");

// 1. Get all items
const getAllItems = (req, res) => {
    const sql = `
        SELECT 
            items.*,
            item_types.type_name
        FROM items
        INNER JOIN item_types
        ON items.item_type_id = item_types.id
        ORDER BY items.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching items",
                error: err.message
            });
        }

        res.status(200).json(results);
    });
};

// 2. Get item by ID
const getItemById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT items.*, item_types.type_name
        FROM items
        INNER JOIN item_types
        ON items.item_type_id = item_types.id
        WHERE items.id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching item"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json(results[0]);
    });
};

// 3. Create item
const createItem = (req, res) => {
    const {
        name,
        purchase_date,
        stock_available,
        item_type_id
    } = req.body;

    if (!name || !purchase_date || stock_available === undefined || !item_type_id) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (!Number.isInteger(Number(stock_available)) || Number(stock_available) < 0) {
        return res.status(400).json({
            message: "Stock must be a non-negative integer"
        });
    }

    const checkTypeSql = "SELECT id FROM item_types WHERE id = ?";

    db.query(checkTypeSql, [item_type_id], (err, types) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (types.length === 0) {
            return res.status(400).json({
                message: "Invalid item type ID"
            });
        }

        const insertSql = `
            INSERT INTO items
            (name, purchase_date, stock_available, item_type_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [name.trim(), purchase_date, Number(stock_available), item_type_id],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error creating item",
                        error: err.message
                    });
                }

                res.status(201).json({
                    message: "Item created successfully",
                    item_id: result.insertId
                });
            }
        );
    });
};

// 4. Update item
const updateItem = (req, res) => {
    const { id } = req.params;
    const { name, purchase_date, stock_available, item_type_id } = req.body;

    if (!name || !purchase_date || stock_available === undefined || !item_type_id) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (!Number.isInteger(Number(stock_available)) || Number(stock_available) < 0) {
        return res.status(400).json({
            message: "Stock must be a non-negative integer"
        });
    }

    const sql = `
        UPDATE items
        SET name = ?, purchase_date = ?, stock_available = ?, item_type_id = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name.trim(), purchase_date, Number(stock_available), item_type_id, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating item",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Item not found"
                });
            }

            res.status(200).json({
                message: "Item updated successfully"
            });
        }
    );
};

// 5. Delete item
const deleteItem = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM items WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting item. It may be used in a purchase.",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item deleted successfully"
        });
    });
};

// 6. Activate / Deactivate item
const updateItemStatus = (req, res) => {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
        return res.status(400).json({
            message: "Active must be true or false"
        });
    }

    const sql = "UPDATE items SET active = ? WHERE id = ?";

    db.query(sql, [active, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error updating item status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: active ? "Item activated successfully" : "Item deactivated successfully"
        });
    });
};

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    updateItemStatus
};