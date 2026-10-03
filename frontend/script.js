import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


/* ========================================
   CONFIG
========================================= */

const API_BASE_URL =
    "https://helphub-mc2q.onrender.com";


/* ========================================
   HELPER - SAVED USER
========================================= */

function getSavedUser() {

    const savedUser =
        localStorage.getItem("helphubUser");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        console.error(
            "Could not read saved user:",
            error
        );

        return null;
    }
}


/* ========================================
   HELPER - SAVE USER
========================================= */

function saveUser(user) {

    if (!user) {
        localStorage.removeItem("helphubUser");
        return;
    }

    localStorage.setItem(
        "helphubUser",
        JSON.stringify(user)
    );
}


/* ========================================
   HELPER - ESCAPE HTML
========================================= */

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


/* ========================================
   HELPER - GET ID AS STRING
========================================= */

function getIdString(value) {

    if (!value) {
        return "";
    }

    if (
        typeof value === "object" &&
        value._id
    ) {
        return String(value._id);
    }

    return String(value);
}


/* ========================================
   HELPER - FRESH FIREBASE TOKEN
========================================= */

async function getFreshToken() {

    const firebaseUser =
        auth.currentUser;

    if (!firebaseUser) {

        localStorage.removeItem(
            "firebaseToken"
        );

        throw new Error(
            "Your login session has expired. Please log in again."
        );
    }

    try {

        const token =
            await firebaseUser.getIdToken(true);

        localStorage.setItem(
            "firebaseToken",
            token
        );

        return token;

    } catch (error) {

        console.error(
            "Could not refresh Firebase token:",
            error
        );

        throw new Error(
            "Your login session has expired. Please log in again."
        );
    }
}


/* ========================================
   HELPER - AUTHENTICATED FETCH
========================================= */

async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        await getFreshToken();

    const headers =
        new Headers(
            options.headers || {}
        );

    headers.set(
        "Authorization",
        `Bearer ${token}`
    );

    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );

    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "firebaseToken"
        );

        localStorage.removeItem(
            "helphubUser"
        );

        updateNavbar(null);
        updateUserSections(null);

        try {
            await signOut(auth);
        } catch (error) {
            console.error(
                "Firebase sign out after 401 failed:",
                error
            );
        }

        throw new Error(
            "Your login session has expired. Please log in again."
        );
    }

    return response;
}


/* ========================================
   HELPER - AUTH ERROR
========================================= */

function handleAuthenticationError(
    error
) {

    console.error(
        "Authentication error:",
        error
    );

    if (
        error.message &&
        error.message.includes(
            "login session has expired"
        )
    ) {

        alert(
            "Your login session has expired.\n\nPlease log in again."
        );

        return;
    }

    alert(
        error.message ||
        "Authentication failed."
    );
}


/* ========================================
   FORMAT DATE
========================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not specified";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* ========================================
   LOAD OPPORTUNITIES
========================================= */

async function loadOpportunities() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/opportunities`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load opportunities"
            );
        }

        const opportunities =
            await response.json();

        displayOpportunities(
            opportunities
        );

    } catch (error) {

        console.error(
            "Load opportunities error:",
            error
        );

        const container =
            document.getElementById(
                "opportunities"
            );

        if (container) {

            container.innerHTML = `
                <div class="no-results">

                    <h3>
                        Unable to load opportunities
                    </h3>

                    <p>
                        Please make sure the backend server is running.
                    </p>

                </div>
            `;
        }
    }
}


/* ========================================
   DISPLAY OPPORTUNITIES
========================================= */

function displayOpportunities(
    opportunities
) {

    const container =
        document.getElementById(
            "opportunities"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !opportunities ||
        opportunities.length === 0
    ) {

        container.innerHTML = `
            <div class="no-results">

                <h3>
                    No opportunities found
                </h3>

                <p>
                    Try another search or create a new opportunity.
                </p>

            </div>
        `;

        return;
    }


    /*
     * Get the currently logged-in user once.
     */

    const user =
        getSavedUser();


    const currentUserId =
        getIdString(
            user?._id
        );


    opportunities.forEach(
        (opportunity) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "opportunity-card";


            /* ========================================
               ORGANIZATION MANAGEMENT BUTTONS
            ========================================= */

            let managementButtons =
                "";


            const opportunityOrganizationId =
                getIdString(
                    opportunity.organization
                );


            /*
             * IMPORTANT:
             *
             * An organization can manage ONLY
             * its own opportunity.
             */

            const isOwner =
                user &&
                user.role === "organization" &&
                currentUserId &&
                opportunityOrganizationId &&
                currentUserId ===
                opportunityOrganizationId;


            if (isOwner) {

                managementButtons = `

                    <button
                        type="button"
                        class="secondary-button"
                        style="
                            cursor: pointer;
                            display: inline-block;
                        "
                        onclick="editOpportunity('${opportunity._id}')"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-button"
                        style="
                            cursor: pointer;
                            display: inline-block;
                        "
                        onclick="deleteOpportunity('${opportunity._id}')"
                    >
                        Delete
                    </button>


                    <button
                        type="button"
                        class="secondary-button"
                        style="
                            cursor: pointer;
                            display: inline-block;
                        "
                        onclick="manageOpportunityVolunteers('${opportunity._id}')"
                    >
                        Manage Volunteers
                    </button>

                `;
            }


            const photoHtml =
                opportunity.photoUrl
                    ? `
                        <div style="margin-bottom: 15px;">
                            <img
                                src="${escapeHtml(
                                    opportunity.photoUrl
                                )}"
                                alt="${escapeHtml(
                                    opportunity.title
                                )}"
                                style="
                                    width: 100%;
                                    max-height: 220px;
                                    object-fit: cover;
                                    border-radius: 12px;
                                "
                            >
                        </div>
                    `
                    : "";


            card.innerHTML = `

                ${photoHtml}


                <span class="card-category">
                    ${escapeHtml(
                        opportunity.category ||
                        "General"
                    )}
                </span>


                <h3>
                    ${escapeHtml(
                        opportunity.title
                    )}
                </h3>


                <p class="card-description">
                    ${escapeHtml(
                        opportunity.description
                    )}
                </p>


                <div class="card-info">

                    <p>
                        <strong>
                            Location:
                        </strong>

                        ${escapeHtml(
                            opportunity.location
                        )}
                    </p>


                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${formatDate(
                            opportunity.date
                        )}
                    </p>


                    <p>
                        <strong>
                            Time:
                        </strong>

                        ${escapeHtml(
                            opportunity.startTime ||
                            "Not specified"
                        )}

                        ${
                            opportunity.endTime
                                ? " - " +
                                  escapeHtml(
                                      opportunity.endTime
                                  )
                                : ""
                        }
                    </p>


                    <p>
                        <strong>
                            Required Volunteers:
                        </strong>

                        ${escapeHtml(
                            opportunity.requiredVolunteers
                        )}
                    </p>

                </div>


                <div class="card-buttons">

                    <button
                        type="button"
                        class="view-button"
                        onclick="viewOpportunity('${opportunity._id}')"
                    >
                        View Details
                    </button>

                    ${managementButtons}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );
}


/* ========================================
   SEARCH OPPORTUNITIES
========================================= */

async function searchOpportunities() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!searchInput) {
        return;
    }

    const keyword =
        searchInput.value.trim();

    if (!keyword) {

        loadOpportunities();

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/opportunities/search?keyword=${encodeURIComponent(keyword)}`
            );

        if (!response.ok) {

            throw new Error(
                "Search failed"
            );
        }

        const opportunities =
            await response.json();

        displayOpportunities(
            opportunities
        );

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        const container =
            document.getElementById(
                "opportunities"
            );

        if (container) {

            container.innerHTML = `
                <div class="no-results">

                    <h3>
                        Search failed
                    </h3>

                    <p>
                        Please try again.
                    </p>

                </div>
            `;
        }
    }
}


/* ========================================
   VIEW OPPORTUNITY
========================================= */

async function viewOpportunity(id) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/opportunities/${id}`
            );

        if (!response.ok) {

            throw new Error(
                "Could not load opportunity"
            );
        }

        const opportunity =
            await response.json();

        const details =
            document.getElementById(
                "details"
            );

        if (!details) {
            return;
        }

        const user =
            getSavedUser();

        let signupButton =
            "";

        if (
            user &&
            user.role === "volunteer"
        ) {

            signupButton = `

                <button
                    class="primary-button"
                    onclick="signupForOpportunity('${opportunity._id}')"
                >
                    Sign Up
                </button>

            `;
        }

        const photoHtml =
            opportunity.photoUrl
                ? `
                    <div style="margin: 20px 0;">
                        <img
                            src="${escapeHtml(
                                opportunity.photoUrl
                            )}"
                            alt="${escapeHtml(
                                opportunity.title
                            )}"
                            style="
                                width: 100%;
                                max-height: 400px;
                                object-fit: cover;
                                border-radius: 14px;
                            "
                        >
                    </div>
                `
                : "";

        details.innerHTML = `

            <span class="details-label">
                OPPORTUNITY
            </span>


            <h2>
                ${escapeHtml(
                    opportunity.title
                )}
            </h2>


            ${photoHtml}


            <p class="details-description">
                ${escapeHtml(
                    opportunity.description
                )}
            </p>


            <div class="details-grid">

                <div class="detail-box">

                    <strong>
                        Location
                    </strong>

                    ${escapeHtml(
                        opportunity.location
                    )}

                </div>


                <div class="detail-box">

                    <strong>
                        Date
                    </strong>

                    ${formatDate(
                        opportunity.date
                    )}

                </div>


                <div class="detail-box">

                    <strong>
                        Category
                    </strong>

                    ${escapeHtml(
                        opportunity.category ||
                        "General"
                    )}

                </div>


                <div class="detail-box">

                    <strong>
                        Volunteers Needed
                    </strong>

                    ${escapeHtml(
                        opportunity.requiredVolunteers
                    )}

                </div>


                <div class="detail-box">

                    <strong>
                        Start Time
                    </strong>

                    ${escapeHtml(
                        opportunity.startTime ||
                        "Not specified"
                    )}

                </div>


                <div class="detail-box">

                    <strong>
                        End Time
                    </strong>

                    ${escapeHtml(
                        opportunity.endTime ||
                        "Not specified"
                    )}

                </div>

            </div>


            <div class="details-buttons">

                ${signupButton}


                <button
                    class="secondary-button"
                    onclick="closeDetails()"
                >
                    Close
                </button>

            </div>

        `;

        details.style.display =
            "block";

        details.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "View opportunity error:",
            error
        );

        alert(
            "Something went wrong:\n\n" +
            error.message
        );
    }
}


/* ========================================
   CLOSE DETAILS
========================================= */

function closeDetails() {

    const details =
        document.getElementById(
            "details"
        );

    if (details) {

        details.style.display =
            "none";
    }
}


/* ========================================
   SIGN UP
========================================= */

async function signupForOpportunity(
    opportunityId
) {

    try {

        const user =
            getSavedUser();

        if (
            !user ||
            user.role !== "volunteer"
        ) {

            alert(
                "Please login as a volunteer first."
            );

            return;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/signups`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        opportunityId
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not sign up:\n\n" +
                data.message
            );

            return;
        }

        alert(
            "Successfully signed up for this opportunity!"
        );

        closeDetails();

        await loadMyActivity();

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   CREATE COMBINED VOLUNTEER ACTIVITY
========================================= */

function setupCombinedVolunteerActivity() {

    const mySignups =
        document.getElementById(
            "mySignups"
        );

    const myHours =
        document.getElementById(
            "myHours"
        );

    if (
        !mySignups ||
        !myHours
    ) {
        return;
    }

    let wrapper =
        document.getElementById(
            "combinedVolunteerActivity"
        );

    if (!wrapper) {

        wrapper =
            document.createElement(
                "div"
            );

        wrapper.id =
            "combinedVolunteerActivity";

        wrapper.style.cssText = `
            width: 100%;
            box-sizing: border-box;
            margin-top: 20px;
            padding: 24px;
            border-radius: 16px;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
        `;

        const heading =
            document.createElement(
                "h2"
            );

        heading.textContent =
            "My Volunteer Activity";

        heading.style.margin =
            "0 0 20px 0";

        wrapper.appendChild(
            heading
        );

        mySignups.parentNode.insertBefore(
            wrapper,
            mySignups
        );

        wrapper.appendChild(
            mySignups
        );

        wrapper.appendChild(
            myHours
        );
    }

    mySignups.style.background =
        "transparent";

    mySignups.style.border =
        "none";

    mySignups.style.boxShadow =
        "none";

    myHours.style.background =
        "transparent";

    myHours.style.border =
        "none";

    myHours.style.boxShadow =
        "none";

    myHours.classList.remove(
        "hidden"
    );

    myHours.style.display =
        "block";
}


/* ========================================
   LOAD MY ACTIVITY
========================================= */

async function loadMyActivity() {

    try {

        const user =
            getSavedUser();

        if (!user) {

            alert(
                "Please login first."
            );

            return;
        }

        if (
            user.role !== "volunteer"
        ) {

            alert(
                "My Volunteer Activity is only available for volunteers."
            );

            return;
        }

        setupCombinedVolunteerActivity();

        const [
            signupsResponse,
            hoursResponse
        ] =
            await Promise.all([
                authenticatedFetch(
                    `${API_BASE_URL}/api/signups/user/${user._id}`
                ),

                authenticatedFetch(
                    `${API_BASE_URL}/api/hours/user/${user._id}`
                )
            ]);

        const signups =
            await signupsResponse.json();

        const hours =
            await hoursResponse.json();

        if (!signupsResponse.ok) {

            throw new Error(
                signups.message ||
                "Could not load signups."
            );
        }

        if (!hoursResponse.ok) {

            throw new Error(
                hours.message ||
                "Could not load volunteer hours."
            );
        }

        renderVolunteerActivity(
            signups,
            hours
        );

    } catch (error) {

        console.error(
            "Load volunteer activity error:",
            error
        );

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   RENDER VOLUNTEER ACTIVITY
========================================= */

function renderVolunteerActivity(
    signups,
    hours
) {

    const signupList =
        document.getElementById(
            "signupList"
        );

    if (!signupList) {
        return;
    }

    const hoursMap =
        new Map();

    let totalHours =
        0;

    if (
        Array.isArray(hours)
    ) {

        hours.forEach(
            (record) => {

                const opportunity =
                    record.opportunity;

                const opportunityId =
                    opportunity?._id ||
                    record.opportunity;

                if (!opportunityId) {
                    return;
                }

                hoursMap.set(
                    opportunityId.toString(),
                    record
                );

                totalHours +=
                    Number(
                        record.hours || 0
                    );
            }
        );
    }

    signupList.innerHTML =
        "";

    const totalBox =
        document.createElement(
            "div"
        );

    totalBox.style.cssText = `
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.04);
    `;

    totalBox.innerHTML = `

        <strong>
            Total Volunteer Hours:
            ${totalHours}
        </strong>

    `;

    signupList.appendChild(
        totalBox
    );

    if (
        !signups ||
        signups.length === 0
    ) {

        signupList.innerHTML += `

            <p class="empty-message">
                You have no signups yet.
            </p>

        `;

        renderHoursSummary(
            hours
        );

        return;
    }

    signups.forEach(
        (signup) => {

            const opportunity =
                signup.opportunity;

            if (!opportunity) {
                return;
            }

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "signup-card";

            const hourRecord =
                hoursMap.get(
                    opportunity._id.toString()
                );

            let actionButton =
                "";

            if (
                signup.status === "completed"
            ) {

                actionButton = `

                    <button
                        class="primary-button"
                        onclick="generateCertificate('${opportunity._id}')"
                    >
                        Generate Certificate
                    </button>

                `;

            } else if (
                signup.status === "registered"
            ) {

                actionButton = `

                    <button
                        class="secondary-button"
                        onclick="cancelSignup('${signup._id}')"
                    >
                        Cancel Signup
                    </button>

                `;
            }

            const photoHtml =
                opportunity.photoUrl
                    ? `
                        <img
                            src="${escapeHtml(
                                opportunity.photoUrl
                            )}"
                            alt="${escapeHtml(
                                opportunity.title
                            )}"
                            style="
                                width: 100%;
                                max-height: 180px;
                                object-fit: cover;
                                border-radius: 10px;
                                margin-bottom: 12px;
                            "
                        >
                    `
                    : "";

            const hoursHtml =
                hourRecord
                    ? `

                        <p>
                            <strong>
                                Volunteer Hours:
                            </strong>

                            ${escapeHtml(
                                hourRecord.hours
                            )}
                        </p>

                        <p>
                            <strong>
                                Hours Verified:
                            </strong>

                            ${
                                hourRecord.verified
                                    ? "Yes"
                                    : "No"
                            }
                        </p>

                    `
                    : `

                        <p>
                            <strong>
                                Volunteer Hours:
                            </strong>

                            Not recorded yet
                        </p>

                    `;

            card.innerHTML = `

                ${photoHtml}

                <h3>
                    ${escapeHtml(
                        opportunity.title
                    )}
                </h3>

                <p>
                    <strong>
                        Location:
                    </strong>

                    ${escapeHtml(
                        opportunity.location
                    )}
                </p>

                <p>
                    <strong>
                        Date:
                    </strong>

                    ${formatDate(
                        opportunity.date
                    )}
                </p>

                <p>
                    <strong>
                        Status:
                    </strong>

                    ${escapeHtml(
                        signup.status
                    )}
                </p>

                ${hoursHtml}

                <div
                    style="
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        margin-top: 12px;
                    "
                >

                    ${actionButton}

                </div>

            `;

            signupList.appendChild(
                card
            );

        }
    );

    renderHoursSummary(
        hours
    );
}


/* ========================================
   RENDER HOURS SUMMARY
========================================= */

function renderHoursSummary(
    hours
) {

    const myHours =
        document.getElementById(
            "myHours"
        );

    if (!myHours) {
        return;
    }

    const hoursList =
        document.getElementById(
            "hoursList"
        );

    if (!hoursList) {
        return;
    }

    hoursList.innerHTML =
        "";

    if (
        !hours ||
        hours.length === 0
    ) {

        hoursList.innerHTML = `

            <p class="empty-message">
                No volunteer hours recorded yet.
            </p>

        `;

        return;
    }

    hours.forEach(
        (record) => {

            const opportunity =
                record.opportunity;

            if (!opportunity) {
                return;
            }

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "hours-card";

            card.innerHTML = `

                <h3>
                    ${escapeHtml(
                        opportunity.title
                    )}
                </h3>

                <p>
                    <strong>
                        Hours:
                    </strong>

                    ${escapeHtml(
                        record.hours
                    )}
                </p>

                <p>
                    <strong>
                        Verified:
                    </strong>

                    ${
                        record.verified
                            ? "Yes"
                            : "No"
                    }
                </p>

            `;

            hoursList.appendChild(
                card
            );

        }
    );
}


/* ========================================
   LOAD MY SIGNUPS
========================================= */

async function loadMySignups() {
    await loadMyActivity();
}


/* ========================================
   LOAD MY HOURS
========================================= */

async function loadMyHours() {
    await loadMyActivity();
}


/* ========================================
   CANCEL SIGNUP
========================================= */

async function cancelSignup(
    signupId
) {

    try {

        const user =
            getSavedUser();

        if (!user) {

            alert(
                "Please login first."
            );

            return;
        }

        const confirmed =
            confirm(
                "Are you sure you want to cancel this signup?"
            );

        if (!confirmed) {
            return;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/signups/${signupId}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not cancel signup:\n\n" +
                data.message
            );

            return;
        }

        alert(
            "Signup cancelled successfully!"
        );

        await loadMyActivity();

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   GENERATE CERTIFICATE
========================================= */

async function generateCertificate(
    opportunityId
) {

    try {

        const user =
            getSavedUser();

        if (
            !user ||
            user.role !== "volunteer"
        ) {

            alert(
                "Please login as a volunteer first."
            );

            return;
        }

        const confirmed =
            confirm(
                "Generate your volunteer certificate for this event?"
            );

        if (!confirmed) {
            return;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/certificates/${opportunityId}`,
                {
                    method: "POST"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not generate certificate:\n\n" +
                data.message
            );

            return;
        }

        const certificate =
            data.certificate;

        if (
            certificate &&
            certificate.certificateUrl
        ) {

            alert(
                "Certificate is ready!"
            );

            window.open(
                certificate.certificateUrl,
                "_blank"
            );

        } else {

            alert(
                "Certificate was generated, but its download link was not returned."
            );
        }

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   UPLOAD ORGANIZATION LOGO
========================================= */

async function uploadOrganizationLogo() {

    const fileInput =
        document.getElementById(
            "organizationLogo"
        );

    const status =
        document.getElementById(
            "organizationLogoStatus"
        );

    const file =
        fileInput?.files?.[0];

    if (!file) {

        alert(
            "Please select a logo image first."
        );

        return;
    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Logo image must be smaller than 5 MB."
        );

        return;
    }

    try {

        if (status) {
            status.textContent =
                "Uploading logo...";
        }

        const formData =
            new FormData();

        formData.append(
            "logo",
            file
        );

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/organizations/logo`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            if (status) {
                status.textContent = "";
            }

            alert(
                "Could not upload logo:\n\n" +
                (
                    data.message ||
                    "Upload failed"
                )
            );

            return;
        }

        const user =
            getSavedUser();

        if (user) {

            user.logoUrl =
                data.logoUrl || "";

            saveUser(user);
        }

        if (status) {

            status.textContent =
                "Logo uploaded successfully!";
        }

        fileInput.value = "";

        alert(
            "Organization logo uploaded successfully!"
        );

    } catch (error) {

        if (status) {
            status.textContent = "";
        }

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   EVENT PHOTO INPUT
========================================= */

function ensureEventPhotoInput() {

    const form =
        document.getElementById(
            "createOpportunityForm"
        );

    if (!form) {
        return;
    }

    if (
        document.getElementById(
            "eventPhoto"
        )
    ) {
        return;
    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "form-group";

    wrapper.id =
        "eventPhotoWrapper";

    wrapper.innerHTML = `

        <label
            for="eventPhoto"
        >
            Event Photo
        </label>

        <input
            type="file"
            id="eventPhoto"
            accept="image/*"
        >

        <p
            id="eventPhotoStatus"
            class="modal-description"
        >
            Optional. Maximum size: 5 MB.
        </p>

    `;

    form.appendChild(
        wrapper
    );
}


/* ========================================
   UPLOAD EVENT PHOTO
========================================= */

async function uploadEventPhoto(
    opportunityId,
    file
) {

    if (!file) {
        return null;
    }

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        throw new Error(
            "Event photo must be smaller than 5 MB."
        );
    }

    const formData =
        new FormData();

    formData.append(
        "photo",
        file
    );

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/api/opportunities/${opportunityId}/photo`,
            {
                method: "POST",
                body: formData
            }
        );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Event photo upload failed"
        );
    }

    return data;
}


/* ========================================
   CREATE OPPORTUNITY
========================================= */

async function createOpportunity() {

    const title =
        document
            .getElementById(
                "eventTitle"
            )
            .value
            .trim();

    const category =
        document
            .getElementById(
                "eventCategory"
            )
            .value
            .trim();

    const requiredVolunteers =
        document
            .getElementById(
                "eventVolunteers"
            )
            .value;

    const description =
        document
            .getElementById(
                "eventDescription"
            )
            .value
            .trim();

    const location =
        document
            .getElementById(
                "eventLocation"
            )
            .value
            .trim();

    const date =
        document
            .getElementById(
                "eventDate"
            )
            .value;

    const startTime =
        document
            .getElementById(
                "eventStartTime"
            )
            .value;

    const endTime =
        document
            .getElementById(
                "eventEndTime"
            )
            .value;

    const photoInput =
        document.getElementById(
            "eventPhoto"
        );

    const photoFile =
        photoInput?.files?.[0] ||
        null;

    if (
        !title ||
        !category ||
        !requiredVolunteers ||
        !description ||
        !location ||
        !date ||
        !startTime ||
        !endTime
    ) {

        alert(
            "Please fill in all opportunity fields."
        );

        return;
    }

    if (
        endTime <= startTime
    ) {

        alert(
            "End Time must be later than Start Time."
        );

        return;
    }

    if (
        photoFile &&
        photoFile.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Event photo must be smaller than 5 MB."
        );

        return;
    }

    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/opportunities`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title,

                        description,

                        location,

                        date,

                        startTime,

                        endTime,

                        requiredVolunteers:
                            Number(
                                requiredVolunteers
                            ),

                        category

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not create opportunity:\n\n" +
                data.message
            );

            return;
        }

        if (
            photoFile &&
            data._id
        ) {

            const status =
                document.getElementById(
                    "eventPhotoStatus"
                );

            if (status) {

                status.textContent =
                    "Event created. Uploading photo...";
            }

            try {

                await uploadEventPhoto(
                    data._id,
                    photoFile
                );

            } catch (photoError) {

                console.error(
                    "Event photo upload error:",
                    photoError
                );

                alert(
                    "The opportunity was created, but the event photo could not be uploaded:\n\n" +
                    photoError.message
                );
            }
        }

        alert(
            "Opportunity created successfully!"
        );

        document.getElementById(
            "eventTitle"
        ).value = "";

        document.getElementById(
            "eventCategory"
        ).value = "General";

        document.getElementById(
            "eventVolunteers"
        ).value = "";

        document.getElementById(
            "eventDescription"
        ).value = "";

        document.getElementById(
            "eventLocation"
        ).value = "";

        document.getElementById(
            "eventDate"
        ).value = "";

        document.getElementById(
            "eventStartTime"
        ).value = "";

        document.getElementById(
            "eventEndTime"
        ).value = "";

        if (photoInput) {
            photoInput.value = "";
        }

        const photoStatus =
            document.getElementById(
                "eventPhotoStatus"
            );

        if (photoStatus) {

            photoStatus.textContent =
                "Optional. Maximum size: 5 MB.";
        }

        closeModal(
            "organizationDashboard"
        );

        await loadOpportunities();

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   EDIT OPPORTUNITY
========================================= */

async function editOpportunity(
    id
) {

    try {

        const getResponse =
            await fetch(
                `${API_BASE_URL}/api/opportunities/${id}`
            );

        const opportunity =
            await getResponse.json();

        if (!getResponse.ok) {

            alert(
                "Could not load opportunity:\n\n" +
                opportunity.message
            );

            return;
        }

        const title =
            prompt(
                "Enter opportunity title:",
                opportunity.title
            );

        if (title === null) {
            return;
        }

        const description =
            prompt(
                "Enter opportunity description:",
                opportunity.description
            );

        if (description === null) {
            return;
        }

        const location =
            prompt(
                "Enter opportunity location:",
                opportunity.location
            );

        if (location === null) {
            return;
        }

        const requiredVolunteers =
            prompt(
                "Enter required volunteers:",
                opportunity.requiredVolunteers
            );

        if (
            requiredVolunteers === null
        ) {
            return;
        }

        const category =
            prompt(
                "Enter category:",
                opportunity.category
            );

        if (category === null) {
            return;
        }

        const status =
            prompt(
                "Enter status (open or closed):",
                opportunity.status
            );

        if (status === null) {
            return;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/opportunities/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title:
                            title.trim(),

                        description:
                            description.trim(),

                        location:
                            location.trim(),

                        requiredVolunteers:
                            Number(
                                requiredVolunteers
                            ),

                        category:
                            category.trim(),

                        status:
                            status.trim()

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not update opportunity:\n\n" +
                data.message
            );

            return;
        }

        alert(
            "Opportunity updated successfully!"
        );

        await loadOpportunities();

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   DELETE OPPORTUNITY
========================================= */

async function deleteOpportunity(
    id
) {

    try {

        const confirmed =
            confirm(
                "Are you sure you want to delete this opportunity?"
            );

        if (!confirmed) {
            return;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/opportunities/${id}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not delete opportunity:\n\n" +
                data.message
            );

            return;
        }

        alert(
            "Opportunity deleted successfully!"
        );

        await loadOpportunities();

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   VOLUNTEER MANAGEMENT MODAL
========================================= */

function closeVolunteerManagementModal() {

    const modal =
        document.getElementById(
            "volunteerManagementModal"
        );

    if (modal) {
        modal.remove();
    }
}


function createVolunteerManagementModal() {

    closeVolunteerManagementModal();

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "volunteerManagementModal";

    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    modal.innerHTML = `

        <div
            style="
                background: white;
                width: 100%;
                max-width: 700px;
                max-height: 85vh;
                overflow-y: auto;
                border-radius: 16px;
                padding: 25px;
                box-sizing: border-box;
            "
        >

            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                "
            >

                <h2
                    id="volunteerManagementTitle"
                    style="margin: 0;"
                >
                    Event Volunteers
                </h2>

                <button
                    type="button"
                    onclick="closeVolunteerManagementModal()"
                    class="secondary-button"
                >
                    Close
                </button>

            </div>

            <div
                id="volunteerManagementContent"
                style="margin-top: 20px;"
            >
                Loading volunteers...
            </div>

        </div>

    `;

    document.body.appendChild(
        modal
    );

    return modal;
}


/* ========================================
   MANAGE EVENT VOLUNTEERS
========================================= */

async function manageOpportunityVolunteers(
    opportunityId
) {

    try {

        const user =
            getSavedUser();

        if (
            !user ||
            user.role !== "organization"
        ) {

            alert(
                "Only organizations can manage volunteers."
            );

            return;
        }

        const modal =
            createVolunteerManagementModal();

        const content =
            document.getElementById(
                "volunteerManagementContent"
            );

        const title =
            document.getElementById(
                "volunteerManagementTitle"
            );

        const opportunityResponse =
            await fetch(
                `${API_BASE_URL}/api/opportunities/${opportunityId}`
            );

        const opportunity =
            await opportunityResponse.json();

        if (!opportunityResponse.ok) {

            throw new Error(
                opportunity.message ||
                "Could not load event"
            );
        }

        if (title) {

            title.textContent =
                `Volunteers - ${opportunity.title}`;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/signups/opportunity/${opportunityId}`
            );

        const signups =
            await response.json();

        if (!response.ok) {

            throw new Error(
                signups.message ||
                "Could not load volunteers"
            );
        }

        if (
            !signups ||
            signups.length === 0
        ) {

            content.innerHTML = `

                <p class="empty-message">
                    No volunteers have signed up for this event yet.
                </p>

            `;

            return;
        }

        content.innerHTML =
            "";

        signups.forEach(
            (signup) => {

                const volunteer =
                    signup.volunteer;

                const item =
                    document.createElement(
                        "div"
                    );

                item.style.cssText = `
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 12px;
                `;

                let actionHtml =
                    "";

                if (
                    signup.status ===
                    "registered"
                ) {

                    actionHtml = `

                        <button
                            class="primary-button"
                            onclick="completeVolunteer('${signup._id}', '${opportunityId}')"
                        >
                            Mark Completed
                        </button>

                    `;

                } else if (
                    signup.status ===
                    "completed"
                ) {

                    actionHtml = `

                        <span
                            style="
                                display: inline-block;
                                padding: 6px 10px;
                                border-radius: 8px;
                                background: #e8f7ec;
                            "
                        >
                            Completed
                        </span>

                    `;
                }

                item.innerHTML = `

                    <h3>
                        ${escapeHtml(
                            volunteer?.name ||
                            "Volunteer"
                        )}
                    </h3>

                    <p>
                        <strong>
                            Email:
                        </strong>

                        ${escapeHtml(
                            volunteer?.email ||
                            "Not available"
                        )}
                    </p>

                    ${
                        volunteer?.phone
                            ? `
                                <p>
                                    <strong>
                                        Phone:
                                    </strong>

                                    ${escapeHtml(
                                        volunteer.phone
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <p>
                        <strong>
                            Status:
                        </strong>

                        ${escapeHtml(
                            signup.status
                        )}
                    </p>

                    <div
                        style="
                            margin-top: 10px;
                        "
                    >
                        ${actionHtml}
                    </div>

                `;

                content.appendChild(
                    item
                );

            }
        );

    } catch (error) {

        console.error(
            "Manage volunteers error:",
            error
        );

        closeVolunteerManagementModal();

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   COMPLETE VOLUNTEER
========================================= */

async function completeVolunteer(
    signupId,
    opportunityId
) {

    try {

        const hoursInput =
            prompt(
                "Enter the volunteer hours completed:"
            );

        if (
            hoursInput === null
        ) {
            return;
        }

        const hours =
            Number(
                hoursInput
            );

        if (
            !Number.isFinite(hours) ||
            hours <= 0
        ) {

            alert(
                "Please enter a valid number of hours greater than zero."
            );

            return;
        }

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/api/signups/${signupId}/complete`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        hours
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Could not complete volunteer:\n\n" +
                data.message
            );

            return;
        }

        alert(
            "Volunteer marked as completed and hours verified!"
        );

        await manageOpportunityVolunteers(
            opportunityId
        );

        await loadOpportunities();

    } catch (error) {

        handleAuthenticationError(
            error
        );
    }
}


/* ========================================
   OPEN ORGANIZATION DASHBOARD
========================================= */

function openOrganizationDashboard() {

    const user =
        getSavedUser();

    if (!user) {

        alert(
            "Please login first."
        );

        return;
    }

    if (
        user.role !== "organization"
    ) {

        alert(
            "Only organizations can create opportunities."
        );

        return;
    }

    openModal(
        "organizationDashboard"
    );

    ensureEventPhotoInput();

    setTimeout(
        function () {

            const title =
                document.getElementById(
                    "eventTitle"
                );

            if (title) {
                title.focus();
            }

        },
        100
    );
}


/* ========================================
   MODAL HELPERS
========================================= */

function openModal(id) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    modal.style.display =
        "flex";
}


function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );

    modal.style.display =
        "none";
}


/* ========================================
   UPDATE NAVBAR
========================================= */

function updateNavbar(user) {

    const loginButton =
        document.getElementById(
            "loginButton"
        );

    const registerButton =
        document.getElementById(
            "registerButton"
        );

    const createOrganizationButton =
        document.getElementById(
            "createOrganizationButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (
        !loginButton ||
        !registerButton ||
        !createOrganizationButton ||
        !logoutButton
    ) {
        return;
    }

    if (!user) {

        loginButton.classList.remove(
            "hidden"
        );

        registerButton.classList.remove(
            "hidden"
        );

        createOrganizationButton.classList.add(
            "hidden"
        );

        logoutButton.classList.add(
            "hidden"
        );

        return;
    }

    loginButton.classList.add(
        "hidden"
    );

    registerButton.classList.add(
        "hidden"
    );

    logoutButton.classList.remove(
        "hidden"
    );

    if (
        user.role === "organization"
    ) {

        createOrganizationButton.classList.remove(
            "hidden"
        );

    } else {

        createOrganizationButton.classList.add(
            "hidden"
        );
    }
}


/* ========================================
   UPDATE USER SECTIONS
========================================= */

function updateUserSections(
    user
) {

    const volunteerArea =
        document.getElementById(
            "volunteerArea"
        );

    const mySignups =
        document.getElementById(
            "mySignups"
        );

    const myHours =
        document.getElementById(
            "myHours"
        );

    if (
        !volunteerArea ||
        !mySignups ||
        !myHours
    ) {
        return;
    }

    if (
        user &&
        user.role === "volunteer"
    ) {

        volunteerArea.classList.remove(
            "hidden"
        );

        mySignups.classList.remove(
            "hidden"
        );

        myHours.classList.remove(
            "hidden"
        );

        setupCombinedVolunteerActivity();

    } else {

        volunteerArea.classList.add(
            "hidden"
        );

        mySignups.classList.add(
            "hidden"
        );

        myHours.classList.add(
            "hidden"
        );
    }
}


/* ========================================
   LOGIN
========================================= */

async function loginUser() {

    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;

    if (
        !email ||
        !password
    ) {

        alert(
            "Please enter email and password."
        );

        return;
    }

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const firebaseUser =
            userCredential.user;

        const token =
            await firebaseUser.getIdToken(
                true
            );

        localStorage.setItem(
            "firebaseToken",
            token
        );

        const response =
            await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Login failed: " +
                data.message
            );

            return;
        }

        saveUser(
            data.user
        );

        updateNavbar(
            data.user
        );

        updateUserSections(
            data.user
        );

        closeModal(
            "loginModal"
        );

        alert(
            "Login successful!"
        );

        if (
            data.user.role === "volunteer"
        ) {

            await loadMyActivity();
        }

        /*
         * Important:
         * Refresh the event cards after login
         * so organization management buttons
         * appear immediately.
         */

        await loadOpportunities();

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Login failed: " +
            error.message
        );
    }
}


/* ========================================
   REGISTER
========================================= */

async function registerUser() {

    const name =
        document
            .getElementById(
                "registerName"
            )
            .value
            .trim();

    const email =
        document
            .getElementById(
                "registerEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "registerPassword"
            )
            .value;

    const phone =
        document
            .getElementById(
                "registerPhone"
            )
            .value
            .trim();

    const role =
        document
            .getElementById(
                "registerRole"
            )
            .value;

    if (
        !name ||
        !email ||
        !password ||
        !role
    ) {

        alert(
            "Please fill in all required fields."
        );

        return;
    }

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const firebaseUser =
            userCredential.user;

        const token =
            await firebaseUser.getIdToken(
                true
            );

        const response =
            await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        name,

                        phone,

                        role

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "Account was created in Firebase, " +
                "but the HelpHub profile could not be created.\n\n" +
                data.message
            );

            return;
        }

        localStorage.setItem(
            "firebaseToken",
            token
        );

        saveUser(
            data
        );

        updateNavbar(
            data
        );

        updateUserSections(
            data
        );

        closeModal(
            "registerModal"
        );

        alert(
            "Account created successfully!"
        );

        document.getElementById(
            "registerName"
        ).value = "";

        document.getElementById(
            "registerEmail"
        ).value = "";

        document.getElementById(
            "registerPassword"
        ).value = "";

        document.getElementById(
            "registerPhone"
        ).value = "";

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        alert(
            "Registration failed: " +
            error.message
        );
    }
}


/* ========================================
   RESTORE LOGIN
========================================= */

function restoreLogin() {

    const user =
        getSavedUser();

    if (!user) {

        updateNavbar(
            null
        );

        updateUserSections(
            null
        );

        return;
    }

    updateNavbar(
        user
    );

    updateUserSections(
        user
    );
}


/* ========================================
   LOGOUT
========================================= */

async function logoutUser() {

    try {

        await signOut(
            auth
        );

        localStorage.removeItem(
            "firebaseToken"
        );

        localStorage.removeItem(
            "helphubUser"
        );

        closeModal(
            "organizationDashboard"
        );

        closeModal(
            "loginModal"
        );

        closeModal(
            "registerModal"
        );

        closeVolunteerManagementModal();

        updateNavbar(
            null
        );

        updateUserSections(
            null
        );

        alert(
            "Logged out successfully."
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Logout failed: " +
            error.message
        );
    }
}


/* ========================================
   INITIALIZE PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        restoreLogin();

        setupCombinedVolunteerActivity();

        ensureEventPhotoInput();


        /* LOGIN */

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        if (loginButton) {

            loginButton.addEventListener(
                "click",
                function () {

                    openModal(
                        "loginModal"
                    );

                }
            );
        }


        /* REGISTER */

        const registerButton =
            document.getElementById(
                "registerButton"
            );

        if (registerButton) {

            registerButton.addEventListener(
                "click",
                function () {

                    openModal(
                        "registerModal"
                    );

                }
            );
        }


        /* CLOSE LOGIN */

        const closeLogin =
            document.getElementById(
                "closeLogin"
            );

        if (closeLogin) {

            closeLogin.addEventListener(
                "click",
                function () {

                    closeModal(
                        "loginModal"
                    );

                }
            );
        }


        /* CLOSE REGISTER */

        const closeRegister =
            document.getElementById(
                "closeRegister"
            );

        if (closeRegister) {

            closeRegister.addEventListener(
                "click",
                function () {

                    closeModal(
                        "registerModal"
                    );

                }
            );
        }


        /* SWITCH TO REGISTER */

        const switchToRegisterButton =
            document.getElementById(
                "switchToRegisterButton"
            );

        if (switchToRegisterButton) {

            switchToRegisterButton.addEventListener(
                "click",
                function () {

                    closeModal(
                        "loginModal"
                    );

                    openModal(
                        "registerModal"
                    );

                }
            );
        }


        /* SWITCH TO LOGIN */

        const switchToLoginButton =
            document.getElementById(
                "switchToLoginButton"
            );

        if (switchToLoginButton) {

            switchToLoginButton.addEventListener(
                "click",
                function () {

                    closeModal(
                        "registerModal"
                    );

                    openModal(
                        "loginModal"
                    );

                }
            );
        }


        /* LOGIN SUBMIT */

        const loginSubmitButton =
            document.getElementById(
                "loginSubmitButton"
            );

        if (loginSubmitButton) {

            loginSubmitButton.addEventListener(
                "click",
                function () {

                    loginUser();

                }
            );
        }


        /* REGISTER SUBMIT */

        const registerSubmitButton =
            document.getElementById(
                "registerSubmitButton"
            );

        if (registerSubmitButton) {

            registerSubmitButton.addEventListener(
                "click",
                function () {

                    registerUser();

                }
            );
        }


        /* CREATE ORGANIZATION */

        const createOrganizationButton =
            document.getElementById(
                "createOrganizationButton"
            );

        if (createOrganizationButton) {

            createOrganizationButton.addEventListener(
                "click",
                function () {

                    openOrganizationDashboard();

                }
            );
        }


        /* UPLOAD LOGO */

        const uploadLogoButton =
            document.getElementById(
                "uploadOrganizationLogoButton"
            );

        if (uploadLogoButton) {

            uploadLogoButton.addEventListener(
                "click",
                function () {

                    uploadOrganizationLogo();

                }
            );
        }


        /* CLOSE ORGANIZATION */

        const closeOrganization =
            document.getElementById(
                "closeOrganization"
            );

        if (closeOrganization) {

            closeOrganization.addEventListener(
                "click",
                function () {

                    closeModal(
                        "organizationDashboard"
                    );

                }
            );
        }


        /* CREATE OPPORTUNITY */

        const createOpportunityForm =
            document.getElementById(
                "createOpportunityForm"
            );

        if (createOpportunityForm) {

            createOpportunityForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    createOpportunity();

                }
            );
        }


        /* EXPLORE */

        const exploreButton =
            document.getElementById(
                "exploreButton"
            );

        if (exploreButton) {

            exploreButton.addEventListener(
                "click",
                function () {

                    const section =
                        document.getElementById(
                            "opportunitiesSection"
                        );

                    if (section) {

                        section.scrollIntoView({
                            behavior:
                                "smooth"
                        });
                    }

                }
            );
        }


        /* SEARCH */

        const searchButton =
            document.getElementById(
                "searchButton"
            );

        if (searchButton) {

            searchButton.addEventListener(
                "click",
                function () {

                    searchOpportunities();

                }
            );
        }


        /* SHOW ALL */

        const showAllButton =
            document.getElementById(
                "showAllButton"
            );

        if (showAllButton) {

            showAllButton.addEventListener(
                "click",
                function () {

                    loadOpportunities();

                }
            );
        }


        /* SEARCH ENTER */

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        searchOpportunities();

                    }

                }
            );
        }


        /* LOGOUT */

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                function () {

                    logoutUser();

                }
            );
        }

    }
);


/* ========================================
   FIREBASE AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    async (firebaseUser) => {

        if (!firebaseUser) {

            localStorage.removeItem(
                "firebaseToken"
            );

            localStorage.removeItem(
                "helphubUser"
            );

            updateNavbar(
                null
            );

            updateUserSections(
                null
            );

            return;
        }

        const savedUser =
            getSavedUser();

        if (savedUser) {

            updateNavbar(
                savedUser
            );

            updateUserSections(
                savedUser
            );
        }

        try {

            const token =
                await firebaseUser.getIdToken(
                    true
                );

            localStorage.setItem(
                "firebaseToken",
                token
            );

            /*
             * Reload the opportunities after
             * Firebase restores the session.
             *
             * This is what makes the organization
             * Edit/Delete/Manage buttons appear
             * without requiring another action.
             */

            await loadOpportunities();


            if (
                savedUser &&
                savedUser.role === "volunteer"
            ) {

                await loadMyActivity();
            }

        } catch (error) {

            console.error(
                "Could not restore Firebase session:",
                error
            );
        }
    }
);


/* ========================================
   MAKE FUNCTIONS AVAILABLE TO HTML
========================================= */

window.loadOpportunities =
    loadOpportunities;

window.searchOpportunities =
    searchOpportunities;

window.viewOpportunity =
    viewOpportunity;

window.closeDetails =
    closeDetails;

window.signupForOpportunity =
    signupForOpportunity;

window.loadMySignups =
    loadMySignups;

window.loadMyHours =
    loadMyHours;

window.cancelSignup =
    cancelSignup;

window.loginUser =
    loginUser;

window.registerUser =
    registerUser;

window.createOpportunity =
    createOpportunity;

window.uploadOrganizationLogo =
    uploadOrganizationLogo;

window.uploadEventPhoto =
    uploadEventPhoto;

window.editOpportunity =
    editOpportunity;

window.deleteOpportunity =
    deleteOpportunity;

window.openOrganizationDashboard =
    openOrganizationDashboard;

window.closeOrganizationDashboard =
    function () {

        closeModal(
            "organizationDashboard"
        );

    };

window.manageOpportunityVolunteers =
    manageOpportunityVolunteers;

window.closeVolunteerManagementModal =
    closeVolunteerManagementModal;

window.completeVolunteer =
    completeVolunteer;

window.generateCertificate =
    generateCertificate;

window.logoutUser =
    logoutUser;