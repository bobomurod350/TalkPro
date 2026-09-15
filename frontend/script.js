/* =========================================
   TALKPRO — MAIN SCRIPT
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE =
    `${window.location.protocol}//${window.location.hostname}:3000`;


/* =========================================
   MOBILE MENU
========================================= */

const menuButton =
    document.getElementById("menuButton");

const nav =
    document.getElementById("nav");

if (menuButton && nav) {

    menuButton.addEventListener(
        "click",
        () => {

            nav.classList.toggle(
                "active"
            );

        }
    );

}


/* Close mobile menu after click */

const navLinks =
    document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        () => {

            if (nav) {

                nav.classList.remove(
                    "active"
                );

            }

        }
    );

});


/* =========================================
   CURRENT YEAR
========================================= */

const year =
    document.getElementById("year");

if (year) {

    year.textContent =
        new Date().getFullYear();

}


/* =========================================
   REGISTRATION FORM
========================================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "name"
                ).value.trim();

            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();

            const language =
                document.getElementById(
                    "language"
                ).value;

            const level =
                document.getElementById(
                    "level"
                ).value;

            const course =
                document.getElementById(
                    "course"
                ).value;


            /* Validate */

            if (
                !name ||
                !phone ||
                !language ||
                !level ||
                !course
            ) {

                formMessage.textContent =
                    "❌ Please complete all fields.";

                formMessage.style.color =
                    "#f51f2d";

                formMessage.style.display =
                    "block";

                return;
            }


            /* Loading */

            formMessage.textContent =
                "⏳ Sending registration...";

            formMessage.style.color =
                "#0755d9";

            formMessage.style.display =
                "block";


            const submitButton =
                registerForm.querySelector(
                    ".submit-button"
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.dataset.originalText =
                    submitButton.textContent;

                submitButton.textContent =
                    "Sending...";
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    phone,
                                    language,
                                    level,
                                    course
                                })
                        }
                    );


                const data =
                    await response.json();


                /* Success */

                if (
                    response.ok &&
                    data.success
                ) {

                    formMessage.innerHTML = `
                        <div class="registration-success">

                            <div class="success-icon">
                                ✓
                            </div>

                            <h4>
                                Registration Successful!
                            </h4>

                            <p>
                                Thank you, ${name}! Your registration
                                has been received successfully.
                            </p>

                        </div>
                    `;

                    formMessage.style.display =
                        "block";


                    registerForm.reset();


                    if (submitButton) {

                        submitButton.textContent =
                            "Registered ✓";

                        submitButton.classList.add(
                            "success"
                        );
                    }


                    setTimeout(() => {

                        if (submitButton) {

                            submitButton.disabled =
                                false;

                            submitButton.classList.remove(
                                "success"
                            );

                            submitButton.textContent =
                                submitButton.dataset.originalText ||
                                "Submit Registration →";
                        }

                    }, 2500);


                } else {

                    formMessage.textContent =
                        `❌ ${
                            data.message ||
                            "Registration failed."
                        }`;

                    formMessage.style.color =
                        "#f51f2d";

                    formMessage.style.display =
                        "block";


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            submitButton.dataset.originalText ||
                            "Submit Registration →";
                    }

                }

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                formMessage.textContent =
                    "❌ Cannot connect to TalkPro server. Please try again.";

                formMessage.style.color =
                    "#f51f2d";

                formMessage.style.display =
                    "block";


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        submitButton.dataset.originalText ||
                        "Submit Registration →";
                }

            }

        }
    );

}


/* =========================================
   LOAD COURSES FOR REGISTRATION
========================================= */

async function loadRegistrationCourses() {

    const courseSelect =
        document.getElementById(
            "course"
        );


    if (!courseSelect) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/courses`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load courses"
            );
        }


        const courses =
            await response.json();


        courseSelect.innerHTML = `
            <option value="">
                Select a course
            </option>
        `;


        courses.forEach(
            (course) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    course.id;


                option.textContent =
                    `${course.name} — ${course.level} — $${Number(course.price).toFixed(0)}/month`;


                courseSelect.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );


        courseSelect.innerHTML = `
            <option value="">
                Cannot load courses
            </option>
        `;

    }

}


/* Load courses when page is ready */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRegistrationCourses();

    }
);


/* =========================================
   LIGHT / DARK MODE
========================================= */

const themeToggle =
    document.getElementById(
        "themeToggle"
    );

const themeIcon =
    themeToggle
        ? themeToggle.querySelector(
            ".theme-icon"
        )
        : null;


function applyTheme(theme) {

    if (
        !themeToggle ||
        !themeIcon
    ) {

        return;
    }


    if (theme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );


        themeIcon.textContent =
            "☀";


        themeToggle.setAttribute(
            "aria-label",
            "Включить светлую тему"
        );


        localStorage.setItem(
            "talkproTheme",
            "dark"
        );

    } else {

        document.body.classList.remove(
            "dark-mode"
        );


        themeIcon.textContent =
            "☾";


        themeToggle.setAttribute(
            "aria-label",
            "Включить тёмную тему"
        );


        localStorage.setItem(
            "talkproTheme",
            "light"
        );
    }

}


if (
    themeToggle &&
    themeIcon
) {

    const savedTheme =
        localStorage.getItem(
            "talkproTheme"
        );


    applyTheme(
        savedTheme === "dark"
            ? "dark"
            : "light"
    );


    themeToggle.addEventListener(
        "click",
        () => {

            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            applyTheme(
                isDark
                    ? "light"
                    : "dark"
            );

        }
    );

}


/* =========================================
   NAVBAR ACTIVE ITEM
========================================= */

const mainNavLinks =
    document.querySelectorAll(
        ".nav-link"
    );

const mainSections =
    document.querySelectorAll(
        "main section[id]"
    );


function setActiveNav(link) {

    mainNavLinks.forEach(
        (item) => {

            item.classList.remove(
                "active"
            );

        }
    );


    if (link) {

        link.classList.add(
            "active"
        );

    }

}


/* Click */

mainNavLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                setActiveNav(
                    link
                );

            }
        );

    }
);


/* Scroll */

if (
    mainNavLinks.length &&
    mainSections.length
) {

    window.addEventListener(
        "scroll",
        () => {

            let currentSection =
                "home";


            mainSections.forEach(
                (section) => {

                    const sectionTop =
                        section.offsetTop -
                        180;


                    if (
                        window.scrollY >=
                        sectionTop
                    ) {

                        currentSection =
                            section.id;

                    }

                }
            );


            mainNavLinks.forEach(
                (link) => {

                    const target =
                        link.getAttribute(
                            "href"
                        )
                        ?.replace(
                            "#",
                            ""
                        );


                    link.classList.toggle(
                        "active",
                        target ===
                            currentSection
                    );

                }
            );

        }
    );

}


/* =========================================
   SCROLL REVEAL
========================================= */

const animatedElements =
    document.querySelectorAll(
        ".course-card, " +
        ".feature, " +
        ".about-circle, " +
        ".about-text, " +
        ".teacher-card, " +
        ".register-text, " +
        ".register-form, " +
        ".contact-item, " +
        ".section-heading"
    );


animatedElements.forEach(
    (element) => {

        if (
            element.classList.contains(
                "about-circle"
            ) ||
            element.classList.contains(
                "register-text"
            )
        ) {

            element.classList.add(
                "reveal-left"
            );

        } else if (
            element.classList.contains(
                "about-text"
            ) ||
            element.classList.contains(
                "register-form"
            )
        ) {

            element.classList.add(
                "reveal-right"
            );

        } else {

            element.classList.add(
                "reveal-up"
            );

        }

    }
);


/* Intersection Observer */

if (
    animatedElements.length
) {

    const talkproScrollObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.15,

                rootMargin:
                    "0px 0px -60px 0px"
            }
        );


    animatedElements.forEach(
        (element) => {

            talkproScrollObserver.observe(
                element
            );

        }
    );

}


/* =========================================
   SMOOTH INTERNAL LINKS
========================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(
    (link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {

                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }
);