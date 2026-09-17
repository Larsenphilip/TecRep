document.addEventListener("DOMContentLoaded", async function () {

    // Check login session
    const loggedIn = await checkSession();

    if (!loggedIn) {
        return;
    }


    // Search form
    document
        .getElementById("searchForm")
        .addEventListener(
            "submit",
            searchHistory
        );


    // Clear button
    document
        .getElementById("clearButton")
        .addEventListener(
            "click",
            clearSearch
        );


    // Search input
    document
        .getElementById("searchInput")
        .focus();

});


// =========================================================
// CHECK SESSION
// =========================================================

async function checkSession() {

    try {

        const response = await fetch(
            "/api/auth/check-session",
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            window.location.href = "index.html";

            return false;
        }


        return true;

    }
    catch (error) {

        window.location.href = "index.html";

        return false;
    }
}


// =========================================================
// SEARCH
// =========================================================

async function searchHistory(event) {

    event.preventDefault();


    clearMessage();

    hideResults();


    const searchInput =
        document.getElementById("searchInput");


    const searchValue =
        searchInput.value.trim();


    // -----------------------------------------
    // Empty search
    // -----------------------------------------

    if (!searchValue) {

        showMessage(
            "Please enter a patient name or reference number.",
            "error"
        );

        searchInput.focus();

        return;
    }


    // -----------------------------------------
    // Prevent invalid characters
    //
    // Allowed:
    // Letters
    // Numbers
    // Space
    // /
    //
    // This supports both:
    //
    // John Kumar
    //
    // TEC15092026/01AB
    // -----------------------------------------

    if (!/^[A-Za-z0-9 /]+$/.test(searchValue)) {

        showMessage(
            "Please enter a valid patient name or reference number.",
            "error"
        );

        searchInput.focus();

        return;
    }


    const searchButton =
        document.getElementById("searchButton");


    searchButton.disabled = true;

    searchButton.textContent = "Searching...";


    try {

        // -----------------------------------------
        // Send ONE search value to backend
        // -----------------------------------------

        const params =
            new URLSearchParams();

        params.append(
            "search",
            searchValue
        );


        const response = await fetch(
            `/api/history/search?${params.toString()}`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        // -----------------------------------------
        // SESSION EXPIRED
        // -----------------------------------------

        if (response.status === 401) {

            window.location.href = "index.html";

            return;
        }


        // -----------------------------------------
        // Read response
        // -----------------------------------------

        const data =
            await response.json();


        // -----------------------------------------
        // SERVER ERROR
        // -----------------------------------------

        if (!response.ok) {

            showMessage(
                data.message ||
                "Search failed.",
                "error"
            );

            return;
        }


        // -----------------------------------------
        // NO RESULTS
        // -----------------------------------------

        if (
            !data.results ||
            data.results.length === 0
        ) {

            showMessage(
                "No patient history found.",
                "info"
            );

            return;
        }


        // -----------------------------------------
        // DISPLAY RESULTS
        // -----------------------------------------

        displayResults(data.results);


        showMessage(
            `${data.results.length} record(s) found.`,
            "success"
        );

    }
    catch (error) {

        showMessage(
            "Unable to connect to the server.",
            "error"
        );

    }
    finally {

        searchButton.disabled = false;

        searchButton.textContent = "Search";
    }
}


// =========================================================
// DISPLAY RESULTS
// =========================================================

function displayResults(results) {

    const container =
        document.getElementById(
            "resultsContainer"
        );


    container.innerHTML = "";


    results.forEach(function (patient) {

        const card =
            document.createElement("div");


        card.className =
            "patient-card";


        card.innerHTML = `

            <div class="patient-card-header">

                <div>

                    <h3>
                        ${escapeHtml(patient.patientName)}
                    </h3>

                    <span>
                        Patient Record
                    </span>

                </div>


                <div class="reference-number">

                    ${escapeHtml(
            patient.referenceNumber
        )}

                </div>

            </div>


            <div class="patient-details">

                <div class="detail">

                    <label>
                        Entry Date
                    </label>

                    <span>
                        ${escapeHtml(
            patient.entryDate
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Patient Name
                    </label>

                    <span>
                        ${escapeHtml(
            patient.patientName
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Date of Birth
                    </label>

                    <span>
                        ${escapeHtml(
            patient.dob
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Mobile
                    </label>

                    <span>
                        ${escapeHtml(
            patient.mobile
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Email
                    </label>

                    <span>
                        ${escapeHtml(
            patient.email
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Blood Group
                    </label>

                    <span>
                        ${escapeHtml(
            patient.bloodGroup
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Procedure
                    </label>

                    <span>
                        ${escapeHtml(
            patient.procedureName
        )}
                    </span>

                </div>


                <div class="detail">

                    <label>
                        Referred By
                    </label>

                    <span>
                        ${escapeHtml(
            patient.referredBy
        )}
                    </span>

                </div>


                <div class="detail full-width">

                    <label>
                        Chief Complaint
                    </label>

                    <span>
                        ${escapeHtml(
            patient.chiefComplaint
        )}
                    </span>

                </div>

            </div>

        `;


        container.appendChild(card);

    });


    document.getElementById(
        "searchResults"
    ).style.display = "block";
}


// =========================================================
// CLEAR SEARCH
// =========================================================

function clearSearch() {

    document
        .getElementById("searchInput")
        .value = "";


    hideResults();

    clearMessage();


    document
        .getElementById("searchInput")
        .focus();
}


// =========================================================
// HIDE RESULTS
// =========================================================

function hideResults() {

    document.getElementById(
        "searchResults"
    ).style.display = "none";


    document.getElementById(
        "resultsContainer"
    ).innerHTML = "";
}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(message, type) {

    const messageElement =
        document.getElementById(
            "searchMessage"
        );


    messageElement.textContent =
        message;


    messageElement.className =
        `search-message ${type}`;
}


// =========================================================
// CLEAR MESSAGE
// =========================================================

function clearMessage() {

    const messageElement =
        document.getElementById(
            "searchMessage"
        );


    messageElement.textContent = "";

    messageElement.className =
        "search-message";
}


// =========================================================
// HTML SAFETY
// =========================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


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