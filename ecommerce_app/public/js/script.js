// // -------- User --------
// function logoutUser() {
//     localStorage.removeItem("user");
//     localStorage.removeItem("cart");
//     window.location.href = "/assets/ecommerce_app/loginuser.html";
// }

// function loginUser(event){
//     event.preventDefault();
//     const email = document.getElementById("username").value.trim();
//     const password = document.getElementById("password").value.trim();
//     if(!email || !password){ alert("Enter email and password"); return; }

//     fetch("http://127.0.0.1:8001/api/method/ecommerce_app.api.home.login", {
//         method:"POST",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({email,password})
//     })
//     .then(res=>res.json())
//     .then(data=>{
//         if(data.status==="success"){
//             localStorage.setItem("user", JSON.stringify(data.user));
//             window.location.href="/assets/ecommerce_app/home.html";
//         } else alert(data.message || "Login failed");
//     })
//     .catch(err=>{ console.error(err); alert("Error connecting to server"); });
// }

// function signupUser(event){
//     event.preventDefault();
//     const full_name = document.getElementById("full_name").value.trim();
//     const email = document.getElementById("signup_email").value.trim();
//     const password = document.getElementById("signup_password").value.trim();
//     if(!full_name || !email || !password){ alert("Fill all fields"); return; }

//     fetch("http://127.0.0.1:8001/api/method/ecommerce_app.api.home.signup", {
//         method:"POST",
//         headers:{ "Content-Type":"application/json" },
//         body: JSON.stringify({full_name,email,password})
//     })
//     .then(res=>res.json())
//     .then(data=>{
//         if(data.status==="success"){
//             alert("Signup successful! Please login.");
//             window.location.href="/assets/ecommerce_app/loginuser.html";
//         } else alert(data.message || "Signup failed");
//     })
//     .catch(err=>{ console.error(err); alert("Error connecting to server"); });
// }

// // -------- Cart --------
// function addToCart(id, name, price, img=''){
//     let cart = JSON.parse(localStorage.getItem("cart"))||[];
//     cart.push({id,name,price,img});
//     localStorage.setItem("cart", JSON.stringify(cart));
//     loadCart();
// }

// function loadCart(){
//     const container = document.getElementById("cartItems");
//     const totalBox = document.getElementById("cartTotal");
//     if(!container || !totalBox) return;

//     let cart = JSON.parse(localStorage.getItem("cart"))||[];
//     container.innerHTML="";
//     let total=0;
//     cart.forEach((item,index)=>{
//         total += item.price;
//         container.innerHTML += `
//         <div class="cart-item">
//             <img src="${item.img||'https://via.placeholder.com/50'}">
//             <span>${item.name} - $${item.price}</span>
//             <button onclick="removeFromCart(${index})">Remove</button>
//         </div>`;
//     });
//     totalBox.innerText = "Total: $" + total.toFixed(2);
// }

// function removeFromCart(index){
//     let cart = JSON.parse(localStorage.getItem("cart"))||[];
//     cart.splice(index,1);
//     localStorage.setItem("cart", JSON.stringify(cart));
//     loadCart();
// }

// function checkout(){
//     let cart = JSON.parse(localStorage.getItem("cart"))||[];
//     if(cart.length===0){ alert("Cart is empty"); return; }
//     alert("Order placed! Total: $" + cart.reduce((t,i)=>t+i.price,0).toFixed(2));
//     localStorage.removeItem("cart");
//     loadCart();
// }

// // -------- Items --------
// let allItems=[];
// function loadItems(){
//     frappe.call({
//         method:"ecommerce_app.api.home.items",
//         args:{},
//         callback:function(r){
//             allItems = r.message||[];
//             displayItems(allItems);
//         }
//     });
// }

// function displayItems(items){
//     const container = document.getElementById("itemsContainer");
//     if(!container) return;
//     if(items.length===0){ container.innerHTML="<p>No items found</p>"; return; }

//     container.innerHTML="";
//     items.forEach(item=>{
//         container.innerHTML += `
//         <div class="product">
//             <img src="${item.image||'https://via.placeholder.com/150'}">
//             <h3>${item.item_name}</h3>
//             <p>${item.description||''}</p>
//             <p>Price: $${item.standard_rate}</p>
//             <button onclick="addToCart('${item.item_code}','${item.item_name}',${item.standard_rate},'${item.image||''}')">Add to Cart</button>
//         </div>`;
//     });
// }

// function filterItems(){
//     const query = document.getElementById("searchInput").value.toLowerCase();
//     const filtered = allItems.filter(i=>i.item_name.toLowerCase().includes(query));
//     displayItems(filtered);
// }

// // -------- Item Detail --------
// function loadItemDetail(){
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");
//     if(!code) return;

//     frappe.call({
//         method:"ecommerce_app.api.home.get_item",
//         args:{code},
//         callback:function(r){
//             const container=document.getElementById("itemDetail");
//             if(!container) return;
//             if(r.message && r.message.item){
//                 const item=r.message.item;
//                 container.innerHTML = `
//                     <h2>${item.item_name}</h2>
//                     <img src="${item.image||'https://via.placeholder.com/200'}">
//                     <p>${item.description||''}</p>
//                     <p>Price: $${item.price}</p>
//                     <button onclick="addToCart('${item.item_code}','${item.item_name}',${item.price},'${item.image||''}')">Add to Cart</button>
//                 `;
//             } else container.innerHTML="<p>Item not found</p>";
//         }
//     });
// }


// ----------------- Navbar / User -----------------
document.addEventListener("DOMContentLoaded", () => {
    const loginLogoutLink = document.getElementById("loginLogoutLink");
    const profileLink = document.getElementById("profileLink");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        loginLogoutLink.innerText = "Logout";
        loginLogoutLink.href = "#";
        loginLogoutLink.onclick = () => {
            localStorage.removeItem("user");
            localStorage.removeItem("cart");
            window.location.href = "/login.html";
        };
        profileLink.style.display = "inline-block";
    } else {
        loginLogoutLink.innerText = "Login";
        loginLogoutLink.href = "/login.html";
        profileLink.style.display = "none";
    }

    // Initialize pages
    if (document.getElementById("loginForm")) initLogin();
    if (document.getElementById("signupForm")) initSignup();
    if (document.getElementById("itemsContainer")) { loadItems(); loadCart(); }
    if (document.getElementById("item-container")) loadItemPage();
    if (document.getElementById("profileContainer")) loadProfile();
});

// ----------------- LOGIN / SIGNUP -----------------
async function loginUser(email, password){
    try {
        const res = await fetch("/api/method/ecommerce_app.api.home.login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();

        if (data.message && data.message.status === "success") {
            localStorage.setItem("user", JSON.stringify(data.message.user));
            window.location.href = "/home.html";
        } else alert(data.message?.message || "Login failed");
    } catch(err) { console.error(err); alert("Error logging in"); }
}

async function signupUser(email, password, first_name, last_name){
    try {
        const res = await fetch("/api/method/ecommerce_app.api.home.signup", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password, first_name, last_name})
        });
        const data = await res.json();
        alert(data.message || "Signup complete");
        if (data.status === "success") window.location.href = "/login.html";
    } catch(err){ console.error(err); alert("Error signing up"); }
}

function initLogin(){
    document.getElementById("loginForm").addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        loginUser(email, password);
    });
}

function initSignup(){
    document.getElementById("signupForm").addEventListener("submit", e => {
        e.preventDefault();
        const first_name = document.getElementById("firstName").value;
        const last_name = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        signupUser(email, password, first_name, last_name);
    });
}

// ----------------- PROFILE -----------------
async function loadProfile(){
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){ window.location.href="/login.html"; return; }
    document.getElementById("profileName").innerText = user.full_name;

    try {
        const res = await fetch("/api/method/ecommerce_app.api.home.profile");
        const data = await res.json();
        if(data.message.status === "success"){
            const profile = data.message.profile;
            document.getElementById("profileContainer").innerHTML = `
                <p><b>Name:</b> ${profile.full_name}</p>
                <p><b>Email:</b> ${profile.email}</p>
            `;
        }
    } catch(err){ console.error(err); }
}

// ----------------- ITEMS / HOME PAGE -----------------
let allItems = [];

async function loadItems(){
    try {
        const res = await fetch("/api/method/ecommerce_app.api.home.items");
        const data = await res.json();

        if(data.message.status !== "success"){ console.error(data); return; }

        allItems = data.message.products;
        renderItems(allItems);
    } catch(err){ console.error(err); }
}

function renderItems(items){
    const container = document.getElementById("itemsContainer");
    if(!container) return;
    container.innerHTML = "";
    items.forEach(item => {
        container.innerHTML += `
        <div class="item-card">
            <div class="item-img">
                <img src="${item.img || 'https://via.placeholder.com/150'}" alt="${item.item_name}">
            </div>
            <h3>${item.item_name}</h3>
            <p>${item.description || ''}</p>
            <p>Price: $${Number(item.price).toFixed(2)}</p>
            <button onclick="addToCart('${item.item_code}','${item.item_name}',${item.price},'${item.img}')">Add to Cart</button>
        </div>`;
    });
}

function filterItems(){
    const query = document.getElementById("searchInput").value.toLowerCase();
    renderItems(allItems.filter(i => i.item_name.toLowerCase().includes(query)));
}

// ----------------- ITEM DETAIL -----------------
async function loadItemPage(){
    const code = localStorage.getItem("view_item_code");
    if(!code){ window.location.href="/home.html"; return; }

    try {
        const res = await fetch(`/api/method/ecommerce_app.api.home.get_item?code=${code}`);
        const data = await res.json();
        const item = data.message.item;
        const container = document.getElementById("item-container");
        container.innerHTML = `
            <h2>${item.item_name}</h2>
            <img src="${item.img||'https://via.placeholder.com/200'}">
            <p>${item.description}</p>
            <p>Price: $${item.price}</p>
            <input type="number" id="itemQty" value="1" min="1">
            <button onclick="addItemToCart('${item.item_code}')">Add to Cart</button>
        `;
    } catch(err){ console.error(err); }
}

function viewItem(item_code){
    localStorage.setItem("view_item_code", item_code);
    window.location.href = "/item.html";
}

// ----------------- CART -----------------
function addToCart(id, name, price, img){
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if item already exists
    const existing = cart.find(item => item.id === id);
    if(existing){
        existing.quantity += 1; // increment quantity
    } else {
        cart.push({id, name, price, img, quantity: 1});
    }

    // Save back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Reload cart sidebar
    loadCart();
}
function addItemToCart(item_code){
    const qty = parseInt(document.getElementById("itemQty").value || 1);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = allItems.find(i => i.item_code===item_code);
    if(item){
        cart.push({id:item.item_code, name:item.item_name, price:item.price, img:item.img, quantity:qty});
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        alert("Added to cart");
    }
}

function loadCart(){
    const container = document.getElementById("cartItems");
    const totalBox = document.getElementById("cartTotal");
    if(!container || !totalBox) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if(cart.length === 0){
        container.innerHTML = "<p>Cart is empty</p>";
        totalBox.innerText = "Total: $0.00";
        return;
    }

    container.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.img || 'https://via.placeholder.com/50'}" style="width:50px;height:50px;">
                <span>${item.name} x ${item.quantity} - $${(item.price*item.quantity).toFixed(2)}</span>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
    });

    totalBox.innerText = "Total: $" + total.toFixed(2);
}


function removeFromCart(index){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}


window.onload = function() {
    loadCart();  // always show current cart
};

function checkout(){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if(cart.length===0){ alert("Cart is empty"); return; }
    alert("Order placed! Total: $" + cart.reduce((t,i)=>t.price*(i.quantity||1),0).toFixed(2));
    localStorage.removeItem("cart");
    loadCart();
}


