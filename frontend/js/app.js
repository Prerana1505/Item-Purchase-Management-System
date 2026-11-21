
const API_URL = "http://localhost:5000/api";

// Load dashboard data
async function loadDashboard() {
    try {
        const itemsResponse = await fetch(`${API_URL}/items`);
        const purchasesResponse = await fetch(`${API_URL}/purchases`);

        if (!itemsResponse.ok || !purchasesResponse.ok) {
            throw new Error("Unable to load dashboard data");
        }

        const items = await itemsResponse.json();
        const purchases = await purchasesResponse.json();

        document.getElementById("totalItems").textContent =
            items.length;

        document.getElementById("activeItems").textContent =
            items.filter(item => Boolean(item.active)).length;

        const purchaseIds = new Set(
            purchases.map(purchase => purchase.purchase_id)
        );

        document.getElementById("totalPurchases").textContent =
            purchaseIds.size;

        const table = document.getElementById("itemsTable");

        table.innerHTML = items.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.type_name}</td>
                <td>${item.stock_available}</td>
                <td>${item.active ? "Active" : "Inactive"}</td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Dashboard error:", error);
        alert("Unable to connect to backend. Please check your server.");
    }
}

loadDashboard();
