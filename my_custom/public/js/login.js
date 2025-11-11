// document.addEventListener("DOMContentLoaded", function () {
//   const form = document.querySelector("#loginForm");
//   const msg = document.getElementById("loginMsg");

//   form.addEventListener("submit", async function (e) {
//     e.preventDefault();

//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     msg.innerText = "Logging in...";
//     msg.style.color = "gray";

//     try {
//       const res = await fetch("/api/method/my_custom.api.home.user_login", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ email, password }),
//       });

//       const data = await res.json();
//       console.log("Login Response:", data);

//       if (data.status === "success") {
//         msg.innerText = "Login successful! Redirecting...";
//         msg.style.color = "green";

//         setTimeout(() => {
//           window.location.href = data.redirect || "/home";
//         }, 1000);
//       } else {
//         msg.innerText = data.message || "Invalid login!";
//         msg.style.color = "red";
//       }
//     } catch (error) {
//       console.error("Login Error:", error);
//       msg.innerText = "Connection error.";
//       msg.style.color = "red";
//     }
//   });
// });


document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#loginForm");
  const msg = document.getElementById("loginMsg");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    msg.innerText = "Logging in...";
    msg.style.color = "gray";

    try {
      const res = await fetch("/api/method/my_custom.api.home.user_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include" // ✅ Important: allows cookies
      });

      const data = await res.json();
      console.log("Login Response:", data);

      if (data.status === "success") {
        msg.innerText = "Login successful! Redirecting...";
        msg.style.color = "green";

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = data.redirect || "/home";
        }, 1200);
      } else {
        msg.innerText = data.message || "Invalid login!";
        msg.style.color = "red";
      }
    } catch (error) {
      console.error("Login Error:", error);
      msg.innerText = "Connection error.";
      msg.style.color = "red";
    }
  });
});
