// document.addEventListener("DOMContentLoaded", function () {
//   const form = document.querySelector("#signupForm");
//   const msg = document.getElementById("signupMsg");

//   form.addEventListener("submit", async function (e) {
//     e.preventDefault();

//     const full_name = document.getElementById("full_name").value;
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     msg.innerText = "Creating account...";
//     msg.style.color = "gray";

//     try {
//       const res = await fetch("/api/method/my_custom.api.home.user_signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ full_name, email, password }),
//       });

//       const data = await res.json();
//       console.log("Signup Response:", data);

//       if (data.status === "success") {
//         msg.innerText = "Signup successful! Redirecting to login...";
//         msg.style.color = "green";

//         // ⏳ Redirect to login page after short delay
//         setTimeout(() => {
//           window.location.href = "/user-login";
//         }, 1500);
//       } else {
//         msg.innerText = data.message || "Signup failed!";
//         msg.style.color = "red";
//       }
//     } catch (error) {
//       console.error("Signup Error:", error);
//       msg.innerText = "Connection error.";
//       msg.style.color = "red";
//     }
//   });
// });



document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#signupForm");
  const msg = document.getElementById("signupMsg");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    msg.innerText = "Creating account...";
    msg.style.color = "gray";

    try {
      const res = await fetch("/api/method/my_custom.api.home.user_signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password }),
      });

      const data = await res.json();
      console.log("Signup Response:", data);

      // ✅ Handle nested message response
      const result = data.message || data;

      if (result.status === "success") {
        msg.innerText = "✅ Signup successful!";
        msg.style.color = "green";

        // Redirect after delay
        setTimeout(() => {
          window.location.href = "/user-login";
        }, 1500);
      } else {
        msg.innerText = result.message || "❌ Signup failed!";
        msg.style.color = "red";
      }
    } catch (error) {
      console.error("Signup Error:", error);
      msg.innerText = "⚠️ Connection error. Please try again.";
      msg.style.color = "red";
    }
  });
});

