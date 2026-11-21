const express = require("express");

const router = express.Router();

const {
    getAllItemTypes,
    createItemType
} = require("../controllers/itemTypeController");

// GET all item types
router.get("/", getAllItemTypes);

// POST new item type
router.post("/", createItemType);

module.exports = router;