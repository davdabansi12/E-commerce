# import frappe
# from frappe.utils.password import check_password

# # SIGNUP API
# @frappe.whitelist(allow_guest=True)
# def signup(email, password, first_name=None, last_name=None):
#     if frappe.db.exists("User", email):
#         return {"status": "fail", "message": "User already exists"}
#     try:
#         user = frappe.get_doc({
#             "doctype": "User",
#             "email": email,
#             "first_name": first_name or "",
#             "last_name": last_name or "",
#             "enabled": 1,
#             "new_password": password
#         })
#         user.insert(ignore_permissions=True)
#         frappe.db.commit()
#         return {
#             "status": "success",
#             "message": "User registered successfully",
#             "user": {"full_name": f"{first_name or ''} {last_name or ''}".strip(), "email": email}
#         }
#     except Exception as e:
#         return {"status": "fail", "message": str(e)}

# # in ecommerce_app/api/home.py
# import frappe
# from frappe.utils.password import check_password
# from frappe import _

# @frappe.whitelist(allow_guest=True)
# def login(email, password):
#     try:
#         user = frappe.get_doc("User", email)
#     except frappe.DoesNotExistError:
#         return {"status": "fail", "message": "User not found"}

#     if not user.enabled:
#         return {"status": "fail", "message": "User disabled"}

#     if check_password(user.name, password):
#         frappe.local.login_manager.authenticate(user.name, password)
#         frappe.local.login_manager.post_login()
#         return {
#             "status": "success",
#             "message": "Login successful",
#             "user": {
#                 "full_name": user.full_name,
#                 "email": user.email
#             }
#         }
#     else:
#         return {"status": "fail", "message": "Incorrect password"}


# # LOGOUT API
# @frappe.whitelist()
# def logout():
#     frappe.destroy_logged_sessions(frappe.session.user)
#     return {"status": "success", "message": "Logged out successfully"}

# # PROFILE API
# @frappe.whitelist()
# def profile():
#     if frappe.session.user == "Guest":
#         return {"status": "fail", "message": "Login required"}
#     user = frappe.get_doc("User", frappe.session.user)
#     return {
#         "status": "success",
#         "profile": {
#             "full_name": user.full_name,
#             "email": user.email,
#             "roles": [r.role for r in user.get("roles")]
#         }
#     }
# # ecommerce_app/api/home.py

# @frappe.whitelist(allow_guest=True)
# def items():
#     """
#     Fetch active items from ERPNext Item DocType including image
#     """
#     products = frappe.get_all(
#         "Item",
#         filters={"disabled": 0},
#         fields=["item_code", "item_name", "description", "standard_rate", "image"]
#     )

#     return {
#         "status": "success",
#         "products": products
#     }

# @frappe.whitelist(allow_guest=True)
# def get_item(code):
#     """
#     Fetch single item by item_code
#     """
#     item = frappe.get_doc("Item", code)
#     return {
#         "status": "success",
#         "item": {
#             "item_code": item.name,
#             "item_name": item.item_name,
#             "description": item.description,
#             "price": item.standard_rate,
#             "image": item.image
#         }
#     }




# #ADD TO CART
# @frappe.whitelist()
# def add_to_cart(item_code, quantity=1):
#     """
#     Adds an item to the user's cart.
#     Requires user to be logged in.
#     """
#     # Check if user is logged in
#     if frappe.session.user == "Guest":
#         return {"status": "fail", "message": "Login required"}

#     # Get the item
#     try:
#         item = frappe.get_doc("Item", item_code)
#     except frappe.DoesNotExistError:
#         return {"status": "fail", "message": "Item not found"}

#     # Initialize cart in session if not exists
#     if not frappe.session.get("cart"):
#         frappe.local.session["cart"] = []

#     # Add item to cart
#     cart = frappe.session["cart"]
#     cart.append({
#         "item_code": item.item_code,
#         "item_name": item.item_name,
#         "description": item.get("description"),
#         "rate": item.get("standard_rate"),
#         "quantity": int(quantity)
#     })
#     frappe.db.commit()

#     return {"status": "success", "message": f"{item.item_name} added to cart", "cart": cart}



# @frappe.whitelist()
# def get_cart():
#     """
#     Returns the current user's cart
#     """
#     if frappe.session.user == "Guest":
#         return {"status": "fail", "message": "Login required"}

#     cart = frappe.session.get("cart", [])
#     return {"status": "success", "cart": cart}

import frappe
from frappe.utils.password import check_password

# ------------------ SIGNUP ------------------
@frappe.whitelist(allow_guest=True)
def signup(email, password, first_name=None, last_name=None):
    if frappe.db.exists("User", email):
        return {"status":"fail","message":"User already exists"}
    user = frappe.get_doc({
        "doctype":"User", "email":email, "first_name":first_name or "",
        "last_name":last_name or "", "enabled":1, "new_password":password
    }).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"status":"success","message":"User registered successfully","user":{"full_name":f"{first_name or ''} {last_name or ''}".strip(),"email":email}}

# ------------------ LOGIN ------------------
@frappe.whitelist(allow_guest=True)
def login(email, password):
    try: user = frappe.get_doc("User", email)
    except frappe.DoesNotExistError: return {"status":"fail","message":"User not found"}
    if not user.enabled: return {"status":"fail","message":"User disabled"}
    if check_password(user.name, password):
        frappe.local.login_manager.authenticate(user.name,password)
        frappe.local.login_manager.post_login()
        return {"status":"success","message":"Login successful","user":{"full_name":user.full_name,"email":user.email}}
    return {"status":"fail","message":"Incorrect password"}

# ------------------ LOGOUT ------------------
@frappe.whitelist()
def logout():
    frappe.destroy_logged_sessions(frappe.session.user)
    return {"status":"success","message":"Logged out successfully"}

# ------------------ PROFILE ------------------
@frappe.whitelist()
def profile():
    if frappe.session.user=="Guest": return {"status":"fail","message":"Login required"}
    user = frappe.get_doc("User", frappe.session.user)
    return {"status":"success","profile":{"full_name":user.full_name,"email":user.email,"roles":[r.role for r in user.get("roles")]}}

# ------------------ ITEMS ------------------
@frappe.whitelist(allow_guest=True)

@frappe.whitelist()
def items():
    """Fetch all items to display on home page with proper image URLs"""

    # Fetch all active items
    item_list = frappe.get_all(
        "Item",
        filters={"disabled": 0},  # only active items
        fields=["name as item_code", "item_name", "item_group", "description", "valuation_rate", "image"]
    )
    frappe.log_error("ijyigofjhigjhiojy",item_list)
    # Process each item
    for item in item_list:
        # Standardize price key for frontend
        item["price"] = item["valuation_rate"]

        # Handle image
        if item.get("image"):
            # Get actual URL of attached File
            try:
                file_doc = frappe.get_doc("File", item["image"])
                
                item["image"] = file_doc.file_url
            except frappe.DoesNotExistError:
                item["image"] = "/assets/ecommerce_app/image/placeholder.png"
        else:
            # Fallback if no image set
            item["image"] = "/assets/ecommerce_app/image/placeholder.png"

    return {"status": "success", "products": item_list}





#======= item with image code 
# @frappe.whitelist()
# def items():
#     """Fetch all items to display on home page"""
#     item_list = frappe.get_all(
#         "Item",
#         fields=["name as item_code", "item_name", "item_group", "description", "valuation_rate", "image"],
#         filters={"disabled": 0}  # optional: only active items
#     )
#     frappe.log_error("aasdasfdgfhgvj",item_list)
   
#     for item in item_list:
#         frappe.log_error("imagseeee",item.image)
#         item["price"] = item["valuation_rate"]  # standardize price key for JS
#         if not item.get("image"):
#             item["image"] = "/assets/ecommerce_app/image/placeholder.png"  # fallback image
#     return {"status": "success", "products": item_list}


    # map results to friendly keys expected by frontend
    # mapped = []
    # for p in products:
    #     mapped.append({
    #         "item_code": p.get("name"),
    #         "item_name": p.get("item_name"),
    #         "description": p.get("description") or "",
    #         "price": p.get("standard_rate") or 0,
    #         "image": p.get("image") or ""
    #     })

    # return {"status": "success", "products": mapped}

@frappe.whitelist(allow_guest=True)
def get_item(code):
    item = frappe.get_doc("Item", code)
    return {"status":"success","item":{"item_code":item.name,"item_name":item.item_name,"description":item.description,"price":item.standard_rate,"image":item.image}}

# ------------------ CART ------------------
@frappe.whitelist()
def add_to_cart(item_code, quantity=1):
    if frappe.session.user=="Guest": return {"status":"fail","message":"Login required"}
    item = frappe.get_doc("Item", item_code)
    if not frappe.session.get("cart"): frappe.local.session["cart"]=[]
    frappe.session["cart"].append({"item_code":item.item_code,"item_name":item.item_name,"description":item.get("description"),"rate":item.get("standard_rate"),"quantity":int(quantity)})
    frappe.db.commit()
    return {"status":"success","message":f"{item.item_name} added to cart","cart":frappe.session["cart"]}

@frappe.whitelist()
def get_cart():
    if frappe.session.user=="Guest": return {"status":"fail","message":"Login required"}
    cart = frappe.session.get("cart",[])
    return {"status":"success","cart":cart}


# ------------------ CREATE QUOTATION ------------------
@frappe.whitelist()
def create_quotation(customer_email, items):
    """
    Creates a Quotation in ERPNext with given items for the customer
    items = [{"item_code":"ITEM001","qty":2,"rate":50}]
    """
    import json
    if frappe.session.user == "Guest":
        return {"status":"fail","message":"Login required"}

    try:
        customer = frappe.get_doc("Customer", {"email_id": customer_email})
    except frappe.DoesNotExistError:
        return {"status":"fail","message":"Customer not found"}

    quotation = frappe.get_doc({
        "doctype": "Quotation",
        "customer": customer.name,
        "transaction_date": frappe.utils.nowdate(),
        "items": []
    })

    items = json.loads(items) if isinstance(items, str) else items
    for i in items:
        quotation.append("items", {
            "item_code": i.get("item_code"),
            "qty": i.get("qty"),
            "rate": i.get("rate")
        })
    quotation.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"status":"success","message":"Quotation created","quotation":quotation.name}

# ------------------ CLEAR CART ------------------
@frappe.whitelist()
def clear_cart():
    if frappe.session.user == "Guest":
        return {"status":"fail","message":"Login required"}
    frappe.local.session["cart"] = []
    return {"status":"success","message":"Cart cleared"}


