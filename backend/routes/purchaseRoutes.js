const express = require("express");
const router = express.Router();

const {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
    updatePurchase
} = require("../controllers/purchaseController");

// Create purchase
router.post("/", createPurchase);

// Get all purchases
router.get("/", getAllPurchases);

// Get purchase by ID
router.get("/:id", getPurchaseById);

// Update purchase
router.put("/:id", updatePurchase);

module.exports = router;