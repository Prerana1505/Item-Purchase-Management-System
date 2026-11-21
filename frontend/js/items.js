
const API_URL = "http://localhost:5000/api";

const itemForm = document.getElementById("itemForm");
const itemsTable = document.getElementById("itemsTable");
const itemTypeSelect = document.getElementById("itemType");

// Load categories
async function loadItemTypes() {
    try {
        const response = await fetch(`${API_URL}/item-types`);
        const types = await response.json();

        itemTypeSelect.innerHTML =
            '<option value="">Select Category</option>';

        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type.id;
            option.textContent = type.type_name;
            itemTypeSelect.appendChild(option);
        });

    } catch (error) {
        alert("Unable to load item categories");
    }
}

// Load all items
async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();

        itemsTable.innerHTML = "";

        items.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.type_name}</td>
                <td>${item.stock_available}</td>
                <td>${item.active ? "Active" : "Inactive"}</td>
                <td>
                    <button onclick="editItem(${item.id})">Edit</button>
                    <button onclick="toggleStatus(${item.id}, ${Boolean(item.active)})">
                        ${item.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onclick="deleteItem(${item.id})">Delete</button>
                </td>
            `;

            itemsTable.appendChild(row);
        });

    } catch (error) {
        alert("Unable to load items");
    }
}

// Add or update item
itemForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("itemId").value;

    const itemData = {
        name: document.getElementById("name").value.trim(),
        purchase_date: document.getElementById("purchaseDate").value,
        stock_available: Number(document.getElementById("stock").value),
        item_type_id: Number(itemTypeSelect.value)
    };

    if (!itemData.name || !itemData.item_type_id) {
        alert("Please enter all required details");
        return;
    }

    const url = id
        ? `${API_URL}/items/${id}`
        : `${API_URL}/items`;

    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Operation failed");
        }

        alert(result.message || "Item saved successfully");

        resetForm();
        loadItems();

    } catch (error) {
        alert(error.message);
    }
});

// Edit item
async function editItem(id) {
    try {
        const response = await fetch(`${API_URL}/items/${id}`);
        const item = await response.json();

        if (!response.ok) {
            throw new Error(item.message || "Item not found");
        }

        document.getElementById("itemId").value = item.id;
        document.getElementById("name").value = item.name;
        document.getElementById("purchaseDate").value =
            String(item.purchase_date).substring(0, 10);
        document.getElementById("stock").value = item.stock_available;
        itemTypeSelect.value = item.item_type_id;

        document.getElementById("formTitle").textContent = "Edit Item";
        document.getElementById("submitButton").textContent = "Update Item";
        document.getElementById("cancelButton").hidden = false;

        window.scrollTo(0, 0);

    } catch (error) {
        alert(error.message);
    }
}

// Activate or deactivate item
async function toggleStatus(id, currentStatus) {
    const newStatus = !currentStatus;

    try {
        const response = await fetch(`${API_URL}/items/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                active: newStatus
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Status update failed");
        }

        alert(result.message || "Status updated successfully");
        loadItems();

    } catch (error) {
        alert(error.message);
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert(result.message || "Item deleted successfully");
        loadItems();

    } catch (error) {
        alert(error.message);
    }
}

// Reset form
function resetForm() {
    itemForm.reset();

    document.getElementById("itemId").value = "";
    document.getElementById("formTitle").textContent = "Add New Item";
    document.getElementById("submitButton").textContent = "Add Item";
    document.getElementById("cancelButton").hidden = true;
}

document.getElementById("cancelButton").addEventListener("click", resetForm);

// Initial loading
loadItemTypes();
loadItems();
