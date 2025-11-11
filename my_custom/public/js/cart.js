console.log(" cart.js loaded");

document.addEventListener("DOMContentLoaded", loadCart);

async function loadCart() {
  const container = document.getElementById("cartItems");
  const totalSpan = document.getElementById("cartTotal");

  try {
    const res = await fetch("/api/method/my_custom.api.home.get_cart_items");
    const data = await res.json();

    console.log("Cart Data:", data);

    if (!data.message || data.message.items.length === 0) {
      container.innerHTML = "<p>Your cart is empty.</p>";
      totalSpan.innerText = "0.00";
      return;
    }

    const { items, total } = data.message;
    container.innerHTML = "";

    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "cart-item";

     div.innerHTML = `
    <div>
    <h3>${item.item_name}</h3>
    <p>${item.item_code}</p>
    <p>Qty: ${item.qty} × ₹${item.rate}</p>
    <p><strong>₹${item.amount.toFixed(2)}</strong></p>
    </div>
  <button class="remove-btn" data-code="${item.item_code}"> Remove</button>
`;

      container.appendChild(div);
    });

    totalSpan.innerText = total.toFixed(2);

    // Remove item event
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const itemCode = e.target.dataset.code;
        removeCartItem(itemCode);
      });
    });

  } catch (error) {
    console.error(" Error loading cart:", error);
    container.innerHTML = "<p>Error loading cart.</p>";
  }
}

//  Remove Item
async function removeCartItem(itemCode) {
  if (!confirm(`Remove ${itemCode} from cart?`)) return;

  try {
    const res = await fetch("/api/method/my_custom.api.home.remove_cart_item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_code: itemCode }),
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadCart(); // reload cart
  } catch (error) {
    console.error("Error removing item:", error);
  }
}

//  Buy Now
document.getElementById("buyNowBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/method/my_custom.api.home.checkout_cart", {
      method: "POST"
    });

    const data = await res.json();
    alert(data.message || data.error);

    if (data.message && data.message.includes("Order placed")) {
      window.location.href = "/home";
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Something went wrong during checkout.");
  }
});
