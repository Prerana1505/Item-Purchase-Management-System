const express = require("express");
const router = express.Router();

const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    updateItemStatus
} = require("../controllers/itemController");

router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.patch("/:id/status", updateItemStatus);

module.exports = router;