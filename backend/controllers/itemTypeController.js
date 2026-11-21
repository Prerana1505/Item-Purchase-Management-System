const db = require("../config/db");

// Get all item types
const getAllItemTypes = (req, res) => {
    const sql = "SELECT * FROM item_types ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching item types"
            });
        }

        res.status(200).json(results);
    });
};

// Add a new item type
const createItemType = (req, res) => {
    const { type_name } = req.body;

    if (!type_name || !type_name.trim()) {
        return res.status(400).json({
            message: "Item type name is required"
        });
    }

    const sql = "INSERT INTO item_types (type_name) VALUES (?)";

    db.query(sql, [type_name.trim()], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "This item type already exists"
                });
            }

            return res.status(500).json({
                message: "Error creating item type"
            });
        }

        res.status(201).json({
            message: "Item type created successfully",
            id: result.insertId,
            type_name: type_name.trim()
        });
    });
};

module.exports = {
    getAllItemTypes,
    createItemType
};