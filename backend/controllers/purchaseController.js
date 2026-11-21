const db = require("../config/db");

// Create a new purchase
const createPurchase = (req, res) => {
    const { order_id, purchase_date, items } = req.body;

    // Validate required fields
    if (!order_id || !purchase_date || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "Order ID, purchase date and items are required"
        });
    }

    // Validate item IDs and quantities
    for (const item of items) {
        if (
            !Number.isInteger(Number(item.item_id)) ||
            Number(item.item_id) <= 0 ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        ) {
            return res.status(400).json({
                message: "Each item must have a valid item_id and quantity greater than zero"
            });
        }
    }

    // Prevent duplicate item IDs in one order
    const itemIds = items.map(item => Number(item.item_id));

    if (new Set(itemIds).size !== itemIds.length) {
        return res.status(400).json({
            message: "Duplicate items are not allowed in one purchase"
        });
    }

    // Get a database connection for transaction
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({
                    message: "Could not start transaction"
                });
            }

            // Create purchase record
            const purchaseSql = `
                INSERT INTO purchases (order_id, purchase_date)
                VALUES (?, ?)
            `;

            connection.query(
                purchaseSql,
                [order_id.trim(), purchase_date],
                (err, purchaseResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({
                                message: "Could not create purchase",
                                error: err.message
                            });
                        });
                    }

                    const purchaseId = purchaseResult.insertId;

                    // Process each purchased item one by one
                    const processItem = (index) => {
                        if (index >= items.length) {
                            return connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({
                                            message: "Could not complete purchase"
                                        });
                                    });
                                }

                                connection.release();

                                res.status(201).json({
                                    message: "Purchase created successfully",
                                    purchase_id: purchaseId,
                                    order_id,
                                    items
                                });
                            });
                        }

                        const currentItem = items[index];

                        const stockSql = `
                            SELECT id, name, stock_available, active
                            FROM items
                            WHERE id = ?
                            FOR UPDATE
                        `;

                        connection.query(
                            stockSql,
                            [currentItem.item_id],
                            (err, itemResults) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({
                                            message: "Error checking item stock"
                                        });
                                    });
                                }

                                if (itemResults.length === 0) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(400).json({
                                            message: `Item ${currentItem.item_id} not found`
                                        });
                                    });
                                }

                                const selectedItem = itemResults[0];

                                if (!selectedItem.active) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(400).json({
                                            message: `${selectedItem.name} is inactive`
                                        });
                                    });
                                }

                                if (selectedItem.stock_available < currentItem.quantity) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(400).json({
                                            message: `Insufficient stock for ${selectedItem.name}`
                                        });
                                    });
                                }

                                // Insert purchase item
                                const insertSql = `
                                    INSERT INTO purchase_items
                                    (purchase_id, item_id, quantity)
                                    VALUES (?, ?, ?)
                                `;

                                connection.query(
                                    insertSql,
                                    [
                                        purchaseId,
                                        currentItem.item_id,
                                        currentItem.quantity
                                    ],
                                    err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                res.status(500).json({
                                                    message: "Error adding purchase item"
                                                });
                                            });
                                        }

                                        // Reduce available stock
                                        const updateStockSql = `
                                            UPDATE items
                                            SET stock_available = stock_available - ?
                                            WHERE id = ?
                                        `;

                                        connection.query(
                                            updateStockSql,
                                            [
                                                currentItem.quantity,
                                                currentItem.item_id
                                            ],
                                            err => {
                                                if (err) {
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        res.status(500).json({
                                                            message: "Error updating stock"
                                                        });
                                                    });
                                                }

                                                processItem(index + 1);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    };

                    processItem(0);
                }
            );
        });
    });
};



// Get all purchase details
const getAllPurchases = (req, res) => {

    const sql = `
        SELECT
            p.id AS purchase_id,
            p.order_id,
            p.purchase_date,
            pi.id AS purchase_item_id,
            i.id AS item_id,
            i.name AS item_name,
            it.type_name AS category,
            pi.quantity
        FROM purchases p
        INNER JOIN purchase_items pi
            ON p.id = pi.purchase_id
        INNER JOIN items i
            ON pi.item_id = i.id
        INNER JOIN item_types it
            ON i.item_type_id = it.id
        ORDER BY p.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching purchase details",
                error: err.message
            });
        }

        res.status(200).json(results);
    });
};


// Get purchase details by ID
const getPurchaseById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            p.id AS purchase_id,
            p.order_id,
            p.purchase_date,
            pi.id AS purchase_item_id,
            i.id AS item_id,
            i.name AS item_name,
            it.type_name AS category,
            pi.quantity
        FROM purchases p
        INNER JOIN purchase_items pi
            ON p.id = pi.purchase_id
        INNER JOIN items i
            ON pi.item_id = i.id
        INNER JOIN item_types it
            ON i.item_type_id = it.id
        WHERE p.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching purchase details",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Purchase not found"
            });
        }

        res.status(200).json(results);
    });
};
// Update an existing purchase
const updatePurchase = (req, res) => {
    const { id } = req.params;
    const { order_id, purchase_date, items } = req.body;

    // Validate required fields
    if (!order_id || !order_id.trim() || !purchase_date ||
        !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "Order ID, purchase date and items are required"
        });
    }

    // Validate item IDs and quantities
    for (const item of items) {
        if (
            !Number.isInteger(Number(item.item_id)) ||
            Number(item.item_id) <= 0 ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        ) {
            return res.status(400).json({
                message: "Each item must have a valid item_id and quantity greater than zero"
            });
        }
    }

    // Prevent duplicate items
    const itemIds = items.map(item => Number(item.item_id));

    if (new Set(itemIds).size !== itemIds.length) {
        return res.status(400).json({
            message: "Duplicate items are not allowed in one purchase"
        });
    }

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        const rollback = (status, response) => {
            connection.rollback(() => {
                connection.release();
                res.status(status).json(response);
            });
        };

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({
                    message: "Could not start transaction"
                });
            }

            // Check whether purchase exists and lock it
            connection.query(
                "SELECT id FROM purchases WHERE id = ? FOR UPDATE",
                [id],
                (err, purchaseResults) => {
                    if (err) {
                        return rollback(500, {
                            message: "Error checking purchase"
                        });
                    }

                    if (purchaseResults.length === 0) {
                        return rollback(404, {
                            message: "Purchase not found"
                        });
                    }

                    // Get previously purchased items
                    connection.query(
                        "SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ? FOR UPDATE",
                        [id],
                        (err, oldItems) => {
                            if (err) {
                                return rollback(500, {
                                    message: "Error fetching previous purchase items"
                                });
                            }

                            // Restore old quantities to stock
                            const restoreOldStock = (index) => {
                                if (index >= oldItems.length) {
                                    return updatePurchaseDetails();
                                }

                                const oldItem = oldItems[index];

                                connection.query(
                                    `UPDATE items
                                     SET stock_available = stock_available + ?
                                     WHERE id = ?`,
                                    [oldItem.quantity, oldItem.item_id],
                                    err => {
                                        if (err) {
                                            return rollback(500, {
                                                message: "Error restoring previous stock"
                                            });
                                        }

                                        restoreOldStock(index + 1);
                                    }
                                );
                            };

                            const updatePurchaseDetails = () => {
                                // Update purchase information
                                connection.query(
                                    `UPDATE purchases
                                     SET order_id = ?, purchase_date = ?
                                     WHERE id = ?`,
                                    [order_id.trim(), purchase_date, id],
                                    err => {
                                        if (err) {
                                            return rollback(500, {
                                                message: "Could not update purchase",
                                                error: err.message
                                            });
                                        }

                                        // Remove old purchase items
                                        connection.query(
                                            "DELETE FROM purchase_items WHERE purchase_id = ?",
                                            [id],
                                            err => {
                                                if (err) {
                                                    return rollback(500, {
                                                        message: "Could not update purchase items"
                                                    });
                                                }

                                                processNewItems(0);
                                            }
                                        );
                                    }
                                );
                            };

                            // Validate and add new items
                            const processNewItems = (index) => {
                                if (index >= items.length) {
                                    return connection.commit(err => {
                                        if (err) {
                                            return rollback(500, {
                                                message: "Could not complete purchase update"
                                            });
                                        }

                                        connection.release();

                                        res.status(200).json({
                                            message: "Purchase updated successfully",
                                            purchase_id: Number(id),
                                            order_id: order_id.trim(),
                                            items
                                        });
                                    });
                                }

                                const currentItem = items[index];

                                connection.query(
                                    `SELECT id, name, stock_available, active
                                     FROM items
                                     WHERE id = ?
                                     FOR UPDATE`,
                                    [currentItem.item_id],
                                    (err, itemResults) => {
                                        if (err) {
                                            return rollback(500, {
                                                message: "Error checking item stock"
                                            });
                                        }

                                        if (itemResults.length === 0) {
                                            return rollback(400, {
                                                message: `Item ${currentItem.item_id} not found`
                                            });
                                        }

                                        const selectedItem = itemResults[0];

                                        if (!selectedItem.active) {
                                            return rollback(400, {
                                                message: `${selectedItem.name} is inactive`
                                            });
                                        }

                                        if (selectedItem.stock_available < currentItem.quantity) {
                                            return rollback(400, {
                                                message: `Insufficient stock for ${selectedItem.name}`
                                            });
                                        }

                                        // Insert updated purchase item
                                        connection.query(
                                            `INSERT INTO purchase_items
                                             (purchase_id, item_id, quantity)
                                             VALUES (?, ?, ?)`,
                                            [id, currentItem.item_id, currentItem.quantity],
                                            err => {
                                                if (err) {
                                                    return rollback(500, {
                                                        message: "Error adding updated purchase item"
                                                    });
                                                }

                                                // Deduct new quantity from stock
                                                connection.query(
                                                    `UPDATE items
                                                     SET stock_available = stock_available - ?
                                                     WHERE id = ?`,
                                                    [currentItem.quantity, currentItem.item_id],
                                                    err => {
                                                        if (err) {
                                                            return rollback(500, {
                                                                message: "Error updating stock"
                                                            });
                                                        }

                                                        processNewItems(index + 1);
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            };

                            restoreOldStock(0);
                        }
                    );
                }
            );
        });
    });
};
module.exports = {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
     updatePurchase
};