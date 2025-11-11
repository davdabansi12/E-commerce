console.log("✅ item-details.js loaded");

async function loadItemDetails() {
  // ✅ Extract item name from URL (e.g. ?name=Ball)
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");

  // ✅ Match correct HTML ID
  const container = document.getElementById("itemDetails");

  if (!container) {
    console.error("❌ Element #itemDetails not found in HTML!");
    return;
  }

  if (!name) {
    container.innerHTML = "<p>⚠️ Item not specified in URL.</p>";
    return;
  }

  try {
    // ✅ Fetch item details from backend API
    const res = await fetch(`/api/method/my_custom.api.home.get_item_details?name=${encodeURIComponent(name)}`);
    const data = await res.json();

    console.log("📦 API Response:", data);

    // ✅ Handle double message wrapping
    const item = data.message?.message || data.message;

    // ✅ Validate the item data
    if (!item || item.error) {
      container.innerHTML = `<p>❌ Item not found or invalid data received.</p>`;
      return;
    }

    // ✅ Render item details
    container.innerHTML = `
      <div class="item-card">
        ${item.image ? `<img src="${item.image}" alt="${item.item_name}" class="item-img">`
                      : `<div class="no-image">No Image</div>`}

        <div class="item-info">
          <h2>${item.item_name || "Unnamed Item"}</h2>
          <p><strong>Code:</strong> ${item.item_code || "N/A"}</p>
          <p><strong>Description:</strong> ${item.description || "No description available"}</p>
          <p class="price"><strong>Price:</strong> ₹${item.price ?? "N/A"}</p>

          <div class="buttons">
            <button class="cart-btn" onclick="addToCart('${item.item_code}')"> Add to Cart</button>
            <button class="back-btn" onclick="window.location.href='/home'">⬅ Back to Home</button>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("🚨 Error fetching item details:", error);
    container.innerHTML = `<p>⚠️ Error loading item details. Check console for more info.</p>`;
  }
}

async function addToCart(itemCode) {
  try {
    const res = await fetch("/api/method/my_custom.api.home.add_to_cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_code: itemCode, qty: 1 })
    });

    const data = await res.json();
    alert(data.message || "✅ Added to cart!");
  } catch (error) {
    console.error("🚨 Add to cart error:", error);
    alert("⚠️ Error adding to cart. Please try again.");
  }
}

// ✅ Load item details when page is ready
document.addEventListener("DOMContentLoaded", loadItemDetails);
