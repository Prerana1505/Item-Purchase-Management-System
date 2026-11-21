const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const db = require("./config/db");
const itemTypeRoutes = require("./routes/itemTypeRoutes");
const itemRoutes = require("./routes/itemRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/items", itemRoutes);
app.use("/api/item-types", itemTypeRoutes);
app.use("/api/purchases", purchaseRoutes);


app.get("/", (req, res) => {
    res.send("Item Purchase Management API is Running!");
});

app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1 AS result", (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        res.json({
            message: "Database connected successfully!",
            data: results
        });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});