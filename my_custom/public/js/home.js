console.log("✅ home.js loaded");

// Correct container ID (matches home.html)
const container = document.getElementById("itemList");

if (!container) {
    console.error("❌ #itemList element not found!");
}

// 🧠 Fetch Items from backend
async function fetchItems() {
    try {
        const res = await fetch("/api/method/my_custom.api.home.get_items");
        const data = await res.json();

        console.log("📦 API Response:", data);

        if (data.message && data.message.items && data.message.items.length > 0) {
            container.innerHTML = ""; // clear old content

            const grid = document.createElement("div");
            grid.className = "grid";

            data.message.items.forEach(item => {
                const card = document.createElement("div");
                card.className = "card";

                const imgHtml = item.image
                    ? `<img src="${item.image}" alt="${item.item_name}">`
                    : `<div class="no-image">No Image</div>`;

                const itemUrl = `/item-details?name=${encodeURIComponent(item.name)}`;

                card.innerHTML = `
                    ${imgHtml}
                    <h3>${item.item_name}</h3>
                    <p class="price">Price: ₹${item.valuation_rate || 'N/A'}</p>
                    <div class="actions">
                        <button class="view-btn" data-name="${item.name}">View Details</button>
                        <button class="cart-btn" data-code="${item.item_code}">Add to Cart</button>
                    </div>
                `;

                grid.appendChild(card);
            });

            container.appendChild(grid);

            // Add event listeners for buttons
            document.querySelectorAll(".view-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const name = e.target.dataset.name;
                    window.location.href = `/item-details?name=${encodeURIComponent(name)}`;
                });
            });

            document.querySelectorAll(".cart-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const code = e.target.dataset.code;
                    addToCart(code);
                });
            });

        } else {
            container.innerHTML = "<p>No items found.</p>";
        }

    } catch (error) {
        console.error("🚨 Error fetching items:", error);
        container.innerHTML = "<p>Error loading items. Try again later.</p>";
    }
}

// 🛒 Add to Cart function
async function addToCart(itemCode) {
    try {
        const res = await fetch("/api/method/my_custom.api.home.add_to_cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_code: itemCode, qty: 1 })
        });

        const data = await res.json();
        console.log("🛍️ Add to Cart Response:", data);

        if (data.message) {
            alert("✅ " + data.message);
        } else {
            alert("❌ " + (data.error || "Failed to add to cart."));
        }
    } catch (err) {
        console.error("🚨 Add to cart error:", err);
        alert("⚠️ Something went wrong while adding to cart.");
    }
}

// 🚀 Load items on DOM ready
document.addEventListener("DOMContentLoaded", fetchItems);

console.log("✅ home.js initialized successfully!");
