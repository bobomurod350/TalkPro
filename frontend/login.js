// =================================
// TALKPRO ADMIN LOGIN
// =================================

const loginCard = document.querySelector(".login-card");

const usernameInput = document.getElementById("username");

const passwordInput = document.getElementById("password");

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

// =================================
// USERNAME FOCUS
// =================================

usernameInput.addEventListener("focus", () => {
    loginCard.classList.remove("password-mode");
    loginCard.classList.add("username-mode");
});

// =================================
// PASSWORD FOCUS
// =================================

passwordInput.addEventListener("focus", () => {
    loginCard.classList.remove("username-mode");
    loginCard.classList.add("password-mode");
});

// =================================
// SHOW / HIDE PASSWORD
// =================================

const passwordGroup = passwordInput.parentElement;

const eyeButton = document.createElement("button");

eyeButton.type = "button";

eyeButton.className = "password-eye";

eyeButton.innerHTML = "👁️";

eyeButton.title = "Show password";

passwordGroup.appendChild(eyeButton);

eyeButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";

        eyeButton.innerHTML = "🙈";

        eyeButton.title = "Hide password";
    } else {
        passwordInput.type = "password";

        eyeButton.innerHTML = "👁️";

        eyeButton.title = "Show password";
    }

    passwordInput.focus();
});

// =================================
// LOGIN
// =================================

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();

    const password = passwordInput.value;

    loginMessage.innerHTML = "";

    // =================================
    // CHECK ADMIN LOGIN
    // =================================

    if (
        username === "admin" &&
        password === "TalkPro123"
    ) {

        // =================================
        // SAVE BOTH ADMIN TOKENS
        // =================================

        localStorage.setItem(
            "talkproAdminToken",
            "talkpro-admin-access"
        );

        localStorage.setItem(
            "talkproAdmin",
            "true"
        );

        // =================================
        // BUTTON SUCCESS
        // =================================

        const button =
            loginForm.querySelector(".login-button");

        if (button) {
            button.innerHTML = "Signing in... ✓";

            button.disabled = true;

            button.style.pointerEvents = "none";

            button.style.background =
                "linear-gradient(135deg, #16a085, #43e324)";
        }

        // =================================
        // OPEN ADMIN PANEL
        // =================================

        setTimeout(() => {

            window.location.href = "admin.html";

        }, 500);

    } else {

        // =================================
        // WRONG LOGIN
        // =================================

        loginMessage.innerHTML = `
            <div class="error-message">
                Incorrect username or password.
            </div>
        `;

        passwordInput.value = "";

        passwordInput.focus();

    }
});