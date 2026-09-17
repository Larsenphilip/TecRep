const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const passwordInput =
    document.getElementById("newPassword");

const togglePassword =
    document.getElementById("togglePassword");


// Show / Hide password

togglePassword.addEventListener("click", function () {

    const icon =
        togglePassword.querySelector("i");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    }
    else {

        passwordInput.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

});


// Reset password

forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value;

        const newPassword =
            document.getElementById("newPassword").value;


        const response = await fetch(
            "/api/auth/reset-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    newPassword: newPassword
                })
            }
        );


        const message =
            await response.text();


        document.getElementById("message").textContent =
            message;

    }
);