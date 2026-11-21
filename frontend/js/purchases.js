
const API_URL = "http://localhost:5000/api";

const purchaseForm = document.getElementById("purchaseForm");
const purchaseItems = document.getElementById("purchaseItems");
const purchasesTable = document.getElementById("purchasesTable");

// Store available active items
let availableItems = [];
let editingPurchaseId = null;
// Load active items from backend
async function loadAvailableItems() {
    try {
        const response = await fetch(`${API_URL}/items`);

        if (!response.ok) {
            throw new Error("Unable to fetch items");
        }

        const items = await response.json();

        availableItems = items.filter(item => Boolean(item.active));

        addPurchaseItem();

    } catch (error) {
        alert(error.message);
    }
}

// Add an item selection row
function addPurchaseItem() {
    const row = document.createElement("div");

    row.className = "purchase-item-row";

    const options = availableItems.map(item => `
        <option value="${item.id}">
            ${item.name} (Stock: ${item.stock_available})
        </option>
    `).join("");

    row.innerHTML = `
        <label>Select Item</label>

        <select class="selectedItem" required>
            <option value="">Choose an item</option>
            ${options}
        </select>

        <label>Quantity</label>

        <input
            type="number"
            class="itemQuantity"
            min="1"
            placeholder="Enter quantity"
            required
        >

        <button type="button" class="removeItemButton">
            Remove
        </button>

        <hr>
    `;

    row.querySelector(".removeItemButton").addEventListener("click", () => {
        row.remove();
    });

    purchaseItems.appendChild(row);
}

// Add another item button
document.getElementById("addItemButton")
    .addEventListener("click", addPurchaseItem);

// Create purchase
purchaseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const orderId = document.getElementById("orderId").value.trim();

    const purchaseDate =
        document.getElementById("purchaseDate").value;

    const rows = document.querySelectorAll(".purchase-item-row");

    const items = [];

    for (const row of rows) {
        const itemId = Number(
            row.querySelector(".selectedItem").value
        );

        const quantity = Number(
            row.querySelector(".itemQuantity").value
        );

        if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
            alert("Please select an item and enter a valid quantity.");
            return;
        }

        items.push({
            item_id: itemId,
            quantity: quantity
        });
    }

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    // Prevent duplicate items in one purchase
    const uniqueIds = new Set(items.map(item => item.item_id));

    if (uniqueIds.size !== items.length) {
        alert("Duplicate items are not allowed in one purchase.");
        return;
    }

    const purchaseData = {
        order_id: orderId,
        purchase_date: purchaseDate,
        items: items
    };

    try {
        const url = editingPurchaseId
    ? `${API_URL}/purchases/${editingPurchaseId}`
    : `${API_URL}/purchases`;

const method = editingPurchaseId ? "PUT" : "POST";

const response = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(purchaseData)
});

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Purchase creation failed");
        }

        alert(
    editingPurchaseId
        ? "Purchase updated successfully!"
        : "Purchase created successfully!"
);

editingPurchaseId = null;
       purchaseForm.reset();
purchaseItems.innerHTML = "";
editingPurchaseId = null;

document.querySelector("#purchaseForm button[type='submit']")
    .textContent = "Create Purchase";

await loadAvailableItems();
await loadPurchaseHistory();

    } catch (error) {
        alert(error.message);
    }
});

// Load purchase history
async function loadPurchaseHistory() {
    try {
        const response = await fetch(`${API_URL}/purchases`);

        if (!response.ok) {
            throw new Error("Unable to load purchase history");
        }

        const purchases = await response.json();

        purchasesTable.innerHTML = "";

        purchases.forEach(purchase => {
            const row = document.createElement("tr");

            const date = new Date(purchase.purchase_date)
                .toLocaleDateString("en-IN");

            row.innerHTML = `
  <td>${purchase.order_id}</td>
  <td>${purchase.item_name}</td>
  <td>${purchase.category}</td>
  <td>${purchase.quantity}</td>
  <td>${date}</td>
  <td>
    <button onclick="editPurchase(${purchase.purchase_id})">
      Edit
    </button>
  </td>
`;

            purchasesTable.appendChild(row);
        });

    } catch (error) {
        alert(error.message);
    }
}

// Initial loading
loadAvailableItems();
loadPurchaseHistory();
async function editPurchase(purchaseId) {
    try {
        const response = await fetch(`${API_URL}/purchases/${purchaseId}`);

        if (!response.ok) {
            throw new Error("Unable to fetch purchase details");
        }

        const purchaseDetails = await response.json();

        if (purchaseDetails.length === 0) {
            alert("Purchase not found");
            return;
        }

        const firstItem = purchaseDetails[0];
        editingPurchaseId = purchaseId;

document.querySelector("#purchaseForm button[type='submit']")
    .textContent = "Update Purchase";

        document.getElementById("orderId").value = firstItem.order_id;

        document.getElementById("purchaseDate").value =
            new Date(firstItem.purchase_date).toISOString().split("T")[0];

        purchaseItems.innerHTML = "";

        purchaseDetails.forEach(item => {
            addPurchaseItem();

            const rows = document.querySelectorAll(".purchase-item-row");
            const currentRow = rows[rows.length - 1];

            currentRow.querySelector(".selectedItem").value = item.item_id;
            currentRow.querySelector(".itemQuantity").value = item.quantity;
        });

        alert("Purchase details loaded. Edit the details and submit.");
    } catch (error) {
        alert(error.message);
    }
}
