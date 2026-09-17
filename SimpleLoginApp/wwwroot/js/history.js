// Session Check

async function checkSession() {

    try {

        const response =
            await fetch("/api/auth/check-session");

        if (!response.ok) {
            window.location.href = "index.html";
            return false;
        }

        return true;

    } catch (error) {

        console.error("Session check failed:", error);

        window.location.href = "index.html";

        return false;
    }
}

// Load user's reference number

async function loadReferenceNumber() {

    const refInput =
        document.getElementById("refNumber");

    if (!refInput) {
        return;
    }

    try {

        refInput.value = "Loading...";

        const response =
            await fetch("/api/history/reference", {
                method: "GET",
                credentials: "include"
            });


        if (response.status === 401) {

            window.location.href = "index.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Unable to get reference number."
            );
        }


        const data = await response.json();


        refInput.value =
            data.referenceNumber || "";


    } catch (error) {

        console.error(
            "Reference loading error:",
            error
        );

        refInput.value = "";

        const message =
            document.getElementById("historyMessage");

        if (message) {

            message.textContent =
                "Unable to load reference number.";
        }
    }
}

async function loadMyHistory() {


    try {

        const response =
            await fetch("/api/history/my-history", {
                method: "GET",
                credentials: "include"
            });


        if (response.status === 401) {

            window.location.href = "index.html";

            return null;
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load history."
            );
        }


        const data =
            await response.json();


        // No existing record

        if (!data.exists) {

            return data;
        }


        // Populate form

        document.getElementById("refNumber").value =
            data.referenceNumber || "";

        document.getElementById("entryDate").value =
            data.entryDate || "";

        document.getElementById("patientName").value =
            data.patientName || "";

        document.getElementById("dob").value =
            data.dob || "";

        document.getElementById("mobile").value =
            data.mobile || "";

        document.getElementById("email").value =
            data.email || "";

        document.getElementById("bloodGroup").value =
            data.bloodGroup || "";

        document.getElementById("procedure").value =
            data.procedureName || "";

        document.getElementById("referredBy").value =
            data.referredBy || "";

        document.getElementById("chiefComplaint").value =
            data.chiefComplaint || "";


        const title =
            document.getElementById("historyTitle");

        if (title) {

            title.textContent = "Edit History";
        }


        return data;

    }
    catch (error) {

        console.error(
            "Load history error:",
            error
        );

        return null;
    }
}

// Save history

async function saveHistory(event) {

    event.preventDefault();


    const saveButton =
        document.getElementById("saveHistoryBtn");

    const message =
        document.getElementById("historyMessage");

 // Disable button to prevent double submission
    saveButton.disabled = true;

    message.textContent = "Saving...";

 // Get values from form

    const historyData = {

        // ReferenceNumber is intentionally NOT trusted.
        // Backend generates/retrieves it.

        EntryDate:
            document.getElementById("entryDate").value,

        PatientName:
            document.getElementById("patientName").value.trim(),

        DOB:
            document.getElementById("dob").value,

        Mobile:
            document.getElementById("mobile").value.trim(),

        Email:
            document.getElementById("email").value.trim(),

        BloodGroup:
            document.getElementById("bloodGroup").value,

        ProcedureName:
            document.getElementById("procedure").value.trim(),

        ReferredBy:
            document.getElementById("referredBy").value.trim(),

        ChiefComplaint:
            document.getElementById("chiefComplaint").value.trim()
    };

    // Send to backend
    
    try {

        const response =
            await fetch("/api/history/save", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify(historyData)
            });

       // Session expired
       
        if (response.status === 401) {

            window.location.href = "index.html";

            return;
        }


        // Get response


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save history."
            );
        }
        // Display reference number returned by backend
        

        document.getElementById("refNumber").value =
            data.referenceNumber;


        message.textContent =
            data.message || "History saved successfully.";

        // Optional: change heading
        

        const title =
            document.getElementById("historyTitle");

        if (title) {

            title.textContent =
                "History Entry Saved";
        }


    } catch (error) {

        console.error(
            "Save history error:",
            error
        );

        message.textContent =
            error.message ||
            "An error occurred while saving.";
    }


    // Enable button again


    saveButton.disabled = false;
}

// Clear form

function clearHistoryForm() {

  

    const form =
        document.getElementById("historyForm");

    if (!form) {
        return;
    }

    // Clear all form fields
    form.reset();

    // Clear message
    const message =
        document.getElementById("historyMessage");

    if (message) {
        message.textContent = "";
    }

    // Clear validation messages
    form.querySelectorAll("input, select, textarea").forEach(
        function(field) {
            field.setCustomValidity("");
        }
    );

    // Keep reference number
    loadReferenceNumber();


}


    // Logout


async function logout() {

    try {

        const response =
            await fetch("/api/auth/logout", {

                method: "POST",

                credentials: "include"
            });


        if (response.ok) {

            window.location.href = "index.html";

        }

    } catch (error) {

        console.error(
            "Logout failed:",
            error
        );
    }
}

// Setup entry date validation
function setupEntryDateValidation() {

    const entryDate =
        document.getElementById("entryDate");

    if (!entryDate) {
        return;
    }


    // -----------------------------------------
    // Get today's date
    // -----------------------------------------

    const today =
        new Date();


    today.setHours(0, 0, 0, 0);


    // -----------------------------------------
    // Get yesterday
    // -----------------------------------------

    const yesterday =
        new Date(today);

    yesterday.setDate(
        yesterday.getDate() - 1
    );


    // -----------------------------------------
    // Convert to YYYY-MM-DD
    // -----------------------------------------

    function formatDate(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }


    const todayString =
        formatDate(today);

    const yesterdayString =
        formatDate(yesterday);


    // -----------------------------------------
    // HTML date input restrictions
    // -----------------------------------------

    entryDate.min =
        yesterdayString;

    entryDate.max =
        todayString;


    // -----------------------------------------
    // Default to today if empty
    // -----------------------------------------

    if (!entryDate.value) {

        entryDate.value =
            todayString;
    }


    // -----------------------------------------
    // Validate when changed
    // -----------------------------------------

    entryDate.addEventListener(
        "change",
        function () {

            if (
                this.value !== todayString &&
                this.value !== yesterdayString
            ) {

                showHistoryMessage(
                    "Entry date can only be today or yesterday.",
                    "error"
                );

                this.value =
                    todayString;

                return;
            }


            clearHistoryMessage();
        }
    );
}

// Page initialization

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Check session first
       

        const loggedIn =
            await checkSession();


        if (!loggedIn) {
            return;
        }



        // Set today's date

        // const dateInput =
        //     document.getElementById("entryDate");

        // if (dateInput && !dateInput.value) {

        //     const today =
        //         new Date().toISOString().split("T")[0];

        //     dateInput.value = today;
        // }

        setupEntryDateValidation();
       
        const historyData = await loadMyHistory();

        if (historyData && !historyData.exists) {

            await loadReferenceNumber();
        }


        // Save button

        const historyForm =
            document.getElementById("historyForm");

        if (historyForm) {

            historyForm.addEventListener(
                "submit",
                saveHistory
            );
        }


        // Clear button

        const clearButton =
            document.getElementById(
                "clearHistoryBtn"
            );

        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearHistoryForm
            );
        }


        // Logout

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );
        }

    }
);

// Patient Name Validation
// Only alphabets and spaces allowed


const patientNameInput =
    document.getElementById("patientName");

if (patientNameInput) {

    // Prevent invalid characters while typing
    patientNameInput.addEventListener(
        "keydown",
        function(event) {

            // Allow control keys
            if (
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                event.key === "Backspace" ||
                event.key === "Delete" ||
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown" ||
                event.key === "Tab" ||
                event.key === "Home" ||
                event.key === "End"
            ) {
                return;
            }

            // Only A-Z, a-z and space
            if (!/^[A-Za-z ]$/.test(event.key)) {

                event.preventDefault();

                showValidationMessage(
                    patientNameInput,
                    "Only alphabets and spaces are allowed."
                );
            }
        }
    );


    // Handle paste and anything inserted by browser
    patientNameInput.addEventListener(
        "input",
        function() {

            const originalValue =
                this.value;

            const cleanedValue =
                originalValue.replace(
                    /[^A-Za-z ]/g,
                    ""
                );

            if (originalValue !== cleanedValue) {

                this.value = cleanedValue;

                showValidationMessage(
                    patientNameInput,
                    "Only alphabets and spaces are allowed."
                );
            }
            else {

                clearValidationMessage(
                    patientNameInput
                );
            }
        }
    );
}

function showValidationMessage(input, message) {

    input.setCustomValidity(message);

    input.reportValidity();
}


function clearValidationMessage(input) {

    input.setCustomValidity("");
}

// Mobile Number Validation
// Only digits allowed

const mobileInput =
    document.getElementById("mobile");

if (mobileInput) {

    // Prevent non-numeric keys
    mobileInput.addEventListener(
        "keydown",
        function(event) {

            // Allow control/navigation keys
            if (
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                event.key === "Backspace" ||
                event.key === "Delete" ||
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown" ||
                event.key === "Tab" ||
                event.key === "Home" ||
                event.key === "End"
            ) {
                return;
            }

            // Only 0-9
            if (!/^[0-9]$/.test(event.key)) {

                event.preventDefault();

                showValidationMessage(
                    mobileInput,
                    "Only numbers are allowed."
                );
            }
        }
    );


    // Handle paste / mobile input
    mobileInput.addEventListener(
        "input",
        function() {

            const originalValue =
                this.value;

            const cleanedValue =
                originalValue
                    .replace(/[^0-9]/g, "")
                    .slice(0, 10);

            if (originalValue !== cleanedValue) {

                this.value = cleanedValue;

                showValidationMessage(
                    mobileInput,
                    "Only numbers are allowed."
                );
            }
            else {

                clearValidationMessage(
                    mobileInput
                );
            }
        }
    );
}

// DOB Validation

const dobInput =
    document.getElementById("dob");

if (dobInput) {

    const today =
        new Date();


    // Maximum DOB
    // Must be OLDER than 10 years.

    const maxDob =
        new Date(
            today.getFullYear() - 10,
            today.getMonth(),
            today.getDate() - 1
        );


    // Minimum DOB
    // Must be YOUNGER than 100 years.


    const minDob =
        new Date(
            today.getFullYear() - 100,
            today.getMonth(),
            today.getDate() + 1
        );


    // Convert date to yyyy-MM-dd
  
    function formatDate(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


   // Set allowed date range
  
    dobInput.min =
        formatDate(minDob);

    dobInput.max =
        formatDate(maxDob);


    // Validate selected DOB

    dobInput.addEventListener(
        "change",
        function() {

            if (!this.value) {

                clearValidationMessage(
                    dobInput
                );

                return;
            }


            const selectedDate =
                new Date(
                    this.value + "T00:00:00"
                );


            if (
                selectedDate < minDob ||
                selectedDate > maxDob
            ) {

                showValidationMessage(
                    dobInput,
                    "Patient age must be more than 10 years and less than 100 years."
                );

                this.value = "";

            }
            else {

                clearValidationMessage(
                    dobInput
                );
            }
        }
    );
}