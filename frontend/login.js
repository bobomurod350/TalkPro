const loginCard =
    document.querySelector(".login-card");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


/* =================================
   PARROT COLOR REACTION
================================= */

usernameInput.addEventListener(
    "focus",
    () => {

        loginCard.classList.remove(
            "password-mode"
        );

        loginCard.classList.add(
            "username-mode"
        );

    }
);


passwordInput.addEventListener(
    "focus",
    () => {

        loginCard.classList.remove(
            "username-mode"
        );

        loginCard.classList.add(
            "password-mode"
        );

    }
);


/* =================================
   PASSWORD SHOW / HIDE
================================= */

const passwordGroup =
    passwordInput.parentElement;

const eyeButton =
    document.createElement("button");

eyeButton.type = "button";

eyeButton.className =
    "password-eye";

eyeButton.innerHTML = "👁️";

eyeButton.title =
    "Show password";

passwordGroup.appendChild(
    eyeButton
);


eyeButton.addEventListener(
    "click",
    () => {

        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type =
                "text";

            eyeButton.innerHTML =
                "🙈";

            eyeButton.title =
                "Hide password";

        } else {

            passwordInput.type =
                "password";

            eyeButton.innerHTML =
                "👁️";

            eyeButton.title =
                "Show password";
        }

        passwordInput.focus();
    }
);


/* =================================
   LOGIN
================================= */

loginForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        loginMessage.innerHTML = "";


        if (
            username === "admin" &&
            password === "TalkPro123"
        ) {

            localStorage.setItem(
                "talkproAdmin",
                "true"
            );


            const button =
                loginForm.querySelector(
                    ".login-button"
                );


            button.innerHTML =
                "Signing in... ✓";

            button.style.pointerEvents =
                "none";


            button.style.background =
                "linear-gradient(135deg, #16a085, #43e324)";


            setTimeout(() => {

                window.location.href =
                    "admin.html";

            }, 800);


        } else {

            loginMessage.innerHTML = `
                <div class="error-message">
                    Incorrect username or password.
                </div>
            `;

            passwordInput.focus();
        }

    }
);