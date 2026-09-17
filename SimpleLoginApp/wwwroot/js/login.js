const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = document.getElementById("username").value;

    const password = document.getElementById("password").value;


    const response = await fetch("/api/auth/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
        
            username: username,
            password: password

        })

    });


    const message = await response.text();


    if (response.ok) {

        // If C# returns 200 OK
        window.location.href = "home.html";

    }
    else {

        // If C# returns an error such as 401
        document.getElementById("message").textContent = message;

    }

});

// ── Password show / hide (eye button on login page) ─────────
const togglePasswordBtn = document.getElementById("togglePassword");
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function () {
        const pwInput = document.getElementById("password");
        const icon    = this.querySelector("i");
        if (pwInput.type === "password") {
            pwInput.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            pwInput.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}
