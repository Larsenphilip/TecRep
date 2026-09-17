
// session check

async function checkSession() {

    const response = await fetch("/api/auth/check-session");

    if (!response.ok) {

        window.location.href = "index.html";
        return;

    }

}

checkSession();


// session clear

const logoutButton =
    document.getElementById("logoutButton");

logoutButton.addEventListener("click", async function () {

    const response = await fetch("/api/auth/logout", {
        method: "POST"
    });

    if (response.ok) {  

        window.location.href = "index.html";

    }

});