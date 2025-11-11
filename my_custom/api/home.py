import frappe
import json
from frappe.utils.password import update_password 
from frappe.auth import LoginManager



@frappe.whitelist(allow_guest=True)
def user_signup(full_name, email, password):
    """Register a new user"""
    try:
        # Check if email already exists
        if frappe.db.exists("User", email):
            return {"status": "error", "message": "Email already registered."}

        # Create new user
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": full_name,
            "send_welcome_email": 0,
            "enabled": 1,
            "new_password": password
        })
        user.insert(ignore_permissions=True)
        frappe.db.commit()

        return {"status": "success", "message": "User created successfully."}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Signup Error")
        return {"status": "error", "message": str(e)}



###### User Signup API ######
# @frappe.whitelist(allow_guest=True)
# def user_signup():
#     """Signup API - Create a new User (for guest frontend signup)"""
#     try:
#         # ✅ Parse JSON from request
#         if not frappe.request.data:
#             return {"status": "error", "message": "No data received"}

#         data = json.loads(frappe.request.data)

#         email = data.get("email")
#         full_name = data.get("full_name")
#         password = data.get("password")

#         # ✅ Validate required fields
#         if not email or not full_name or not password:
#             return {"status": "error", "message": "All fields are required"}

#         # ✅ Check if user already exists
#         if frappe.db.exists("User", email):
#             return {"status": "error", "message": "User already exists"}

#         # ✅ Create new user document
#         user = frappe.get_doc({
#             "doctype": "User",
#             "email": email,
#             "first_name": full_name,
#             "enabled": 1,
#             "send_welcome_email": 0,
#         })
#         user.insert(ignore_permissions=True)

#         # ✅ Set the password securely
#         update_password(email, password)

#         frappe.db.commit()

#         return {
#             "status": "success",
#             "message": "User account created successfully!"
#         }

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "User Signup API Error")
#         return {
#             "status": "error",
#             "message": f"Something went wrong: {str(e)}"
#         }


###### User Login API ######


@frappe.whitelist(allow_guest=True)
def user_login():
    """Custom Login API - logs in user and creates Customer using full name if not exists"""
    try:
        data = frappe.local.form_dict
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {"status": "error", "message": "Email and password required"}

        # ✅ Authenticate user
        login_manager = LoginManager()
        login_manager.authenticate(user=email, pwd=password)
        login_manager.post_login()

        # ✅ Set session cookie manually (important for frontend redirects)
        frappe.local.response["session_id"] = frappe.session.sid
        frappe.local.cookie_manager.set_cookie("sid", frappe.session.sid)

        # ✅ Fetch the logged-in user doc
        user_doc = frappe.get_doc("User", email)
        full_name = user_doc.full_name or user_doc.first_name or email

        # ✅ Check if Customer exists for this user
        if not frappe.db.exists("Customer", {"customer_name": full_name}):
            customer = frappe.get_doc({
                "doctype": "Customer",
                "customer_name": full_name,
                "customer_type": "Individual",
                "customer_group": "All Customer Groups",
                "territory": "All Territories",
                "email_id": email
            })
            customer.insert(ignore_permissions=True)
            frappe.db.commit()

        return {
            "status": "success",
            "message": "Login successful!",
            "redirect": "/home"
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "User Login API Error")
        return {"status": "error", "message": f"Login failed: {str(e)}"}


# ######## Get all available items #########

@frappe.whitelist(allow_guest=False)
def get_items():
    """Fetch available items from the ERPNext Item DocType"""
    try:
        items = frappe.get_all(
            "Item",
            filters={"disabled": 0},
            fields=["name", "item_name", "item_code", "description", "image", "valuation_rate"],
            order_by="modified desc",
            limit_page_length=20
        )

        return {"items": items}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_items API Error")
        return {"error": str(e)}


# 🛒 Add to Cart 

@frappe.whitelist()
def add_to_cart(item_code, qty=1):
    """
    Add item to user's cart.
    Each logged-in user will have a Quotation (acting as a shopping cart).
    """
    try:
        user = frappe.session.user

        # Prevent guest users
        if user == "Guest":
            return {"error": "Please log in to add items to your cart."}

        # Check or create Customer
        customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
        if not customer:
            customer_doc = frappe.get_doc({
                "doctype": "Customer",
                "customer_name": user.split("@")[0],
                "email_id": user,
                "customer_group": "All Customer Groups",
                "territory": "All Territories"
            })
            customer_doc.insert(ignore_permissions=True)
            customer = customer_doc.name

        # Find or create a draft Quotation (Cart)
        quotation_name = frappe.db.get_value(
            "Quotation", {"party_name": customer, "docstatus": 0}, "name"
        )
        if quotation_name:
            quotation = frappe.get_doc("Quotation", quotation_name)
        else:
            quotation = frappe.get_doc({
                "doctype": "Quotation",
                "party_name": customer,
                "quotation_to": "Customer",
            })

        # ✅ Fetch item price from Item Price or Item master
        price = (
            frappe.db.get_value("Item Price", {"item_code": item_code}, "price_list_rate")
            or frappe.db.get_value("Item", item_code, "standard_rate")
            or 0
        )

        # Check if item already in cart
        existing = next((i for i in quotation.items if i.item_code == item_code), None)
        if existing:
            existing.qty += int(qty)
        else:
            quotation.append("items", {
                "item_code": item_code,
                "qty": int(qty),
                "rate": price,             # ✅ Set price here
                "price_list_rate": price   # ✅ Also set for consistency
            })

        quotation.save(ignore_permissions=True)
        frappe.db.commit()

        return {"message": f"{item_code} added to cart successfully!"}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "add_to_cart API Error")
        return {"error": str(e)}



######## Get single item details #########


@frappe.whitelist(allow_guest=True)
def get_item_details(name):
    """Fetch single item details along with price"""
    try:
        # Try to find by both name and item_name
        item = frappe.db.get_value(
            "Item",
            {"name": name},
            ["name", "item_name", "item_code", "description", "image", "valuation_rate"],
            as_dict=True,
        )

        if not item:
            item = frappe.db.get_value(
                "Item",
                {"item_name": name},
                ["name", "item_name", "item_code", "description", "image", "valuation_rate"],
                as_dict=True,
            )

        if not item:
            return {"message": {"error": f"Item '{name}' not found"}}

        # Get price from Item Price if available
        item_price = frappe.db.get_value(
            "Item Price",
            {"item_code": item.name},
            ["price_list_rate"],
        )

        # If Item Price not found, fallback to valuation_rate
        price = item_price if item_price else (item.valuation_rate or 0.0)

        # Return all details
        return {
            "message": {
                "name": item.name,
                "item_name": item.item_name,
                "item_code": item.item_code,
                "description": item.description,
                "image": item.image or "",
                "price": price,
            }
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_item_details API Error")
        return {"message": {"error": str(e)}}







# 🧾 Fetch Cart Items
@frappe.whitelist()
def get_cart_items():
    user = frappe.session.user
    if user == "Guest":
        return {"error": "Please log in to view your cart."}

    # Find user's Customer
    customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
    if not customer:
        return {"items": [], "total": 0}

    quotation = frappe.db.get_value(
        "Quotation", {"party_name": customer, "docstatus": 0}, "name"
    )
    if not quotation:
        return {"items": [], "total": 0}

    quotation_doc = frappe.get_doc("Quotation", quotation)
    total = sum(item.rate * item.qty for item in quotation_doc.items)

    items = []
    for i in quotation_doc.items:
        items.append({
            "name": i.name,
            "item_name": i.item_name,
            "item_code": i.item_code,
            "qty": i.qty,
            "rate": i.rate,
            "amount": i.rate * i.qty
        })

    return {"items": items, "total": total}


#  Place Order (Quotation → Sales Order)
@frappe.whitelist()
def place_order():
    """Convert user's draft quotation to a Sales Order."""
    try:
        user = frappe.session.user
        if user == "Guest":
            return {"error": "Please log in to place an order."}

        customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
        if not customer:
            return {"error": "Customer not found."}

        quotation_name = frappe.db.get_value(
            "Quotation", {"party_name": customer, "docstatus": 0}, "name"
        )
        if not quotation_name:
            return {"error": "No items in cart."}

        quotation = frappe.get_doc("Quotation", quotation_name)
        sales_order = frappe.get_doc({
            "doctype": "Sales Order",
            "customer": quotation.party_name,
            "delivery_date": frappe.utils.nowdate(),
            "items": [
                {
                    "item_code": i.item_code,
                    "qty": i.qty,
                    "rate": i.rate
                } for i in quotation.items
            ]
        })

        sales_order.insert(ignore_permissions=True)
        sales_order.submit()

        # Mark Quotation as submitted
        quotation.docstatus = 1
        quotation.save(ignore_permissions=True)
        frappe.db.commit()

        return {"message": f"Sales Order {sales_order.name} created successfully!"}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "place_order API Error")
        return {"error": str(e)}


#  Remove Item from Cart
@frappe.whitelist()
def remove_cart_item(item_code):
    user = frappe.session.user
    if user == "Guest":
        return {"error": "Please log in first."}

    customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
    quotation_name = frappe.db.get_value("Quotation", {"party_name": customer, "docstatus": 0}, "name")

    if not quotation_name:
        return {"error": "No active cart found."}

    quotation = frappe.get_doc("Quotation", quotation_name)
    quotation.items = [i for i in quotation.items if i.item_code != item_code]
    quotation.save(ignore_permissions=True)
    frappe.db.commit()

    return {"message": f"{item_code} removed from cart."}


@frappe.whitelist()
def checkout_cart():
    user = frappe.session.user
    if user == "Guest":
        return {"error": "Please log in to buy items."}

    customer = frappe.db.get_value("Customer", {"email_id": user}, "name")
    quotation_name = frappe.db.get_value("Quotation", {"party_name": customer, "docstatus": 0}, "name")

    if not quotation_name:
        return {"error": "Cart is empty."}

    quotation = frappe.get_doc("Quotation", quotation_name)
    if not quotation.items:
        return {"error": "Your cart is empty."}

    sales_order = frappe.get_doc({
        "doctype": "Sales Order",
        "customer": quotation.party_name,
        "items": [{"item_code": i.item_code, "qty": i.qty, "rate": i.rate} for i in quotation.items]
    })
    sales_order.insert(ignore_permissions=True)
    sales_order.submit()

    # Empty the cart after checkout
    quotation.docstatus = 2  # mark quotation as cancelled
    quotation.save(ignore_permissions=True)
    frappe.db.commit()

    return {"message": f"Order placed successfully! (Sales Order: {sales_order.name})"}

